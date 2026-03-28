import Link from 'next/link'
import { Scissors, Phone, MapPin, Clock, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark-card border-t border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold flex items-center justify-center">
                <Scissors className="w-4 h-4 text-gold" />
              </div>
              <span className="font-bold text-base">
                <span className="text-white">MOMENTUM</span>
                <span className="text-gold ml-1 text-sm font-normal">BARBERSHOP</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium grooming and spa services. Where style meets luxury, and every visit leaves you feeling your best.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/services', label: 'Services' },
                { href: '/booking', label: 'Book Appointment' },
                { href: '/contact', label: 'Contact Us' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span>15 Freedom Way, Lekki Phase 1, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <a href="tel:+2348034567890" className="hover:text-white transition-colors">
                  +234 803 456 7890
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Instagram className="w-4 h-4 text-gold shrink-0" />
                <a
                  href="https://instagram.com/momentumbarbershop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  @momentumbarbershop
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-white font-semibold mb-4">Business Hours</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between text-gray-400">
                <span>Mon – Sat</span>
                <span className="text-white">9:00 AM – 8:00 PM</span>
              </li>
              <li className="flex justify-between text-gray-400">
                <span>Sunday</span>
                <span className="text-white">10:00 AM – 6:00 PM</span>
              </li>
            </ul>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs">Open Today</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Momentum Barbershop & Spa. All rights reserved.
          </p>
          <Link href="/admin" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
            Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  )
}
