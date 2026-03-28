'use client'

import { motion } from 'framer-motion'
import { Instagram } from 'lucide-react'
import Image from 'next/image'

const mockPosts = [
  { id: 1, src: 'https://picsum.photos/seed/barber1/400/400', alt: 'Fresh fade haircut' },
  { id: 2, src: 'https://picsum.photos/seed/barber2/400/400', alt: 'Beard shaping' },
  { id: 3, src: 'https://picsum.photos/seed/spa1/400/400', alt: 'Spa treatment' },
  { id: 4, src: 'https://picsum.photos/seed/barber3/400/400', alt: 'Low fade design' },
  { id: 5, src: 'https://picsum.photos/seed/nails1/400/400', alt: 'Nail art' },
  { id: 6, src: 'https://picsum.photos/seed/barber4/400/400', alt: 'Hair cut' },
  { id: 7, src: 'https://picsum.photos/seed/massage1/400/400', alt: 'Massage therapy' },
  { id: 8, src: 'https://picsum.photos/seed/barber5/400/400', alt: 'Skin fade' },
  { id: 9, src: 'https://picsum.photos/seed/facial1/400/400', alt: 'Facial treatment' },
]

export default function InstagramPreview() {
  return (
    <section className="py-24 bg-dark-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-3"
          >
            <Instagram className="w-6 h-6 text-gold" />
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              @momentumbarbershop
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-400 text-sm"
          >
            Follow us on Instagram for daily transformations
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {mockPosts.map((post, i) => (
            <motion.a
              key={post.id}
              href="https://instagram.com/momentumbarbershop"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="relative aspect-square rounded-xl overflow-hidden group block"
            >
              <Image
                src={post.src}
                alt={post.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/50 transition-all duration-300 flex items-center justify-center">
                <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.a>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <a
            href="https://instagram.com/momentumbarbershop"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-gold/30 hover:border-gold text-gold hover:text-gold-light px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200"
          >
            <Instagram className="w-4 h-4" />
            View Full Profile
          </a>
        </motion.div>
      </div>
    </section>
  )
}
