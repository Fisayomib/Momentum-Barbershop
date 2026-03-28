'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'
import { services, categoryLabels, categoryIcons, type ServiceCategory } from '@/data/services'
import { formatNaira, formatDuration, cn } from '@/lib/utils'

const categories = Object.keys(categoryLabels) as ServiceCategory[]

function ServicesContent() {
  const searchParams = useSearchParams()
  const initialCat = (searchParams.get('category') as ServiceCategory) ?? 'all'
  const [active, setActive] = useState<ServiceCategory | 'all'>(
    categories.includes(initialCat as ServiceCategory) ? initialCat : 'all'
  )

  const filtered = active === 'all' ? services : services.filter((s) => s.category === active)

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-dark-card border-b border-dark-border py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">What We Offer</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Our Services</h1>
          <div className="gold-divider mx-auto mb-4" />
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            Premium grooming and wellness treatments delivered by expert professionals.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setActive('all')}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-medium transition-all',
              active === 'all'
                ? 'bg-gold text-dark'
                : 'bg-dark-card border border-dark-border text-gray-400 hover:text-white hover:border-gold'
            )}
          >
            All Services
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                active === cat
                  ? 'bg-gold text-dark'
                  : 'bg-dark-card border border-dark-border text-gray-400 hover:text-white hover:border-gold'
              )}
            >
              <span>{categoryIcons[cat]}</span>
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((svc, i) => (
            <motion.div
              key={svc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-dark-card border border-dark-border rounded-2xl p-6 flex flex-col card-hover"
            >
              <div className="text-4xl mb-4">{svc.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{svc.name}</h3>
              <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-4">{svc.description}</p>

              <div className="flex items-center gap-3 mb-5">
                <span className="text-gold font-black text-xl">{formatNaira(svc.price)}</span>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(svc.duration)}
                </div>
              </div>

              <Link
                href={`/booking?service=${svc.id}`}
                className="inline-flex items-center justify-center gap-2 bg-dark-elevated hover:bg-gold hover:text-dark border border-dark-border hover:border-gold text-gray-300 font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-200 group"
              >
                Book This Service
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10 border border-gold/20 rounded-2xl p-8">
            <h2 className="text-white font-black text-2xl mb-2">Ready to Transform?</h2>
            <p className="text-gray-400 text-sm mb-6">
              Book multiple services in one visit. We'll handle the scheduling.
            </p>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-dark font-bold px-8 py-3 rounded-xl text-sm transition-colors"
            >
              Book Appointment <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center text-gray-400">Loading...</div>}>
      <ServicesContent />
    </Suspense>
  )
}
