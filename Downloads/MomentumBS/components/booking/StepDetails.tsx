'use client'

import { User, Phone, FileText } from 'lucide-react'

interface CustomerDetails {
  name: string
  phone: string
  notes: string
}

interface Props {
  details: CustomerDetails
  onChange: (d: CustomerDetails) => void
}

export default function StepDetails({ details, onChange }: Props) {
  const set = (key: keyof CustomerDetails, value: string) =>
    onChange({ ...details, [key]: value })

  return (
    <div>
      <h3 className="text-white font-bold text-xl mb-2">Your Details</h3>
      <p className="text-gray-400 text-sm mb-6">Tell us who's coming — we'll use this to confirm your booking</p>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Full Name <span className="text-gold">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={details.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Tunde Adeyemi"
              className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Phone Number <span className="text-gold">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="tel"
              value={details.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="e.g. 08012345678"
              className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Special Requests <span className="text-gray-600">(optional)</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
            <textarea
              value={details.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Any specific style, preference, or request..."
              rows={4}
              className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm resize-none"
            />
          </div>
        </div>

        {/* Privacy note */}
        <p className="text-gray-600 text-xs">
          Your details are used solely for appointment management and will not be shared with third parties.
        </p>
      </div>
    </div>
  )
}
