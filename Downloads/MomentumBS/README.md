# Momentum Barbershop & Spa — Full Web Application

A complete, production-ready web application for a premium barbershop and spa business.

---

## Features

- **Customer Website** — Homepage, Services, Multi-step Booking, Contact
- **Booking System** — 5-step wizard: Services → Staff → Date/Time → Details → Confirm
- **Admin Dashboard** — Bookings management, Customer CRM, Staff view, Analytics
- **AI Chat Widget** — Floating assistant with predefined intelligent responses
- **WhatsApp Integration** — Click-to-chat button
- **Google Maps Embed** — Location on Contact page
- **Dark Premium UI** — Gold accents, Framer Motion animations, mobile-first

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18 |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Database | JSON file (local dev) |
| API | Next.js API Routes |

---

## Setup & Running Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Pages & Routes

| Route | Description |
|---|---|
| `/` | Homepage |
| `/services` | Services catalogue |
| `/booking` | Multi-step booking wizard |
| `/contact` | Contact info, WhatsApp, Map |
| `/admin/login` | Admin login |
| `/admin` | Dashboard overview |
| `/admin/bookings` | Booking management |
| `/admin/customers` | Customer CRM |
| `/admin/staff` | Staff management |
| `/admin/analytics` | Business analytics |

---

## Admin Access

- URL: `http://localhost:3000/admin`
- Password: `momentum2024`

---

## Customisation

### Update business details
Edit these files:
- `data/services.ts` — Service names, prices, durations
- `data/staff.ts` — Staff names, roles, photos, specialties
- `data/testimonials.ts` — Customer reviews
- `app/(main)/contact/page.tsx` — Address, phone, WhatsApp link, Google Maps embed URL
- `components/layout/Footer.tsx` — Footer contact details

### Replace placeholder images
- Staff photos: Replace `ui-avatars.com` URLs in `data/staff.ts` with real photo URLs/paths
- Gallery: Replace `picsum.photos` URLs in `components/home/InstagramPreview.tsx`

### Connect a real Instagram feed
Replace the static grid in `components/home/InstagramPreview.tsx` with Instagram Basic Display API integration.

### Production database
The app uses a JSON file (`data/db.json`) for local development. For production, replace `lib/db.ts` with a proper database (PostgreSQL, MongoDB, SQLite via Prisma, etc.).

### Admin password
Change the `ADMIN_PASSWORD` constant in `app/admin/login/page.tsx`. For production, use environment variables and proper authentication (NextAuth.js, Clerk, etc.).

---

## Project Structure

```
momentum-barbershop/
├── app/
│   ├── (main)/           ← Customer-facing pages (Navbar + Footer)
│   │   ├── page.tsx      ← Homepage
│   │   ├── services/
│   │   ├── booking/
│   │   └── contact/
│   ├── admin/            ← Admin dashboard
│   │   ├── login/
│   │   ├── page.tsx      ← Dashboard overview
│   │   ├── bookings/
│   │   ├── customers/
│   │   ├── staff/
│   │   └── analytics/
│   ├── api/              ← API routes
│   │   ├── bookings/
│   │   ├── availability/
│   │   ├── customers/
│   │   └── staff/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── layout/           ← Navbar, Footer
│   ├── home/             ← Hero, ServicesOverview, Testimonials, Instagram
│   ├── booking/          ← BookingWizard + 5 step components
│   ├── admin/            ← AdminSidebar, StatsCard, BookingsTable, AuthGuard
│   └── ai/               ← ChatWidget
├── data/
│   ├── services.ts
│   ├── staff.ts
│   ├── testimonials.ts
│   └── db.json           ← Mock database
└── lib/
    ├── db.ts             ← JSON DB helpers
    └── utils.ts          ← Formatting utilities
```

---

## Build for Production

```bash
npm run build
npm start
```

> **Note:** The JSON file database (`data/db.json`) will not persist writes on serverless platforms like Vercel. For deployment, swap with a hosted database (Supabase, PlanetScale, MongoDB Atlas, etc.).
