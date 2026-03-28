import twilio from 'twilio'
import { formatNaira, formatDate, formatTime, formatDuration } from './utils'
import { getServiceById } from '@/data/services'

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886' // Twilio sandbox default
const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP_NUMBER // e.g. whatsapp:+2348034567890

function formatPhone(phone: string): string {
  // Normalise Nigerian numbers to E.164 format for WhatsApp
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return `whatsapp:+234${digits.slice(1)}`
  if (digits.startsWith('234')) return `whatsapp:+${digits}`
  return `whatsapp:+${digits}`
}

export async function sendBookingConfirmation(booking: {
  id: string
  customerName: string
  customerPhone: string
  services: string[]
  staffName: string
  date: string
  time: string
  totalPrice: number
  totalDuration: number
  notes: string
}) {
  if (!TWILIO_SID || !TWILIO_TOKEN) {
    console.log('Twilio not configured — skipping WhatsApp notification')
    return
  }

  const client = twilio(TWILIO_SID, TWILIO_TOKEN)

  const serviceNames = booking.services
    .map((id) => getServiceById(id)?.name)
    .filter(Boolean)
    .join(', ')

  const customerMessage = `
✅ *Booking Confirmed — Momentum Barbershop & Spa*

Hi ${booking.customerName}! Your appointment has been received.

📋 *Booking Ref:* ${booking.id}
💇 *Services:* ${serviceNames}
👤 *Staff:* ${booking.staffName}
📅 *Date:* ${formatDate(booking.date)}
🕐 *Time:* ${formatTime(booking.time)}
⏱ *Duration:* ${formatDuration(booking.totalDuration)}
💰 *Total:* ${formatNaira(booking.totalPrice)}
${booking.notes ? `📝 *Notes:* ${booking.notes}` : ''}

We'll see you then! To reschedule or cancel, call or WhatsApp us at +234 803 456 7890.

— Momentum Barbershop & Spa 💈
`.trim()

  const adminMessage = `
🔔 *New Booking — ${booking.customerName}*

📋 Ref: ${booking.id}
📞 Phone: ${booking.customerPhone}
💇 Services: ${serviceNames}
👤 Staff: ${booking.staffName}
📅 ${formatDate(booking.date)} at ${formatTime(booking.time)}
💰 ${formatNaira(booking.totalPrice)}
${booking.notes ? `📝 Notes: ${booking.notes}` : ''}
`.trim()

  const sends: Promise<any>[] = []

  // Send to customer
  sends.push(
    client.messages.create({
      from: TWILIO_WHATSAPP_FROM,
      to: formatPhone(booking.customerPhone),
      body: customerMessage,
    }).catch((err) => console.error('Failed to send customer WhatsApp:', err.message))
  )

  // Send to admin if configured
  if (ADMIN_WHATSAPP) {
    sends.push(
      client.messages.create({
        from: TWILIO_WHATSAPP_FROM,
        to: ADMIN_WHATSAPP,
        body: adminMessage,
      }).catch((err) => console.error('Failed to send admin WhatsApp:', err.message))
    )
  }

  await Promise.all(sends)
}
