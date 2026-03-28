import { NextResponse } from 'next/server'
import { getCustomers } from '@/lib/db'

export async function GET() {
  try {
    const customers = await getCustomers()
    return NextResponse.json(customers)
  } catch {
    return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 })
  }
}
