'use client'

import Image from 'next/image'
import { Check, Shuffle } from 'lucide-react'
import { staff, type StaffMember } from '@/data/staff'
import { type Service } from '@/data/services'
import { cn } from '@/lib/utils'

interface Props {
  selectedServices: Service[]
  selectedStaff: StaffMember | null
  onSelect: (s: StaffMember | null) => void
}

export default function StepStaff({ selectedServices, selectedStaff, onSelect }: Props) {
  const serviceCategories = [...new Set(selectedServices.map((s) => s.category))]

  // Show staff that can handle at least one selected category
  const capable = staff.filter((m) =>
    m.available && m.specialties.some((sp) => serviceCategories.includes(sp))
  )

  // If no service-specific staff, show all available
  const displayed = capable.length > 0 ? capable : staff.filter((m) => m.available)

  return (
    <div>
      <h3 className="text-white font-bold text-xl mb-2">Choose Your Staff</h3>
      <p className="text-gray-400 text-sm mb-6">
        Pick a specific team member or let us assign the best available person
      </p>

      {/* Auto-assign option */}
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'w-full text-left p-4 rounded-xl border mb-4 transition-all duration-200 flex items-center gap-3',
          selectedStaff === null
            ? 'border-gold bg-gold/10'
            : 'border-dark-border bg-dark-elevated hover:border-gray-600'
        )}
      >
        <div className="w-12 h-12 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center shrink-0">
          <Shuffle className="w-5 h-5 text-gold" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Auto-Assign</p>
          <p className="text-gray-500 text-xs mt-0.5">
            We'll match you with the best available specialist
          </p>
        </div>
        {selectedStaff === null && (
          <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-dark" />
          </div>
        )}
      </button>

      {/* Staff list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayed.map((member) => {
          const isActive = selectedStaff?.id === member.id
          return (
            <button
              key={member.id}
              onClick={() => onSelect(member)}
              className={cn(
                'text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3',
                isActive
                  ? 'border-gold bg-gold/10'
                  : 'border-dark-border bg-dark-elevated hover:border-gray-600'
              )}
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                <Image src={member.photo} alt={member.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{member.name}</p>
                <p className="text-gold text-xs">{member.role}</p>
                <p className="text-gray-500 text-xs mt-1 line-clamp-2">{member.bio}</p>
              </div>
              {isActive && (
                <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-dark" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
