import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminAuthGuard from '@/components/admin/AdminAuthGuard'

export const metadata = {
  title: 'Admin | Momentum Barbershop & Spa',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen bg-dark">
        <AdminSidebar />
        <main className="flex-1 md:ml-56 pt-14 md:pt-0 min-h-screen overflow-auto">
          {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
            <div className="bg-gold/10 border-b border-gold/30 px-6 py-2 text-center">
              <p className="text-gold text-xs font-medium">
                🚧 Demo Mode — Data is read-only. New bookings won't persist until MongoDB is connected.
              </p>
            </div>
          )}
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  )
}
