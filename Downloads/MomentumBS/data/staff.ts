export type StaffSpecialty = 'haircut' | 'facial' | 'massage' | 'teeth' | 'nails'

export const categoryLabels: Record<StaffSpecialty, string> = {
  haircut: 'Haircuts',
  facial: 'Facials',
  massage: 'Massage',
  teeth: 'Teeth Whitening',
  nails: 'Manicure & Pedicure',
}

export interface StaffMember {
  id: string
  name: string
  role: string
  specialties: StaffSpecialty[]
  bio: string
  photo: string
  available: boolean
  workingHours: { start: string; end: string }
  workingDays: number[] // 0=Sun, 1=Mon, ..., 6=Sat
}

export const staff: StaffMember[] = [
  {
    id: 'stf-001',
    name: 'Emeka Okafor',
    role: 'Master Barber',
    specialties: ['haircut'],
    bio: '10+ years crafting the cleanest fades and cuts in Lagos. Specialist in classic and modern styles.',
    photo: 'https://ui-avatars.com/api/?name=Emeka+Okafor&background=D4AF37&color=0a0a0a&size=200&bold=true',
    available: true,
    workingHours: { start: '09:00', end: '20:00' },
    workingDays: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 'stf-002',
    name: 'Bayo Oladipo',
    role: 'Senior Barber',
    specialties: ['haircut'],
    bio: 'Expert in fades, designs, and beard grooming. Known for his attention to detail and precision.',
    photo: 'https://ui-avatars.com/api/?name=Bayo+Oladipo&background=D4AF37&color=0a0a0a&size=200&bold=true',
    available: true,
    workingHours: { start: '09:00', end: '20:00' },
    workingDays: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 'stf-003',
    name: 'Ibrahim Yusuf',
    role: 'Barber',
    specialties: ['haircut'],
    bio: 'Skilled in both traditional and contemporary cuts. Passionate about elevating every client\'s look.',
    photo: 'https://ui-avatars.com/api/?name=Ibrahim+Yusuf&background=D4AF37&color=0a0a0a&size=200&bold=true',
    available: true,
    workingHours: { start: '09:00', end: '20:00' },
    workingDays: [2, 3, 4, 5, 6, 0],
  },
  {
    id: 'stf-004',
    name: 'Fatima Aliyu',
    role: 'Spa Therapist',
    specialties: ['facial', 'massage', 'teeth'],
    bio: 'Certified aesthetician and massage therapist with 7 years of luxury spa experience.',
    photo: 'https://ui-avatars.com/api/?name=Fatima+Aliyu&background=D4AF37&color=0a0a0a&size=200&bold=true',
    available: true,
    workingHours: { start: '10:00', end: '19:00' },
    workingDays: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 'stf-005',
    name: 'Chiamaka Eze',
    role: 'Nail Technician',
    specialties: ['nails'],
    bio: 'Professional nail artist specialising in classic and creative nail care treatments.',
    photo: 'https://ui-avatars.com/api/?name=Chiamaka+Eze&background=D4AF37&color=0a0a0a&size=200&bold=true',
    available: true,
    workingHours: { start: '09:00', end: '18:00' },
    workingDays: [1, 2, 3, 4, 5, 6],
  },
]

export function getStaffById(id: string): StaffMember | undefined {
  return staff.find((s) => s.id === id)
}

export function getStaffBySpecialty(specialty: StaffSpecialty): StaffMember[] {
  return staff.filter((s) => s.specialties.includes(specialty) && s.available)
}
