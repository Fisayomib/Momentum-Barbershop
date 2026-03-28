import BookingWizard from '@/components/booking/BookingWizard'

export const metadata = {
  title: 'Book Appointment | Momentum Barbershop & Spa',
}

export default function BookingPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-dark-card border-b border-dark-border py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">Reserve Your Slot</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Book Appointment</h1>
          <div className="gold-divider mx-auto mb-4" />
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            Choose your services, pick a time, and leave the rest to us. It takes under 2 minutes.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BookingWizard />
      </div>
    </div>
  )
}
