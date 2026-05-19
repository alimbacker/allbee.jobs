import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, TrendingUp, Award, Users, Briefcase, ArrowRight, Star, ChevronRight, Building2, Zap, Shield, Clock, Phone } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SearchBar } from '@/components/SearchBar'
import { JobCard } from '@/components/JobCard'
import { AllBeeLogo } from '@/components/ui/Logo'
import { createServerSupabaseClient } from '@/lib/supabase'
import { JOB_CATEGORIES } from '@/lib/utils'
import type { Job } from '@/types'

export const metadata: Metadata = {
  title: 'AllBee Jobs – Your Local Career Partner | Jobs in Tamil Nadu',
  description: 'Find local jobs near you in Tamil Nadu. Connect with employers in Coimbatore, Chennai, Madurai and more. Search 10,000+ jobs. Apply in seconds!',
}

const stats = [
  { value: '50,000+', label: 'Active Jobs', icon: Briefcase },
  { value: '10,000+', label: 'Companies', icon: Building2 },
  { value: '2,00,000+', label: 'Job Seekers', icon: Users },
  { value: '25 Cities', label: 'Across Tamil Nadu', icon: MapPin },
]

const features = [
  {
    icon: MapPin,
    title: 'Hyperlocal Jobs',
    description: 'Find jobs within your city or even your neighborhood. Apply to companies near your home.',
    color: 'bg-yellow-50 dark:bg-yellow-900/20 text-brand-yellow',
  },
  {
    icon: Phone,
    title: 'WhatsApp Apply',
    description: 'Apply to jobs instantly via WhatsApp. No lengthy forms – just send a message!',
    color: 'bg-green-50 dark:bg-green-900/20 text-green-500',
  },
  {
    icon: Shield,
    title: 'Verified Employers',
    description: 'All companies are verified. No fake jobs. Safe and trusted job postings only.',
    color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500',
  },
  {
    icon: Zap,
    title: 'Instant Alerts',
    description: 'Get notified the moment a new job matching your profile is posted near you.',
    color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-500',
  },
  {
    icon: Clock,
    title: '60-Second Apply',
    description: 'Our one-click apply lets you apply to multiple jobs in under a minute.',
    color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-500',
  },
  {
    icon: Award,
    title: 'Tamil Support',
    description: 'Full Tamil language support. Browse jobs and apply in your native language.',
    color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-500',
  },
]

async function getFeaturedJobs(): Promise<Job[]> {
  try {
    const supabase = createServerSupabaseClient()
    const { data } = await supabase
      .from('jobs')
      .select(`*, company:companies(id, name, logo_url, city, is_verified), category:job_categories(id, name, icon)`)
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6)
    return (data as Job[]) || []
  } catch {
    return []
  }
}

