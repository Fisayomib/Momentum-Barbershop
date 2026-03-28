'use client'

import Image from 'next/image'
import { staff, categoryLabels, type StaffSpecialty } from '@/data/staff'
import { CheckCircle, XCircle } from 'lucide-react'

export default function StaffPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-white font-black text-2xl">Staff</h1>
        <p className="text-gray-400 text-sm mt-1">Team members and their specialties</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {staff.map((member) => (
          <div
            key={member.id}
            className="bg-dark-card border border-dark-border rounded-2xl p-5 flex flex-col gap-4"
          >
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-gold/30">
                <Image src={member.photo} alt={member.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-base truncate">{member.name}</h3>
                  {member.available ? (
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                </div>
                <p className="text-gold text-xs font-medium">{member.role}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {member.available ? 'Available' : 'Unavailable'}
                </p>
              </div>
            </div>

            {/* Bio */}
            <p className="text-gray-400 text-sm leading-relaxed">{member.bio}</p>

            {/* Specialties */}
            <div>
              <p className="text-gray-600 text-xs uppercase tracking-wider mb-2">Specialties</p>
              <div className="flex flex-wrap gap-2">
                {member.specialties.map((sp) => (
                  <span
                    key={sp}
                    className="text-xs bg-dark-elevated border border-dark-border px-2.5 py-1 rounded-full text-gray-300"
                  >
                    {categoryLabels[sp as StaffSpecialty]}
                  </span>
                ))}
              </div>
            </div>

            {/* Working hours */}
            <div className="bg-dark-elevated rounded-xl p-3 border border-dark-border">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Working Hours</span>
                <span className="text-white">
                  {member.workingHours.start} – {member.workingHours.end}
                </span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">Working Days</span>
                <span className="text-white">
                  {member.workingDays
                    .map((d) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d])
                    .join(', ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-gray-600 text-xs mt-6 text-center">
        Staff management (add/edit/remove) requires database integration — coming in v2.
      </p>
    </div>
  )
}
