'use client'

import { CheckCircle, Calendar, Clock, User, Phone, Scissors } from 'lucide-react'
import { type Service } from '@/data/services'
import { type StaffMember } from '@/data/staff'
import { formatNaira, formatDuration, formatDate, formatTime } from '@/lib/utils'

interface Props {
  services: Service[]
  staff: StaffMember | null
  date: string
  time: string
  customerName: string
  customerPhone: string
  notes: string
  bookingId?: string
  isSuccess?: boolean
}

export default function StepConfirmation({
  services, staff, date, time, customerName, customerPhone, notes, bookingId, isSuccess,
}: Props) {
  const totalPrice = services.reduce((s, v) => s + v.price, 0)
  const totalDuration = services.reduce((s, v) => s + v.duration, 0)

  if (isSuccess) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-white font-black text-2xl mb-2">Booking Confirmed!</h3>
        <p className="text-gray-400 text-sm mb-1">
          Your appointment has been submitted.
        </p>
        {bookingId && (
          <p className="text-gray-500 text-xs mb-6">Booking reference: <span className="text-gold">{bookingId}</span></p>
        )}
        <div className="bg-dark-elevated border border-dark-border rounded-2xl p-5 text-left space-y-3 max-w-sm mx-auto">
          <InfoRow icon={<User className="w-4 h-4" />} label="Name" value={customerName} />
          <InfoRow icon={<Calendar className="w-4 h-4" />} label="Date" value={formatDate(date)} />
          <InfoRow icon={<Clock className="w-4 h-4" />} label="Time" value={formatTime(time)} />
          <InfoRow
            icon={<Scissors className="w-4 h-4" />}
            label="Staff"
            value={staff ? staff.name : 'Auto-assigned'}
          />
        </div>
        <p className="text-gray-500 text-xs mt-6">
          We'll contact you on <span className="text-white">{customerPhone}</span> to confirm.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-white font-bold text-xl mb-2">Confirm Your Booking</h3>
      <p className="text-gray-400 text-sm mb-6">Review your appointment details before confirming</p>

      <div className="space-y-3">
        {/* Services */}
        <div className="bg-dark-elevated border border-dark-border rounded-2xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Services</p>
          <div className="space-y-2">
            {services.map((svc) => (
              <div key={svc.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{svc.icon}</span>
                  <span className="text-white text-sm">{svc.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs">{formatDuration(svc.duration)}</span>
                  <span className="text-gold text-sm font-semibold">{formatNaira(svc.price)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-dark-border flex justify-between items-center">
            <span className="text-gray-400 text-sm">Total ({formatDuration(totalDuration)})</span>
            <span className="text-gold font-black text-lg">{formatNaira(totalPrice)}</span>
          </div>
        </div>

        {/* Appointment details */}
        <div className="bg-dark-elevated border border-dark-border rounded-2xl p-4 space-y-3">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Appointment</p>
          <InfoRow icon={<Calendar className="w-4 h-4" />} label="Date" value={formatDate(date)} />
          <InfoRow icon={<Clock className="w-4 h-4" />} label="Time" value={formatTime(time)} />
          <InfoRow
            icon={<Scissors className="w-4 h-4" />}
            label="Staff"
            value={staff ? `${staff.name} (${staff.role})` : 'Auto-assigned'}
          />
        </div>

        {/* Customer details */}
        <div className="bg-dark-elevated border border-dark-border rounded-2xl p-4 space-y-3">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Your Details</p>
          <InfoRow icon={<User className="w-4 h-4" />} label="Name" value={customerName} />
          <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={customerPhone} />
          {notes && (
            <InfoRow icon={<Scissors className="w-4 h-4" />} label="Notes" value={notes} />
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gold mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-gray-500 text-xs">{label}</p>
        <p className="text-white text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
