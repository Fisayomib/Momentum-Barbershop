import { Phone, MapPin, Clock, Instagram, MessageCircle } from 'lucide-react'

export const metadata = {
  title: 'Contact | Momentum Barbershop & Spa',
}

const hours = [
  { day: 'Monday – Friday', time: '9:00 AM – 8:00 PM' },
  { day: 'Saturday', time: '9:00 AM – 8:00 PM' },
  { day: 'Sunday', time: '10:00 AM – 6:00 PM' },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-dark-card border-b border-dark-border py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">Get In Touch</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Contact Us</h1>
          <div className="gold-divider mx-auto mb-4" />
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            Have a question or want to reach us directly? We're always available.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="space-y-5">
            {/* Phone */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Call Us</h3>
                <a
                  href="tel:+2348034567890"
                  className="text-gray-400 hover:text-gold transition-colors text-sm"
                >
                  +234 803 456 7890
                </a>
                <p className="text-gray-600 text-xs mt-1">Available during business hours</p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">WhatsApp</h3>
                <p className="text-gray-400 text-sm mb-3">Chat with us instantly on WhatsApp</p>
                <a
                  href="https://wa.me/2348034567890?text=Hi%20Momentum%20Barbershop%2C%20I%27d%20like%20to%20make%20an%20enquiry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Instagram */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
                <Instagram className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Instagram</h3>
                <a
                  href="https://instagram.com/momentumbarbershop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gold transition-colors text-sm"
                >
                  @momentumbarbershop
                </a>
                <p className="text-gray-600 text-xs mt-1">Follow for daily transformations</p>
              </div>
            </div>

            {/* Location */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Address</h3>
                <p className="text-gray-400 text-sm">15 Freedom Way, Lekki Phase 1</p>
                <p className="text-gray-400 text-sm">Lagos, Nigeria</p>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-gold" />
                </div>
                <h3 className="text-white font-semibold">Business Hours</h3>
              </div>
              <div className="space-y-3">
                {hours.map((h) => (
                  <div key={h.day} className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">{h.day}</span>
                    <span className="text-white text-sm font-medium">{h.time}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-dark-border flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-medium">Open Now</span>
              </div>
            </div>
          </div>

          {/* Right — Map */}
          <div className="space-y-5">
            <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-dark-border">
                <h3 className="text-white font-semibold">Find Us</h3>
                <p className="text-gray-500 text-xs mt-0.5">15 Freedom Way, Lekki Phase 1, Lagos</p>
              </div>
              <div className="relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7284741462!2d3.459000!3d6.431500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMjUnNTMuNCJOIDPCsDI3JzMyLjQiRQ!5e0!3m2!1sen!2sng!4v1620000000000"
                  width="100%"
                  height="380"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Momentum Barbershop Location"
                />
              </div>
            </div>

            {/* Quick book CTA */}
            <div className="bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10 border border-gold/20 rounded-2xl p-6 text-center">
              <h3 className="text-white font-bold text-lg mb-2">Skip the Wait</h3>
              <p className="text-gray-400 text-sm mb-4">
                Book your appointment online and secure your spot instantly.
              </p>
              <a
                href="/booking"
                className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-dark font-bold px-6 py-3 rounded-xl text-sm transition-colors"
              >
                Book Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
