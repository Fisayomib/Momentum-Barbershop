'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { cn, formatTime } from '@/lib/utils'
import { type StaffMember } from '@/data/staff'

interface Props {
  selectedDate: string
  selectedTime: string
  selectedStaff: StaffMember | null
  totalDuration: number
  onDateChange: (d: string) => void
  onTimeChange: (t: string) => void
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function StepDateTime({
  selectedDate, selectedTime, selectedStaff, totalDuration, onDateChange, onTimeChange,
}: Props) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day)
    d.setHours(0, 0, 0, 0)
    const t = new Date(); t.setHours(0, 0, 0, 0)
    return d < t
  }

  const formatDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${viewYear}-${m}-${d}`
  }

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate) { setSlots([]); return }
    setLoading(true)
    const params = new URLSearchParams({
      date: selectedDate,
      totalDuration: String(totalDuration),
      ...(selectedStaff ? { staffId: selectedStaff.id } : {}),
    })
    fetch(`/api/availability?${params}`)
      .then(r => r.json())
      .then(data => { setSlots(data.available ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [selectedDate, selectedStaff, totalDuration])

  return (
    <div>
      <h3 className="text-white font-bold text-xl mb-2">Pick a Date & Time</h3>
      <p className="text-gray-400 text-sm mb-6">Select your preferred appointment slot</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-dark-elevated border border-dark-border rounded-2xl p-4">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-dark-surface text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white font-semibold text-sm">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-dark-surface text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-gray-600 text-xs py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dateStr = formatDay(day)
              const past = isPast(day)
              const isSelected = selectedDate === dateStr
              return (
                <button
                  key={day}
                  disabled={past}
                  onClick={() => { onDateChange(dateStr); onTimeChange('') }}
                  className={cn(
                    'aspect-square rounded-lg text-xs font-medium transition-all duration-150',
                    past ? 'text-gray-700 cursor-not-allowed' :
                    isSelected ? 'bg-gold text-dark font-bold' :
                    'text-gray-300 hover:bg-dark-surface hover:text-white'
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        {/* Time slots */}
        <div className="bg-dark-elevated border border-dark-border rounded-2xl p-4">
          <h4 className="text-white font-semibold text-sm mb-4">
            {selectedDate ? `Available Slots` : 'Select a date first'}
          </h4>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 text-gold animate-spin" />
            </div>
          ) : !selectedDate ? (
            <div className="flex items-center justify-center h-32 text-gray-600 text-sm">
              Pick a date from the calendar
            </div>
          ) : slots.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
              No available slots for this date
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-64 pr-1">
              {slots.map(slot => (
                <button
                  key={slot}
                  onClick={() => onTimeChange(slot)}
                  className={cn(
                    'py-2 px-2 rounded-lg text-xs font-medium transition-colors',
                    selectedTime === slot
                      ? 'bg-gold text-dark font-bold'
                      : 'bg-dark-surface text-gray-300 hover:bg-dark-border hover:text-white'
                  )}
                >
                  {formatTime(slot)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
