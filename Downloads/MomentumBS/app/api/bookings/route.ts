import { NextRequest, NextResponse } from 'next/server'
import { getBookings, createBooking, upsertCustomer } from '@/lib/db'
import { staff, getStaffBySpecialty } from '@/data/staff'
import { getServiceById } from '@/data/services'
import { sendBookingConfirmation } from '@/lib/whatsapp'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const bookings = await getBookings()
    return NextResponse.json(bookings)
  } catch {
    return NextResponse.json({ error: 'Failed to load bookings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerName, customerPhone, services: serviceIds, staffId, date, time, notes } = body

    if (!customerName || !customerPhone || !serviceIds?.length || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const selectedServices = serviceIds.map((id: string) => getServiceById(id)).filter(Boolean)
    const totalPrice = selectedServices.reduce((sum: number, s: any) => sum + s.price, 0)
    const totalDuration = selectedServices.reduce((sum: number, s: any) => sum + s.duration, 0)

    // Resolve staff — auto-assign if not selected
    let resolvedStaffId = staffId
    let resolvedStaffName = 'TBD'

    if (!resolvedStaffId) {
      const firstService = selectedServices[0] as any
      const capable = getStaffBySpecialty(firstService.category)
      const allBookings = await getBookings()
      const bookedStaffIds = allBookings
        .filter((b) => b.date === date && b.time === time && b.status !== 'cancelled')
        .map((b) => b.staffId)
      const available = capable.find((s) => !bookedStaffIds.includes(s.id))
      if (available) {
        resolvedStaffId = available.id
        resolvedStaffName = available.name
      } else if (capable.length > 0) {
        resolvedStaffId = capable[0].id
        resolvedStaffName = capable[0].name
      }
    } else {
      const staffMember = staff.find((s) => s.id === resolvedStaffId)
      resolvedStaffName = staffMember?.name ?? 'Staff'
    }

    const newBooking = {
      id: `bk-${uuidv4().slice(0, 8)}`,
      customerName,
      customerPhone,
      services: serviceIds,
      staffId: resolvedStaffId,
      staffName: resolvedStaffName,
      date,
      time,
      totalPrice,
      totalDuration,
      status: 'pending' as const,
      notes: notes ?? '',
      createdAt: new Date().toISOString(),
    }

    await createBooking(newBooking)
    await upsertCustomer(customerName, customerPhone, serviceIds, totalPrice)

    // Fire WhatsApp confirmation (non-blocking — won't fail the booking if it errors)
    sendBookingConfirmation(newBooking).catch((err) =>
      console.error('WhatsApp notification error:', err)
    )

    return NextResponse.json(newBooking, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