async function getTopCategories() {
  try {
    const supabase = createServerSupabaseClient()
    const { data } = await supabase
      .from('job_categories')
      .select('*')
      .eq('is_active', true)
      .order('job_count', { ascending: false })
      .limit(12)
    return data || []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [featuredJobs, topCategories] = await Promise.all([
    getFeaturedJobs(),
    getTopCategories(),
  ])

  const displayCategories = topCategories.length > 0 ? topCategories : JOB_CATEGORIES.slice(0, 12)

  return (
    <>
      <Header />
      <main>
        {/* ====== HERO SECTION ====== */}
        <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-black via-brand-gray-900 to-brand-gray-800">
            <div className="absolute inset-0 hero-pattern opacity-30" />
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-brand-yellow/5 rounded-full blur-2xl" />
          </div>

          <div className="relative container-custom px-4 py-20 md:py-32">
            <div className="max-w-4xl mx-auto text-center">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-yellow/10
                border border-brand-yellow/20 text-brand-yellow text-sm font-medium mb-6 animate-fade-in">
                <span className="w-2 h-2 bg-brand-yellow rounded-full animate-pulse" />
                Tamil Nadu's #1 Hyperlocal Job Portal
                <ChevronRight size={14} />
              </div>

              {/* Headline */}
              <h1 className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl text-white
                leading-tight mb-6 animate-slide-up">
                Find Jobs{' '}
                <span className="relative inline-block">
                  <span className="text-gradient">Near You</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M1 9 Q75 1 150 9 Q225 17 299 9" stroke="#F5C518" strokeWidth="3"
                      strokeLinecap="round" fill="none" opacity="0.6" />
                  </svg>
                </span>
                <br />in Tamil Nadu 🐝
              </h1>

              <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-slide-up"
                style={{ animationDelay: '0.1s' }}>
                Connecting local businesses with nearby job seekers.
                Search jobs by location, salary, and category. Apply in seconds!
              </p>

              {/* Search Bar */}
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <SearchBar size="lg" />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 animate-fade-in"
                style={{ animationDelay: '0.3s' }}>
                {stats.map(({ value, label, icon: Icon }) => (
                  <div key={label} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Icon size={16} className="text-brand-yellow" />
                      <span className="font-display font-bold text-2xl md:text-3xl text-white">
                        {value}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-brand-yellow/30 flex justify-center pt-2">
              <div className="w-1 h-3 bg-brand-yellow rounded-full animate-float" />
            </div>
          </div>
        </section>

        {/* ====== JOB CATEGORIES ====== */}
        <section className="section bg-[var(--bg-secondary)]">
          <div className="container-custom px-4">
            <div className="text-center mb-12">
              <h2 className="section-title">Browse by <span className="text-gradient">Category</span></h2>
              <p className="section-subtitle">Find jobs in your field of expertise</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {displayCategories.map((cat: any, i: number) => (
                <Link
                  key={cat.id || cat.value}
                  href={`/jobs?category=${cat.slug || cat.value}`}
                  className="card-interactive p-4 text-center group"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                    {cat.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-brand-yellow
                    transition-colors leading-tight">
                    {cat.name || cat.label}
                  </h3>
                  {(cat.job_count > 0) && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {cat.job_count.toLocaleString()} jobs
                    </p>
                  )}
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/jobs" className="btn-secondary inline-flex">
                View All Categories <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ====== FEATURED JOBS ====== */}
        <section className="section">
          <div className="container-custom px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="section-title">
                  ⭐ Featured <span className="text-gradient">Jobs</span>
                </h2>
                <p className="section-subtitle">Handpicked opportunities from top employers</p>
              </div>
              <Link href="/jobs?featured=true" className="btn-ghost hidden md:flex">
                View all <ArrowRight size={16} />
              </Link>
            </div>

            {featuredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 card">
                <div className="text-5xl mb-4">🐝</div>
                <p className="text-[var(--text-muted)]">
                  No featured jobs yet. Be the first to post!
                </p>
                <Link href="/employer/post-job" className="btn-primary mt-4 inline-flex">
                  Post a Job
                </Link>
              </div>
            )}

            <div className="text-center mt-8">
              <Link href="/jobs" className="btn-primary inline-flex">
                Explore All Jobs <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ====== HOW IT WORKS ====== */}
        <section className="section bg-[var(--bg-secondary)]">
          <div className="container-custom px-4">
            <div className="text-center mb-12">
              <h2 className="section-title">How <span className="text-gradient">AllBee Jobs</span> Works</h2>
              <p className="section-subtitle">Get hired in 3 simple steps</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* For Job Seekers */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <span className="badge badge-yellow text-sm">For Job Seekers</span>
                </div>
                <div className="space-y-6">
                  {[
                    { step: '01', title: 'Create Your Profile', desc: 'Sign up and build your profile with skills, experience, and upload your resume.' },
                    { step: '02', title: 'Find Nearby Jobs', desc: 'Search jobs near your location, filter by salary, category, and job type.' },
                    { step: '03', title: 'Apply in One Click', desc: 'Apply instantly or via WhatsApp. Track all your applications from dashboard.' },
                  ].map(({ step, title, desc }) => (
                    <div key={step} className="flex gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-brand-yellow flex items-center justify-center
                        text-brand-black font-display font-extrabold text-lg flex-shrink-0">
                        {step}
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--text-primary)] mb-1">{title}</h3>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/auth/register" className="btn-primary mt-8 inline-flex">
                  Start Job Hunting <ArrowRight size={16} />
                </Link>
              </div>

              {/* For Employers */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <span className="badge badge-green text-sm">For Employers</span>
                </div>
                <div className="space-y-6">
                  {[
                    { step: '01', title: 'Create Company Profile', desc: 'Set up your company profile with logo, description, and contact details.' },
                    { step: '02', title: 'Post Your Job', desc: 'Describe the role, set salary, location, and requirements. It\'s free to start!' },
                    { step: '03', title: 'Hire Local Talent', desc: 'Review applicants, shortlist candidates, and schedule interviews easily.' },
                  ].map(({ step, title, desc }) => (
                    <div key={step} className="flex gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-accent-green flex items-center justify-center
                        text-white font-display font-extrabold text-lg flex-shrink-0">
                        {step}
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--text-primary)] mb-1">{title}</h3>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/auth/register?role=employer" className="btn-secondary mt-8 inline-flex">
                  Post Jobs Free <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ====== WHY ALLBEE ====== */}
        <section className="section">
          <div className="container-custom px-4">
            <div className="text-center mb-12">
              <h2 className="section-title">Why Choose <span className="text-gradient">AllBee Jobs?</span></h2>
              <p className="section-subtitle">Built specifically for Tamil Nadu's workforce</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(({ icon: Icon, title, description, color }) => (
                <div key={title} className="card-interactive p-6 group">
                  <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4
                    group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-2">
                    {title}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== TESTIMONIALS ====== */}
        <section className="section bg-[var(--bg-secondary)]">
          <div className="container-custom px-4">
            <div className="text-center mb-12">
              <h2 className="section-title">Success <span className="text-gradient">Stories</span></h2>
              <p className="section-subtitle">Real people, real results with AllBee Jobs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Priya Ramesh', role: 'Software Developer', company: 'TechCorp Coimbatore',
                  content: 'Found my dream job within 2 weeks! AllBee Jobs made it so easy to find local opportunities near my home.', rating: 5
                },
                {
                  name: 'Karthik Murugan', role: 'HR Manager', company: 'Vellalar Industries',
                  content: 'As an employer, AllBee Jobs helped us hire 15 quality candidates in just one month. Excellent platform!', rating: 5
                },
                {
                  name: 'Deepa Sundar', role: 'Teacher', company: 'Bright Future School',
                  content: 'The Tamil language support made it very comfortable for me. Got placed as a teacher near my area!', rating: 5
                },
              ].map(({ name, role, company, content, rating }) => (
                <div key={name} className="card p-6">
                  <div className="flex mb-3">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} size={14} className="text-brand-yellow fill-brand-yellow" />
                    ))}
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4 italic">
                    "{content}"
                  </p>
                  <div className="flex items-center gap-3 border-t border-[var(--border)] pt-4">
                    <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center
                      font-bold text-brand-black text-sm flex-shrink-0">
                      {name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[var(--text-primary)]">{name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{role} @ {company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== CTA BANNER ====== */}
        <section className="section">
          <div className="container-custom px-4">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-black to-brand-gray-800 p-8 md:p-16 text-center">
              <div className="absolute inset-0 hero-pattern opacity-20" />
              <div className="absolute top-8 right-8 text-6xl animate-float">🐝</div>
              <div className="relative">
                <span className="badge badge-yellow mb-4 text-sm">🎯 Start Today – It's Free!</span>
                <h2 className="font-display font-extrabold text-3xl md:text-5xl text-white mb-4">
                  Ready to Find Your{' '}
                  <span className="text-brand-yellow">Dream Job</span>?
                </h2>
                <p className="text-gray-300 text-lg max-w-xl mx-auto mb-8">
                  Join 2,00,000+ job seekers who found their perfect local job with AllBee Jobs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/register" className="btn-primary text-base px-8 py-4">
                    Create Free Account <ArrowRight size={18} />
                  </Link>
                  <Link href="/jobs" className="btn-secondary text-base px-8 py-4 border-white/30 text-white hover:border-brand-yellow">
                    Browse Jobs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
