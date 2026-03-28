'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { categoryLabels, categoryIcons, type ServiceCategory } from '@/data/services'

const categories: { id: ServiceCategory; tagline: string }[] = [
  { id: 'haircut', tagline: 'Sharp cuts & clean fades' },
  { id: 'facial', tagline: 'Glow-up skincare treatments' },
  { id: 'massage', tagline: 'Full-body relaxation therapy' },
  { id: 'teeth', tagline: 'Brighter smile in one session' },
  { id: 'nails', tagline: 'Manicure & pedicure artistry' },
]

export default function ServicesOverview() {
  return (
    <section className="py-24 bg-dark-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gold text-sm font-medium tracking-widest uppercase mb-3"
          >
            What We Offer
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-black text-white mb-4"
          >
            Premium Services
          </motion.h2>
          <div className="gold-divider mx-auto" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={`/services?category=${cat.id}`}
                className="group block bg-dark border border-dark-border rounded-2xl p-6 card-hover h-full"
              >
                <div className="text-4xl mb-4">{categoryIcons[cat.id]}</div>
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-gold transition-colors">
                  {categoryLabels[cat.id]}
                </h3>
                <p className="text-gray-500 text-sm mb-4">{cat.tagline}</p>
                <span className="inline-flex items-center gap-1 text-gold text-sm font-medium group-hover:gap-2 transition-all">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </motion.div>
          ))}

          {/* CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: categories.length * 0.08 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <Link
              href="/booking"
              className="group block bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 hover:border-gold rounded-2xl p-6 h-full flex flex-col justify-between card-hover"
            >
              <div>
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-white font-bold text-lg mb-2">Ready to Book?</h3>
                <p className="text-gray-400 text-sm">
                  Choose your services and secure your slot in under 2 minutes.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-dark font-bold px-6 py-3 rounded-xl text-sm transition-colors w-full">
                Book Appointment <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
