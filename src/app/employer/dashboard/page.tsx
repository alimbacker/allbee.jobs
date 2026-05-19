'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Briefcase, Users, Eye, TrendingUp, Plus, ChevronRight,
  Clock, CheckCircle2, XCircle, Edit2, Pause, Play, Trash2, BarChart3
} from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { timeAgo, formatJobType, cn } from '@/lib/utils'
import type { Job, Company } from '@/types'

export default function EmployerDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [company, setCompany] = useState<Company | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState({ totalJobs: 0, totalApps: 0, totalViews: 0, activeJobs: 0 })
  const [recentApps, setRecentApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
    if (user) fetchData()
  }, [user, authLoading])

  const fetchData = async () => {
    if (!user) return
    const [companyRes, jobsRes] = await Promise.all([
      supabase.from('companies').select('*').eq('owner_id', user.id).single(),
      supabase.from('jobs')
        .select('*, applications:applications(count)')
        .eq('posted_by', user.id)
        .order('created_at', { ascending: false }),
    ])

    setCompany(companyRes.data as Company)
    const jobsData = (jobsRes.data || []) as Job[]
    setJobs(jobsData)

    const totalApps = jobsData.reduce((acc: number, j: any) => acc + (j.applications?.[0]?.count || 0), 0)
    const totalViews = jobsData.reduce((acc, j) => acc + j.views_count, 0)
    const activeJobs = jobsData.filter(j => j.status === 'active').length

    setStats({ totalJobs: jobsData.length, totalApps, totalViews, activeJobs })

    if (companyRes.data) {
      const { data: apps } = await supabase
        .from('applications')
        .select(`*, job:jobs(title), seeker:profiles(full_name, avatar_url)`)
        .eq('company_id', companyRes.data.id)
        .order('created_at', { ascending: false })
        .limit(5)
      setRecentApps(apps || [])
    }

    setLoading(false)
  }

  const toggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    await supabase.from('jobs').update({ status: newStatus }).eq('id', jobId)
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus as any } : j))
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--bg-secondary)] pt-16">
        <div className="container-custom px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">
                Employer Dashboard
              </h1>
              <p className="text-[var(--text-muted)] mt-1">
                {company?.name || profile?.email}
              </p>
            </div>
            <Link href="/employer/post-job" className="btn-primary">
              <Plus size={18} /> Post a Job
            </Link>
          </div>

          {!company && (
            <div className="card p-8 text-center mb-6 border-2 border-dashed border-brand-yellow/30">
              <div className="text-5xl mb-3">🏢</div>
              <h3 className="font-bold text-xl text-[var(--text-primary)] mb-2">Set up your company profile</h3>
              <p className="text-[var(--text-muted)] mb-5">
                Create your company profile to start posting jobs and attracting candidates
              </p>
              <Link href="/employer/profile" className="btn-primary inline-flex">
                Create Company Profile
              </Link>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'text-brand-yellow' },
              { label: 'Total Applications', value: stats.totalApps, icon: Users, color: 'text-blue-500' },
              { label: 'Job Views', value: stats.totalViews, icon: Eye, color: 'text-green-500' },
              { label: 'Total Jobs Posted', value: stats.totalJobs, icon: BarChart3, color: 'text-purple-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-5">
                <Icon size={22} className={color} />
                <div className="mt-3">
                  <div className={`font-display font-bold text-3xl ${color}`}>{value}</div>
                  <div className="text-sm text-[var(--text-muted)] mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Jobs List */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Your Job Posts</h2>
                <Link href="/employer/jobs" className="btn-ghost text-sm">View all <ChevronRight size={14} /></Link>
              </div>
              <div className="space-y-3">
                {jobs.slice(0, 6).map((job) => (
                  <div key={job.id} className="card p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-[var(--text-primary)]">{job.title}</h3>
                          <span className={cn('badge text-xs',
                            job.status === 'active' ? 'badge-green' :
                              job.status === 'paused' ? 'badge-yellow' : 'badge-gray'
                          )}>
                            {job.status}
                          </span>
                          {job.is_featured && <span className="badge badge-yellow text-xs">Featured</span>}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-[var(--text-muted)]">
                          <span>{formatJobType(job.job_type)}</span>
                          <span>{job.applications_count} applications</span>
                          <span>{job.views_count} views</span>
                          <span>{timeAgo(job.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Link href={`/employer/applicants?job=${job.id}`}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="View applicants">
                          <Users size={15} />
                        </Link>
                        <Link href={`/employer/post-job?edit=${job.id}`}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-brand-yellow hover:bg-brand-yellow-light transition-colors"
                          title="Edit job">
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => toggleJobStatus(job.id, job.status)}
                          className={cn(
                            'p-1.5 rounded-lg transition-colors',
                            job.status === 'active'
                              ? 'text-[var(--text-muted)] hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                              : 'text-[var(--text-muted)] hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                          )}
                          title={job.status === 'active' ? 'Pause' : 'Activate'}
                        >
                          {job.status === 'active' ? <Pause size={15} /> : <Play size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <div className="card p-10 text-center">
                    <Briefcase size={32} className="text-[var(--text-muted)] mx-auto mb-3" />
                    <p className="text-[var(--text-muted)] mb-4">No jobs posted yet</p>
                    <Link href="/employer/post-job" className="btn-primary inline-flex">
                      <Plus size={16} /> Post First Job
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Applications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Recent Applicants</h2>
                <Link href="/employer/applicants" className="btn-ghost text-sm">View all</Link>
              </div>
              <div className="space-y-3">
                {recentApps.map((app) => (
                  <div key={app.id} className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center
                      font-bold text-brand-black text-sm flex-shrink-0">
                      {app.seeker?.full_name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[var(--text-primary)] truncate">
                        {app.seeker?.full_name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {app.job?.title}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn('badge text-xs',
                        app.status === 'shortlisted' ? 'badge-green' :
                          app.status === 'rejected' ? 'badge-red' : 'badge-yellow'
                      )}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
                {recentApps.length === 0 && (
                  <div className="card p-8 text-center">
                    <Users size={28} className="text-[var(--text-muted)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--text-muted)]">No applicants yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
