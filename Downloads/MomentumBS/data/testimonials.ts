export interface Testimonial {
  id: string
  name: string
  service: string
  rating: number
  comment: string
  avatar: string
  date: string
}

export const testimonials: Testimonial[] = [
  {
    id: 't-001',
    name: 'Tunde Adeyemi',
    service: 'Fade + Design',
    rating: 5,
    comment:
      "Best barbershop experience in Lagos, hands down. Emeka's precision is unmatched. The fade was clean, the design was fire. This is my spot now.",
    avatar: 'https://ui-avatars.com/api/?name=Tunde+Adeyemi&background=1a1a1a&color=D4AF37&size=80&bold=true',
    date: '2024-11-15',
  },
  {
    id: 't-002',
    name: 'Kemi Fashola',
    service: 'Premium Facial Treatment',
    rating: 5,
    comment:
      "Fatima is an absolute professional. My skin has never felt this good. The whole experience was relaxing and premium. Worth every naira.",
    avatar: 'https://ui-avatars.com/api/?name=Kemi+Fashola&background=1a1a1a&color=D4AF37&size=80&bold=true',
    date: '2024-11-20',
  },
  {
    id: 't-003',
    name: 'Segun Bello',
    service: 'Hot Stone Therapy',
    rating: 5,
    comment:
      "The hot stone massage completely reset my body. I came in stressed and left feeling brand new. The ambience, the service, everything is top tier.",
    avatar: 'https://ui-avatars.com/api/?name=Segun+Bello&background=1a1a1a&color=D4AF37&size=80&bold=true',
    date: '2024-12-01',
  },
  {
    id: 't-004',
    name: 'Ngozi Okonkwo',
    service: 'Mani + Pedi Combo',
    rating: 5,
    comment:
      "Chiamaka is incredibly talented and so meticulous. The salon is clean, stylish, and the vibe is just right. Will definitely be back every month.",
    avatar: 'https://ui-avatars.com/api/?name=Ngozi+Okonkwo&background=1a1a1a&color=D4AF37&size=80&bold=true',
    date: '2024-12-08',
  },
  {
    id: 't-005',
    name: 'Chidi Eze',
    service: 'Teeth Whitening',
    rating: 5,
    comment:
      "I was skeptical but the results were visible after just one session. Professional setup, painless process, and great results. Highly recommend.",
    avatar: 'https://ui-avatars.com/api/?name=Chidi+Eze&background=1a1a1a&color=D4AF37&size=80&bold=true',
    date: '2024-12-12',
  },
  {
    id: 't-006',
    name: 'Amara Obi',
    service: 'Hair + Beard Combo',
    rating: 5,
    comment:
      "Walked in looking regular, walked out looking like a whole new man. The staff really takes time to understand exactly what you want. This place is elite.",
    avatar: 'https://ui-avatars.com/api/?name=Amara+Obi&background=1a1a1a&color=D4AF37&size=80&bold=true',
    date: '2024-12-18',
  },
]
