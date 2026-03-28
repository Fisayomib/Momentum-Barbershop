'use client'

import { useEffect, useState } from 'react'
import { Calendar, Users, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import StatsCard from '@/components/admin/StatsCard'
import { type Booking } from '@/lib/db'
import { formatNaira, formatTime, getStatusColor, getStatusLabel, cn } from '@/lib/utils'
import { getServiceById } from '@/data/services'

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((data) => { setBookings(data); setLoading(false) })
  }, [])

  const pending = bookings.filter((b) => b.status === 'pending')
  const confirmed = bookings.filter((b) => b.status === 'confirmed')
  const completed = bookings.filter((b) => b.status === 'completed')
  const totalRevenue = completed.reduce((s, b) => s + b.totalPrice, 0)
  const uniqueCustomers = new Set(bookings.map((b) => b.customerPhone)).size
  const recent = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-white font-black text-2xl">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Bookings"
              value={bookings.length}
              subtitle="All time"
              icon={Calendar}
              trend={{ value: '12%', positive: true }}
            />
            <StatsCard
              title="Pending"
              value={pending.length}
              subtitle="Awaiting confirmation"
              icon={Clock}
            />
            <StatsCard
              title="Total Customers"
              value={uniqueCustomers}
              subtitle="Unique visitors"
              icon={Users}
              trend={{ value: '8%', positive: true }}
            />
            <StatsCard
              title="Revenue"
              value={formatNaira(totalRevenue)}
              subtitle="From completed bookings"
              icon={TrendingUp}
              accent
            />
          </div>

          {/* Status summary */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Pending', count: pending.length, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
              { label: 'Confirmed', count: confirmed.length, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
              { label: 'Completed', count: completed.length, color: 'text-green-400 bg-green-400/10 border-green-400/20' },
            ].map((s) => (
              <div key={s.label} className={cn('rounded-xl border p-4 text-center', s.color)}>
                <p className="text-2xl font-black">{s.count}</p>
                <p className="text-xs font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recent bookings */}
          <div className="bg-dark-card border border-dark-border rounded-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
              <h2 className="text-white font-bold">Recent Bookings</h2>
              <Link href="/admin/bookings" className="text-gold text-xs hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-dark-border">
              {recent.map((b) => (
                <div key={b.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white text-sm font-medium">{b.customerName}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {b.services.map((id) => getServiceById(id)?.name).filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-gray-300 text-xs">{b.date} · {formatTime(b.time)}</p>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block', getStatusColor(b.status))}>
                      {getStatusLabel(b.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
