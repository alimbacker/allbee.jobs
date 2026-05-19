'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Briefcase, Clock, Eye, CheckCircle2, XCircle, Award,
  MessageCircle, ChevronRight, Filter, Search
} from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { timeAgo, getWhatsAppLink, cn } from '@/lib/utils'
import type { Application } from '@/types'

const statusConfig = {
  applied: { label: 'Applied', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', badge: 'badge-yellow' },
  viewed: { label: 'Profile Viewed', icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', badge: 'badge-blue' },
  shortlisted: { label: 'Shortlisted', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', badge: 'badge-green' },
  interview: { label: 'Interview Scheduled', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', badge: 'badge-green' },
  offered: { label: 'Offer Received! 🎉', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', badge: 'badge-green' },
  rejected: { label: 'Not Selected', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', badge: 'badge-red' },
  withdrawn: { label: 'Withdrawn', icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-900/20', badge: 'badge-gray' },
}

export default function ApplicationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    fetchApplications()
  }, [user])

  const fetchApplications = async () => {
    if (!user) return
    const { data } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(
          id, title, job_type, location, salary_min, salary_max, is_salary_disclosed,
          company:companies(id, name, logo_url, city, phone, is_verified)
        )
      `)
      .eq('seeker_id', user.id)
      .order('created_at', { ascending: false })
    setApplications(data || [])
    setLoading(false)
  }

  const handleWithdraw = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return
    await supabase.from('applications').update({ status: 'withdrawn' }).eq('id', appId)
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'withdrawn' } : a))
  }

  const filtered = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter
    const matchesSearch = search
      ? app.job?.title?.toLowerCase().includes(search.toLowerCase()) ||
        app.job?.company?.name?.toLowerCase().includes(search.toLowerCase())
      : true
    return matchesFilter && matchesSearch
  })

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--bg-secondary)] pt-16">
        <div className="container-custom px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">My Applications</h1>
            <p className="text-[var(--text-muted)] mt-1">{applications.length} total applications</p>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            {[
              { key: 'all', label: 'All', count: applications.length },
              { key: 'applied', label: 'Applied', count: statusCounts.applied || 0 },
              { key: 'viewed', label: 'Viewed', count: statusCounts.viewed || 0 },
              { key: 'shortlisted', label: 'Shortlisted', count: statusCounts.shortlisted || 0 },
              { key: 'interview', label: 'Interview', count: statusCounts.interview || 0 },
              { key: 'offered', label: 'Offered', count: statusCounts.offered || 0 },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  'card p-3 text-center transition-all',
                  filter === key ? 'ring-2 ring-brand-yellow bg-brand-yellow-light dark:bg-yellow-900/20' : 'hover:border-brand-yellow/50'
                )}
              >
                <div className={cn('font-display font-bold text-xl', filter === key ? 'text-brand-yellow' : 'text-[var(--text-primary)]')}>
                  {count}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{label}</div>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title or company..."
              className="input pl-10"
            />
          </div>

          {/* Applications List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 skeleton rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 skeleton rounded w-3/5" />
                      <div className="h-3 skeleton rounded w-2/5" />
                      <div className="h-3 skeleton rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((app) => {
                const status = statusConfig[app.status as keyof typeof statusConfig] || statusConfig.applied
                const StatusIcon = status.icon
                const job = app.job
                const company = job?.company

                return (
                  <div key={app.id} className="card p-5">
                    <div className="flex items-start gap-4">
                      {/* Company Logo */}
                      <div className="w-14 h-14 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]
                        flex items-center justify-center font-bold text-xl text-[var(--text-muted)] flex-shrink-0">
                        {company?.name?.[0]?.toUpperCase() || '?'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <Link href={`/jobs/${job?.id}`}
                              className="font-display font-bold text-lg text-[var(--text-primary)] hover:text-brand-yellow transition-colors">
                              {job?.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[var(--text-secondary)] text-sm">{company?.name}</span>
                              {company?.is_verified && <span className="text-brand-yellow text-xs">✓</span>}
                            </div>
                          </div>
                          <span className={cn('badge', status.badge)}>
                            <StatusIcon size={11} />
                            {status.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-[var(--text-muted)]">
                          <span>📍 {job?.location}</span>
                          <span>Applied {timeAgo(app.created_at)}</span>
                          {app.applied_via === 'whatsapp' && (
                            <span className="text-green-500">via WhatsApp</span>
                          )}
                        </div>

                        {/* Status Progress */}
                        <div className="mt-4">
                          <div className="flex items-center gap-1 overflow-x-auto pb-1">
                            {['applied', 'viewed', 'shortlisted', 'interview', 'offered'].map((s, idx, arr) => {
                              const statuses = ['applied', 'viewed', 'shortlisted', 'interview', 'offered']
                              const currentIdx = statuses.indexOf(app.status)
                              const isActive = statuses.indexOf(s) <= currentIdx && app.status !== 'rejected' && app.status !== 'withdrawn'
                              const isCurrent = s === app.status
                              return (
                                <div key={s} className="flex items-center gap-1 flex-shrink-0">
                                  <div className={cn(
                                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                                    isCurrent ? 'bg-brand-yellow text-brand-black ring-2 ring-brand-yellow ring-offset-2' :
                                      isActive ? 'bg-brand-yellow text-brand-black' :
                                        'bg-[var(--border)] text-[var(--text-muted)]'
                                  )}>
                                    {isActive ? '✓' : idx + 1}
                                  </div>
                                  <span className={cn('text-xs hidden sm:block', isCurrent ? 'text-brand-yellow font-medium' : 'text-[var(--text-muted)]')}>
                                    {s}
                                  </span>
                                  {idx < arr.length - 1 && (
                                    <div className={cn('w-6 h-0.5 mx-1', isActive ? 'bg-brand-yellow' : 'bg-[var(--border)]')} />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                          <Link href={`/jobs/${job?.id}`} className="btn-secondary py-2 px-3 text-xs">
                            View Job
                          </Link>
                          {company?.phone && (
                            <a
                              href={getWhatsAppLink(company.phone, job?.title, company.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-whatsapp py-2 px-3 text-xs"
                            >
                              <MessageCircle size={13} />
                              WhatsApp
                            </a>
                          )}
                          {app.status !== 'withdrawn' && app.status !== 'offered' && (
                            <button onClick={() => handleWithdraw(app.id)}
                              className="btn-ghost text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 px-3 ml-auto">
                              Withdraw
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="card p-16 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-display font-bold text-xl text-[var(--text-primary)] mb-2">
                {filter !== 'all' ? `No ${filter} applications` : 'No applications yet'}
              </h3>
              <p className="text-[var(--text-muted)] mb-6">
                {filter !== 'all'
                  ? 'Try a different filter'
                  : 'Start applying to jobs and track them here'}
              </p>
              <Link href="/jobs" className="btn-primary inline-flex">Browse Jobs</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
