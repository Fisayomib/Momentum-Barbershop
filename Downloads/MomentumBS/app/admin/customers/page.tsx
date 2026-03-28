'use client'

import { useEffect, useState } from 'react'
import { Search, Users } from 'lucide-react'
import { type Customer } from '@/lib/db'
import { formatNaira } from '@/lib/utils'
import { getServiceById } from '@/data/services'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/customers')
      .then((r) => r.json())
      .then((data) => { setCustomers(data); setLoading(false) })
  }, [])

  const filtered = customers
    .filter((c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    )
    .sort((a, b) => b.visits - a.visits)

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-white font-black text-2xl">Customers</h1>
        <p className="text-gray-400 text-sm mt-1">Customer records and visit history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Total Customers</p>
          <p className="text-white font-black text-2xl mt-1">{customers.length}</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Repeat Clients</p>
          <p className="text-white font-black text-2xl mt-1">
            {customers.filter((c) => c.visits > 1).length}
          </p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-4 col-span-2 sm:col-span-1">
          <p className="text-gray-500 text-xs uppercase tracking-wider">Total Spend</p>
          <p className="text-gold font-black text-2xl mt-1">
            {formatNaira(customers.reduce((s, c) => s + c.totalSpent, 0))}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="input-dark w-full pl-9 pr-4 py-2.5 rounded-xl text-sm max-w-md"
        />
      </div>

      {/* Table */}
      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-border">
                  {['Customer', 'Phone', 'Visits', 'Last Visit', 'Total Spent', 'Services Used'].map((h) => (
                    <th
                      key={h}
                      className="text-left text-gray-500 text-xs uppercase tracking-wider font-medium px-6 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-dark-elevated transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                          <span className="text-gold text-xs font-bold">
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-white font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{c.phone}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{c.visits}</span>
                        {c.visits > 3 && (
                          <span className="text-xs text-gold bg-gold/10 px-1.5 py-0.5 rounded-full">
                            Regular
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{c.lastVisit}</td>
                    <td className="px-6 py-4">
                      <span className="text-gold font-semibold">{formatNaira(c.totalSpent)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {c.services.slice(0, 3).map((svcId) => {
                          const svc = getServiceById(svcId)
                          return svc ? (
                            <span
                              key={svcId}
                              className="text-xs bg-dark-surface border border-dark-border px-2 py-0.5 rounded-full text-gray-400"
                            >
                              {svc.icon}
                            </span>
                          ) : null
                        })}
                        {c.services.length > 3 && (
                          <span className="text-xs text-gray-600">+{c.services.length - 3}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
