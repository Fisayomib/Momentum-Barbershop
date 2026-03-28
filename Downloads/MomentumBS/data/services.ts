export type ServiceCategory = 'haircut' | 'facial' | 'massage' | 'teeth' | 'nails'

export interface Service {
  id: string
  name: string
  category: ServiceCategory
  description: string
  price: number
  duration: number // minutes
  icon: string
}

export const services: Service[] = [
  // Haircuts
  {
    id: 'svc-001',
    name: 'Classic Haircut',
    category: 'haircut',
    description: 'A clean, precise cut tailored to your head shape and style preference. Includes wash and finish.',
    price: 2500,
    duration: 30,
    icon: '✂️',
  },
  {
    id: 'svc-002',
    name: 'Fade + Design',
    category: 'haircut',
    description: 'Sharp fade with custom line designs. Precision cuts that make a statement.',
    price: 4000,
    duration: 45,
    icon: '💈',
  },
  {
    id: 'svc-003',
    name: 'Beard Trim & Shape',
    category: 'haircut',
    description: 'Expert beard grooming, shaping, and trim with hot towel finish.',
    price: 1500,
    duration: 20,
    icon: '🧔',
  },
  {
    id: 'svc-004',
    name: 'Hair + Beard Combo',
    category: 'haircut',
    description: 'Full haircut combined with complete beard grooming. The total refresh package.',
    price: 5000,
    duration: 60,
    icon: '👑',
  },
  // Facials
  {
    id: 'svc-005',
    name: 'Express Facial Cleanse',
    category: 'facial',
    description: 'Quick deep-cleanse facial to remove dirt, unclog pores, and refresh your skin.',
    price: 3500,
    duration: 45,
    icon: '🧴',
  },
  {
    id: 'svc-006',
    name: 'Premium Facial Treatment',
    category: 'facial',
    description: 'Full treatment including steam, extraction, mask, and moisturizing for radiant skin.',
    price: 6000,
    duration: 60,
    icon: '✨',
  },
  // Massage
  {
    id: 'svc-007',
    name: 'Swedish Relaxation Massage',
    category: 'massage',
    description: 'Full-body Swedish massage to relieve stress, improve circulation, and relax muscles.',
    price: 8000,
    duration: 60,
    icon: '💆',
  },
  {
    id: 'svc-008',
    name: 'Hot Stone Therapy',
    category: 'massage',
    description: 'Therapeutic massage using heated basalt stones to melt away deep tension.',
    price: 12000,
    duration: 90,
    icon: '🪨',
  },
  // Teeth Whitening
  {
    id: 'svc-009',
    name: 'Professional Teeth Whitening',
    category: 'teeth',
    description: 'Safe LED-accelerated whitening treatment for a noticeably brighter smile in one session.',
    price: 15000,
    duration: 60,
    icon: '🦷',
  },
  // Nails
  {
    id: 'svc-010',
    name: 'Classic Manicure',
    category: 'nails',
    description: 'Nail shaping, cuticle care, buffing, and polish. Hands that demand attention.',
    price: 3000,
    duration: 45,
    icon: '💅',
  },
  {
    id: 'svc-011',
    name: 'Classic Pedicure',
    category: 'nails',
    description: 'Soak, exfoliation, nail shaping, and polish. Total foot care and relaxation.',
    price: 4000,
    duration: 60,
    icon: '🦶',
  },
  {
    id: 'svc-012',
    name: 'Mani + Pedi Combo',
    category: 'nails',
    description: 'Complete manicure and pedicure treatment. The ultimate hand and foot experience.',
    price: 6500,
    duration: 90,
    icon: '💎',
  },
]

export const categoryLabels: Record<ServiceCategory, string> = {
  haircut: 'Haircuts',
  facial: 'Facials',
  massage: 'Massage',
  teeth: 'Teeth Whitening',
  nails: 'Manicure & Pedicure',
}

export const categoryIcons: Record<ServiceCategory, string> = {
  haircut: '✂️',
  facial: '🧴',
  massage: '💆',
  teeth: '🦷',
  nails: '💅',
}

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id)
}

export function getServicesByCategory(category: ServiceCategory): Service[] {
  return services.filter((s) => s.category === category)
}
