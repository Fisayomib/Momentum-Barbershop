'use client'

import { useState } from 'react'
import { Check, X, Clock, Loader2, RefreshCw } from 'lucide-react'
import { type Booking } from '@/lib/db'
import { formatNaira, formatDate, formatTime, getStatusColor, getStatusLabel, cn } from '@/lib/utils'
import { getServiceById } from '@/data/services'

interface Props {
  bookings: Booking[]
  onUpdate: () => void
}

export default function BookingsTable({ bookings, onUpdate }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  const updateStatus = async (id: string, status: string) => {
    setLoading(id)
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(null)
    onUpdate()
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No bookings yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dark-border">
            {['Customer', 'Services', 'Staff', 'Date & Time', 'Price', 'Status', 'Actions'].map((h) => (
              <th key={h} className="text-left text-gray-500 text-xs uppercase tracking-wider font-medium pb-3 pr-4">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-border">
          {bookings.map((b) => (
            <tr key={b.id} className="group hover:bg-dark-elevated transition-colors">
              <td className="py-3 pr-4">
                <p className="text-white font-medium">{b.customerName}</p>
                <p className="text-gray-500 text-xs">{b.customerPhone}</p>
              </td>
              <td className="py-3 pr-4">
                <div className="flex flex-wrap gap-1">
                  {b.services.map((svcId) => {
                    const svc = getServiceById(svcId)
                    return svc ? (
                      <span key={svcId} className="text-xs bg-dark-surface border border-dark-border px-2 py-0.5 rounded-full text-gray-300">
                        {svc.icon} {svc.name}
                      </span>
                    ) : null
                  })}
                </div>
              </td>
              <td className="py-3 pr-4">
                <p className="text-gray-300 text-xs">{b.staffName}</p>
              </td>
              <td className="py-3 pr-4 whitespace-nowrap">
                <p className="text-gray-300 text-xs">{formatDate(b.date)}</p>
                <p className="text-gold text-xs font-medium">{formatTime(b.time)}</p>
              </td>
              <td className="py-3 pr-4">
                <span className="text-gold font-semibold">{formatNaira(b.totalPrice)}</span>
              </td>
              <td className="py-3 pr-4">
                <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', getStatusColor(b.status))}>
                  {getStatusLabel(b.status)}
                </span>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-1">
                  {loading === b.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  ) : (
                    <>
                      {b.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(b.id, 'confirmed')}
                            title="Confirm"
                            className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => updateStatus(b.id, 'cancelled')}
                            title="Cancel"
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => updateStatus(b.id, 'completed')}
                          title="Mark Completed"
                          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
