'use client'

import { useEffect, useState } from 'react'
import { Search, Filter } from 'lucide-react'
import BookingsTable from '@/components/admin/BookingsTable'
import { type Booking, type BookingStatus } from '@/lib/db'
import { cn } from '@/lib/utils'

const STATUS_FILTERS: { label: string; value: BookingStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')

  const load = () => {
    setLoading(true)
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((data) => { setBookings(data); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const filtered = bookings
    .filter((b) => statusFilter === 'all' || b.status === statusFilter)
    .filter((b) =>
      !search ||
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.customerPhone.includes(search)
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-white font-black text-2xl">Bookings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage all customer appointments</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="input-dark w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                statusFilter === f.value
                  ? 'bg-gold text-dark'
                  : 'bg-dark-card border border-dark-border text-gray-400 hover:text-white'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          </div>
        ) : (
          <BookingsTable bookings={filtered} onUpdate={load} />
        )}
      </div>
    </div>
  )
}
