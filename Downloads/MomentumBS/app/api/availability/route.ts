import { NextRequest, NextResponse } from 'next/server'
import { getBookings } from '@/lib/db'
import { generateTimeSlots } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const staffId = searchParams.get('staffId')
  const totalDuration = parseInt(searchParams.get('totalDuration') ?? '30')

  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })

  const allSlots = generateTimeSlots('09:00', '20:00', 30)
  const bookings = await getBookings()

  const bookedTimes = bookings
    .filter(
      (b) =>
        b.date === date &&
        b.status !== 'cancelled' &&
        (staffId ? b.staffId === staffId : true)
    )
    .map((b) => b.time)

  const available = allSlots.filter((slot) => {
    if (bookedTimes.includes(slot)) return false
    const [h, m] = slot.split(':').map(Number)
    const slotEnd = h * 60 + m + totalDuration
    if (slotEnd > 20 * 60) return false
    return true
  })

  return NextResponse.json({ date, staffId, available })
}
