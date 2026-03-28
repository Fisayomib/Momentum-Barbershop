/**
 * Database abstraction layer.
 * - If MONGODB_URI is set  → uses MongoDB Atlas (production / Vercel)
 * - Otherwise              → falls back to local data/db.json (local dev)
 */

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Booking {
  id: string
  customerName: string
  customerPhone: string
  services: string[]
  staffId: string
  staffName: string
  date: string
  time: string
  totalPrice: number
  totalDuration: number
  status: BookingStatus
  notes: string
  createdAt: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  visits: number
  lastVisit: string
  totalSpent: number
  services: string[]
}

// ─────────────────────────────────────────────
// LOCAL JSON fallback (used when no MONGODB_URI)
// ─────────────────────────────────────────────
function getLocalDB() {
  const { readFileSync, writeFileSync } = require('fs') as typeof import('fs')
  const path = require('path') as typeof import('path')
  const DB_PATH = path.join(process.cwd(), 'data', 'db.json')
  const raw = readFileSync(DB_PATH, 'utf-8')
  return JSON.parse(raw) as { bookings: Booking[]; customers: Customer[] }
}

function saveLocalDB(data: { bookings: Booking[]; customers: Customer[] }) {
  try {
    const { writeFileSync } = require('fs') as typeof import('fs')
    const path = require('path') as typeof import('path')
    const DB_PATH = path.join(process.cwd(), 'data', 'db.json')
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch {
    // Silently skip writes in read-only environments (e.g. Vercel demo deployment)
  }
}

// ─────────────────────────────────────────────
// BOOKINGS
// ─────────────────────────────────────────────
export async function getBookings(): Promise<Booking[]> {
  if (process.env.MONGODB_URI) {
    const { getDB } = await import('./mongodb')
    const db = await getDB()
    const docs = await db.collection('bookings').find({}).toArray()
    return docs.map(({ _id, ...rest }) => rest as Booking)
  }
  return getLocalDB().bookings
}

export async function createBooking(booking: Booking): Promise<void> {
  if (process.env.MONGODB_URI) {
    const { getDB } = await import('./mongodb')
    const db = await getDB()
    await db.collection('bookings').insertOne(booking)
    return
  }
  const local = getLocalDB()
  local.bookings.push(booking)
  saveLocalDB(local)
}

export async function updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
  if (process.env.MONGODB_URI) {
    const { getDB } = await import('./mongodb')
    const db = await getDB()
    await db.collection('bookings').updateOne({ id }, { $set: updates })
    const doc = await db.collection('bookings').findOne({ id })
    if (!doc) return null
    const { _id, ...rest } = doc
    return rest as Booking
  }
  const local = getLocalDB()
  const booking = local.bookings.find((b) => b.id === id)
  if (!booking) return null
  Object.assign(booking, updates)
  saveLocalDB(local)
  return booking
}

export async function deleteBooking(id: string): Promise<boolean> {
  if (process.env.MONGODB_URI) {
    const { getDB } = await import('./mongodb')
    const db = await getDB()
    const result = await db.collection('bookings').deleteOne({ id })
    return result.deletedCount > 0
  }
  const local = getLocalDB()
  const idx = local.bookings.findIndex((b) => b.id === id)
  if (idx === -1) return false
  local.bookings.splice(idx, 1)
  saveLocalDB(local)
  return true
}

// ─────────────────────────────────────────────
// CUSTOMERS
// ─────────────────────────────────────────────
export async function getCustomers(): Promise<Customer[]> {
  if (process.env.MONGODB_URI) {
    const { getDB } = await import('./mongodb')
    const db = await getDB()
    const docs = await db.collection('customers').find({}).toArray()
    return docs.map(({ _id, ...rest }) => rest as Customer)
  }
  return getLocalDB().customers
}

export async function upsertCustomer(
  name: string,
  phone: string,
  services: string[],
  totalPrice: number
): Promise<void> {
  if (process.env.MONGODB_URI) {
    const { getDB } = await import('./mongodb')
    const db = await getDB()
    const existing = await db.collection('customers').findOne({ phone })
    if (existing) {
      const newServices = services.filter((s) => !existing.services.includes(s))
      await db.collection('customers').updateOne(
        { phone },
        {
          $inc: { visits: 1, totalSpent: totalPrice },
          $set: {
            lastVisit: new Date().toISOString().split('T')[0],
            services: [...(existing.services ?? []), ...newServices],
          },
        }
      )
    } else {
      await db.collection('customers').insertOne({
        id: `cust-${Date.now()}`,
        name,
        phone,
        visits: 1,
        lastVisit: new Date().toISOString().split('T')[0],
        totalSpent: totalPrice,
        services,
      })
    }
    return
  }

  // Local JSON fallback
  const local = getLocalDB()
  const existing = local.customers.find((c) => c.phone === phone)
  if (existing) {
    existing.visits += 1
    existing.lastVisit = new Date().toISOString().split('T')[0]
    existing.totalSpent += totalPrice
    const newServices = services.filter((s) => !existing.services.includes(s))
    existing.services = [...existing.services, ...newServices]
  } else {
    local.customers.push({
      id: `cust-${Date.now()}`,
      name,
      phone,
      visits: 1,
      lastVisit: new Date().toISOString().split('T')[0],
      totalSpent: totalPrice,
      services,
    })
  }
  saveLocalDB(local)
}
