'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { type Booking } from '@/lib/db'
import { services, getServiceById } from '@/data/services'
import { formatNaira } from '@/lib/utils'

const COLORS = ['#D4AF37', '#F0D060', '#B8960C', '#8B7332', '#555555', '#333333']

const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-dark-elevated border border-dark-border rounded-xl px-4 py-2 text-sm">
        <p className="text-white font-medium">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="text-xs mt-1">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((data) => { setBookings(data); setLoading(false) })
  }, [])

  // Most booked services
  const serviceCounts: Record<string, number> = {}
  bookings.forEach((b) => {
    b.services.forEach((svcId) => {
      serviceCounts[svcId] = (serviceCounts[svcId] ?? 0) + 1
    })
  })
  const topServices = Object.entries(serviceCounts)
    .map(([id, count]) => ({ name: getServiceById(id)?.name ?? id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Peak booking hours
  const hourCounts: Record<string, number> = {}
  bookings.forEach((b) => {
    const hour = b.time.split(':')[0]
    const label = `${parseInt(hour) % 12 || 12}${parseInt(hour) >= 12 ? 'PM' : 'AM'}`
    hourCounts[label] = (hourCounts[label] ?? 0) + 1
  })
  const peakHours = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => {
      const toNum = (h: string) => parseInt(h) + (h.includes('PM') && !h.startsWith('12') ? 12 : 0)
      return toNum(a.hour) - toNum(b.hour)
    })

  // Service category breakdown
  const categoryCounts: Record<string, number> = {}
  bookings.forEach((b) => {
    b.services.forEach((svcId) => {
      const svc = getServiceById(svcId)
      if (svc) categoryCounts[svc.category] = (categoryCounts[svc.category] ?? 0) + 1
    })
  })
  const categoryData = Object.entries(categoryCounts).map(([cat, value]) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value,
  }))

  // Repeat vs new customers
  const phoneCounts: Record<string, number> = {}
  bookings.forEach((b) => {
    phoneCounts[b.customerPhone] = (phoneCounts[b.customerPhone] ?? 0) + 1
  })
  const repeatCount = Object.values(phoneCounts).filter((c) => c > 1).length
  const newCount = Object.values(phoneCounts).filter((c) => c === 1).length
  const retentionData = [
    { name: 'Repeat', value: repeatCount },
    { name: 'New', value: newCount },
  ]

  const completedBookings = bookings.filter((b) => b.status === 'completed')
  const totalRevenue = completedBookings.reduce((s, b) => s + b.totalPrice, 0)
  const avgBookingValue = completedBookings.length
    ? Math.round(totalRevenue / completedBookings.length)
    : 0

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-white font-black text-2xl">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Business performance overview</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Bookings', value: bookings.length },
              { label: 'Completed', value: completedBookings.length },
              { label: 'Total Revenue', value: formatNaira(totalRevenue) },
              { label: 'Avg Booking Value', value: formatNaira(avgBookingValue) },
            ].map((s) => (
              <div key={s.label} className="bg-dark-card border border-dark-border rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider">{s.label}</p>
                <p className="text-gold font-black text-xl mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top services */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h3 className="text-white font-bold mb-5">Most Booked Services</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topServices} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#666', fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fill: '#aaa', fontSize: 11 }}
                  />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Bar dataKey="count" name="Bookings" fill="#D4AF37" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Peak hours */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h3 className="text-white font-bold mb-5">Peak Booking Hours</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={peakHours}>
                  <XAxis dataKey="hour" tick={{ fill: '#aaa', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#666', fontSize: 11 }} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Bar dataKey="count" name="Bookings" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h3 className="text-white font-bold mb-5">Services by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#555' }}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Retention */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h3 className="text-white font-bold mb-5">New vs Repeat Customers</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={retentionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {retentionData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#D4AF37' : '#333333'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Legend
                    formatter={(v) => <span style={{ color: '#aaa', fontSize: 12 }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
