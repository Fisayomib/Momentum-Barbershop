import { NextResponse } from 'next/server'
import { staff } from '@/data/staff'

export async function GET() {
  return NextResponse.json(staff)
}
