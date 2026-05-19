'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Briefcase, BookmarkCheck, Eye, TrendingUp, User, ChevronRight,
  FileText, MapPin, Bell, CheckCircle2, Clock, XCircle, Award
} from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { JobCard } from '@/components/JobCard'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { timeAgo, cn } from '@/lib/utils'
import type { Application, Job } from '@/types'

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  applied: { label: 'Applied', icon: Clock, className: 'badge-yellow' },
  viewed: { label: 'Viewed', icon: Eye, className: 'badge-blue' },
  shortlisted: { label: 'Shortlisted', icon: CheckCircle2, className: 'badge-green' },
  interview: { label: 'Interview', icon: Award, className: 'badge-green' },
  offered: { label: 'Offered!', icon: CheckCircle2, className: 'badge-green' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'badge-red' },
  withdrawn: { label: 'Withdrawn', icon: XCircle, className: 'badge-gray' },
}

export default function SeekerDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [applications, setApplications] = useState<Application[]>([])
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([])
  const [seekerProfile, setSeekerProfile] = useState<any>(null)
  const [stats, setStats] = useState({ applied: 0, saved: 0, views: 0, shortlisted: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
    if (user) fetchDashboardData()
  }, [user, authLoading])

  const fetchDashboardData = async () => {
    if (!user) return
    const [appsRes, savedRes, spRes] = await Promise.all([
      supabase
        .from('applications')
        .select(`*, job:jobs(*, company:companies(id, name, logo_url, city, is_verified))`)
        .eq('seeker_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('saved_jobs')
        .select(`job:jobs(*, company:companies(id, name, logo_url, city, is_verified))`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase.from('seeker_profiles').select('*').eq('user_id', user.id).single(),
    ])

    const apps = (appsRes.data || []) as Application[]
    const saved = savedRes.data?.map((s: any) => s.job) || []

    setApplications(apps)
    setSavedJobs(saved as Job[])
    setSeekerProfile(spRes.data)

    const shortlisted = apps.filter(a => ['shortlisted', 'interview', 'offered'].includes(a.status)).length
    setStats({
      applied: apps.length,
      saved: saved.length,
      shortlisted,
      views: apps.reduce((acc, a) => acc + (a.is_seen_by_employer ? 1 : 0), 0),
    })

    // Recommended jobs
    const { data: recommended } = await supabase
      .from('jobs')
      .select(`*, company:companies(id, name, logo_url, city, is_verified)`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(4)
    setRecommendedJobs((recommended as Job[]) || [])

    setLoading(false)
  }

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  const profileCompletion = seekerProfile?.profile_completion || 0

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--bg-secondary)] pt-16">
        <div className="container-custom px-4 py-8">
          {/* Welcome Header */}
          <div className="card p-6 mb-6 bg-gradient-to-r from-brand-black to-brand-gray-800 text-white relative overflow-hidden">
            <div className="absolute inset-0 hero-pattern opacity-20" />
            <div className="absolute top-4 right-6 text-5xl animate-float">🐝</div>
            <div className="relative">
              <p className="text-gray-400 text-sm">Good to see you,</p>
              <h1 className="font-display font-bold text-3xl text-white mt-1">
                {profile?.full_name?.split(' ')[0] || 'Job Seeker'}! 👋
              </h1>
              {profileCompletion < 100 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Profile completion</span>
                    <span className="text-brand-yellow font-bold">{profileCompletion}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-yellow rounded-full transition-all duration-500"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                  <Link href="/seeker/profile" className="text-xs text-brand-yellow hover:underline mt-2 inline-flex items-center gap-1">
                    Complete your profile <ChevronRight size={12} />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Jobs Applied', value: stats.applied, icon: Briefcase, href: '/seeker/applications', color: 'text-brand-yellow' },
              { label: 'Saved Jobs', value: stats.saved, icon: BookmarkCheck, href: '/seeker/saved', color: 'text-blue-500' },
              { label: 'Profile Views', value: stats.views, icon: Eye, href: '/seeker/profile', color: 'text-green-500' },
              { label: 'Shortlisted', value: stats.shortlisted, icon: TrendingUp, href: '/seeker/applications', color: 'text-purple-500' },
            ].map(({ label, value, icon: Icon, href, color }) => (
              <Link key={label} href={href}>
                <div className="card-interactive p-5">
                  <Icon size={22} className={color} />
                  <div className="mt-3">
                    <div className={`font-display font-bold text-3xl ${color}`}>{value}</div>
                    <div className="text-sm text-[var(--text-muted)] mt-0.5">{label}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Applications */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Recent Applications</h2>
                <Link href="/seeker/applications" className="btn-ghost text-sm">View all <ChevronRight size={14} /></Link>
              </div>
              <div className="space-y-3">
                {applications.length > 0 ? (
                  applications.map((app) => {
                    const status = statusConfig[app.status] || statusConfig.applied
                    const StatusIcon = status.icon
                    return (
                      <div key={app.id} className="card p-4 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                          flex items-center justify-center font-bold text-[var(--text-muted)] flex-shrink-0">
                          {(app.job as any)?.company?.name?.[0] || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
                            {(app.job as any)?.title}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            {(app.job as any)?.company?.name} • {timeAgo(app.created_at)}
                          </p>
                        </div>
                        <span className={cn('badge', status.className)}>
                          <StatusIcon size={10} />
                          {status.label}
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <div className="card p-10 text-center">
                    <Briefcase size={32} className="text-[var(--text-muted)] mx-auto mb-3" />
                    <p className="text-[var(--text-muted)] mb-4">No applications yet</p>
                    <Link href="/jobs" className="btn-primary">Find Jobs</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Quick Actions</h2>
              <div className="space-y-3">
                {[
                  { icon: User, label: 'Complete Profile', desc: `${profileCompletion}% done`, href: '/seeker/profile', color: 'bg-yellow-50 dark:bg-yellow-900/20 text-brand-yellow' },
                  { icon: FileText, label: 'Upload Resume', desc: seekerProfile?.resume_url ? '✓ Uploaded' : 'Not uploaded', href: '/seeker/profile', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' },
                  { icon: MapPin, label: 'Find Nearby Jobs', desc: 'Jobs near you', href: '/jobs?nearby=true', color: 'bg-green-50 dark:bg-green-900/20 text-green-500' },
                  { icon: Bell, label: 'Job Alerts', desc: 'Set up alerts', href: '/seeker/alerts', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-500' },
                ].map(({ icon: Icon, label, desc, href, color }) => (
                  <Link key={label} href={href}>
                    <div className="card-interactive p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[var(--text-primary)]">{label}</p>
                        <p className="text-xs text-[var(--text-muted)]">{desc}</p>
                      </div>
                      <ChevronRight size={16} className="text-[var(--text-muted)]" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Jobs */}
          {recommendedJobs.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">
                  🎯 Recommended for You
                </h2>
                <Link href="/jobs" className="btn-ghost text-sm">View all <ChevronRight size={14} /></Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendedJobs.map((job) => (
                  <JobCard key={job.id} job={job} compact />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
