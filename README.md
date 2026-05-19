# 🐝 AllBee Jobs — Your Local Career Partner

A **hyperlocal job portal** built for Tamil Nadu, connecting local businesses with nearby job seekers.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18 |
| Styling | Tailwind CSS, Framer Motion |
| Backend | Supabase (Auth + Database + Storage) |
| Database | PostgreSQL (via Supabase) |
| Deployment | Vercel |

---

## ✨ Features

### 🎯 Job Seeker
- Email / Google / Mobile OTP login
- Create & manage profile with resume upload
- Search nearby jobs using GPS location
- Save jobs and track applications
- Apply via platform or WhatsApp
- Tamil & English language support

### 🏢 Employer
- Company profile setup
- 4-step job posting wizard
- View & manage applicants
- Shortlist / reject / schedule interviews
- Toggle job status (active/paused)

### 🛡️ Admin
- Platform analytics dashboard with charts
- Manage users & jobs
- Activate/deactivate content

### 🌟 Platform
- Dark/Light mode
- Mobile responsive
- SEO optimized (sitemap, meta tags, OG)
- Location-based job search (PostGIS)
- Yellow × Black × White brand identity

---

## 🛠️ Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/yourname/allbee-jobs.git
cd allbee-jobs
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Copy your **Project URL** and **Anon Key**
3. Go to **SQL Editor** and run `supabase/schema.sql`

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configure Supabase Auth

In your Supabase dashboard:

**Authentication > Providers:**
- Enable **Email** auth
- Enable **Google** (add your OAuth credentials)
- Enable **Phone** (SMS OTP)

**Authentication > URL Configuration:**
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

**Storage:**
Create two buckets:
- `resumes` (public)
- `company-assets` (public)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deploy to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

### Option B: GitHub Integration

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables on Vercel

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` |

---

## 📁 Project Structure

```
allbee-jobs/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   ├── auth/
│   │   │   ├── login/            # Login page
│   │   │   ├── register/         # Register page
│   │   │   └── callback/         # OAuth callback
│   │   ├── jobs/
│   │   │   ├── page.tsx          # Jobs listing
│   │   │   └── [id]/page.tsx     # Job detail
│   │   ├── seeker/
│   │   │   ├── dashboard/        # Seeker dashboard
│   │   │   ├── profile/          # Profile management
│   │   │   ├── applications/     # Track applications
│   │   │   └── saved/            # Saved jobs
│   │   ├── employer/
│   │   │   ├── dashboard/        # Employer dashboard
│   │   │   ├── post-job/         # Post a job (4 steps)
│   │   │   ├── applicants/       # Manage applicants
│   │   │   └── profile/          # Company profile
│   │   ├── admin/
│   │   │   └── dashboard/        # Admin analytics
│   │   ├── companies/            # Companies listing
│   │   └── api/
│   │       └── sitemap/          # Dynamic sitemap
│   ├── components/
│   │   ├── ui/Logo.tsx           # AllBee bee logo
│   │   ├── Header.tsx            # Navigation
│   │   ├── Footer.tsx            # Footer
│   │   ├── JobCard.tsx           # Job card component
│   │   └── SearchBar.tsx         # Search with location
│   ├── contexts/
│   │   ├── AuthContext.tsx       # Auth state
│   │   └── LanguageContext.tsx   # Tamil/English
│   ├── lib/
│   │   ├── supabase.ts           # Supabase clients
│   │   └── utils.ts              # Helpers & translations
│   ├── types/
│   │   └── index.ts              # TypeScript types
│   └── middleware.ts             # Auth route protection
├── supabase/
│   └── schema.sql                # Complete DB schema
├── public/                       # Static assets
├── .env.example                  # Environment template
├── vercel.json                   # Vercel config
├── tailwind.config.js            # Brand design system
└── README.md
```

---

## 🎨 Brand Identity

| Color | Hex | Usage |
|-------|-----|-------|
| Yellow | `#F5C518` | Primary CTA, highlights |
| Black | `#0A0A0A` | Background dark, text |
| White | `#FFFFFF` | Background light |
| Dark Yellow | `#D4A800` | Hover states |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Extended user info (role, phone, language) |
| `seeker_profiles` | Job seeker details, resume, skills |
| `companies` | Employer company profiles |
| `jobs` | Job postings with location coords |
| `applications` | Job applications with status tracking |
| `saved_jobs` | User bookmarked jobs |
| `job_categories` | Categories with Tamil names |
| `notifications` | User notifications |
| `testimonials` | Platform reviews |

---

## 📱 Key Pages

| Route | Page |
|-------|------|
| `/` | Landing page with search |
| `/jobs` | Browse & filter jobs |
| `/jobs/[id]` | Job detail + apply |
| `/companies` | Top companies |
| `/auth/login` | Email + Google + OTP |
| `/auth/register` | Seeker or Employer |
| `/seeker/dashboard` | Job seeker home |
| `/seeker/profile` | Profile editor |
| `/seeker/applications` | Application tracker |
| `/seeker/saved` | Bookmarked jobs |
| `/employer/dashboard` | Employer home |
| `/employer/post-job` | 4-step job wizard |
| `/employer/applicants` | Manage applicants |
| `/employer/profile` | Company setup |
| `/admin/dashboard` | Admin analytics |

---

## 🌏 Tamil Language Support

The platform supports Tamil (தமிழ்) throughout:
- Navigation labels
- Job search UI
- Job categories with Tamil names
- Toggle via language switcher in header

---

## 🤝 Contributing

Built with ❤️ by **AllBee Solutions** for Tamil Nadu's workforce.

**License:** MIT

---

*🐝 Your Local Career Partner — AllBee Jobs*
