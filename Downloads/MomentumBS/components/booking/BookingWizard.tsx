'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import StepServices from './StepServices'
import StepStaff from './StepStaff'
import StepDateTime from './StepDateTime'
import StepDetails from './StepDetails'
import StepConfirmation from './StepConfirmation'
import { type Service } from '@/data/services'
import { type StaffMember } from '@/data/staff'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, label: 'Services' },
  { id: 2, label: 'Staff' },
  { id: 3, label: 'Date & Time' },
  { id: 4, label: 'Your Details' },
  { id: 5, label: 'Confirm' },
]

interface CustomerDetails {
  name: string
  phone: string
  notes: string
}

export default function BookingWizard() {
  const [step, setStep] = useState(1)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '', phone: '', notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [bookingResult, setBookingResult] = useState<{ id: string } | null>(null)
  const [error, setError] = useState('')

  const totalDuration = selectedServices.reduce((s, v) => s + v.duration, 0)

  const canProceed = () => {
    if (step === 1) return selectedServices.length > 0
    if (step === 2) return true // staff is optional
    if (step === 3) return !!selectedDate && !!selectedTime
    if (step === 4) return !!customerDetails.name.trim() && !!customerDetails.phone.trim()
    return true
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerDetails.name,
          customerPhone: customerDetails.phone,
          notes: customerDetails.notes,
          services: selectedServices.map((s) => s.id),
          staffId: selectedStaff?.id ?? null,
          date: selectedDate,
          time: selectedTime,
        }),
      })
      if (!res.ok) throw new Error('Booking failed')
      const data = await res.json()
      setBookingResult(data)
      setStep(6) // success state
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const next = () => {
    if (step === 5) { handleSubmit(); return }
    setStep((s) => Math.min(s + 1, 5))
  }
  const back = () => setStep((s) => Math.max(s - 1, 1))

  const isSuccess = step === 6

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      {!isSuccess && (
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200',
                    step > s.id
                      ? 'bg-gold text-dark'
                      : step === s.id
                      ? 'bg-gold text-dark ring-4 ring-gold/20'
                      : 'bg-dark-elevated border border-dark-border text-gray-600'
                  )}
                >
                  {step > s.id ? '✓' : s.id}
                </div>
                <span
                  className={cn(
                    'text-xs mt-1 hidden sm:block',
                    step >= s.id ? 'text-gold' : 'text-gray-600'
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-px mx-2 mb-4 transition-colors',
                    step > s.id ? 'bg-gold' : 'bg-dark-border'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step content */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 sm:p-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <StepServices selected={selectedServices} onSelect={setSelectedServices} />
            )}
            {step === 2 && (
              <StepStaff
                selectedServices={selectedServices}
                selectedStaff={selectedStaff}
                onSelect={setSelectedStaff}
              />
            )}
            {step === 3 && (
              <StepDateTime
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                selectedStaff={selectedStaff}
                totalDuration={totalDuration}
                onDateChange={setSelectedDate}
                onTimeChange={setSelectedTime}
              />
            )}
            {step === 4 && (
              <StepDetails details={customerDetails} onChange={setCustomerDetails} />
            )}
            {step === 5 && (
              <StepConfirmation
                services={selectedServices}
                staff={selectedStaff}
                date={selectedDate}
                time={selectedTime}
                customerName={customerDetails.name}
                customerPhone={customerDetails.phone}
                notes={customerDetails.notes}
              />
            )}
            {step === 6 && (
              <StepConfirmation
                services={selectedServices}
                staff={selectedStaff}
                date={selectedDate}
                time={selectedTime}
                customerName={customerDetails.name}
                customerPhone={customerDetails.phone}
                notes={customerDetails.notes}
                bookingId={bookingResult?.id}
                isSuccess
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm text-center mt-3">{error}</p>
      )}

      {/* Navigation */}
      {!isSuccess && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={back}
            disabled={step === 1}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors',
              step === 1
                ? 'text-gray-700 cursor-not-allowed'
                : 'text-gray-300 hover:text-white hover:bg-dark-elevated border border-dark-border'
            )}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <button
            onClick={next}
            disabled={!canProceed() || submitting}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200',
              canProceed() && !submitting
                ? 'bg-gold hover:bg-gold-light text-dark hover:shadow-lg hover:shadow-gold/20'
                : 'bg-gold/30 text-dark/50 cursor-not-allowed'
            )}
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Booking...</>
            ) : step === 5 ? (
              'Confirm Booking'
            ) : (
              <>Continue <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
