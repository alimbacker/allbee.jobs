'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Users, Search, Download, Eye, CheckCircle2, XCircle,
  MessageCircle, ChevronDown, FileText, Filter, Award
} from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { timeAgo, getWhatsAppLink, cn } from '@/lib/utils'
import type { Application, Job } from '@/types'
import toast from 'react-hot-toast'

const APPLICATION_STATUSES = ['applied', 'viewed', 'shortlisted', 'interview', 'offered', 'rejected']

export default function ApplicantsPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const jobFilter = searchParams.get('job')
  const supabase = createClient()

  const [applications, setApplications] = useState<any[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<string>(jobFilter || '')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<any>(null)

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!company) { setLoading(false); return }

    const [appsRes, jobsRes] = await Promise.all([
      supabase
        .from('applications')
        .select(`
          *,
          job:jobs(id, title, job_type, location),
          seeker:profiles(id, full_name, email, phone, avatar_url),
          seeker_profile:seeker_profiles(headline, skills, experience_years, resume_url, current_location)
        `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false }),
      supabase.from('jobs').select('id, title').eq('company_id', company.id).eq('status', 'active'),
    ])

    setApplications(appsRes.data || [])
    setJobs(jobsRes.data as Job[] || [])
    setLoading(false)
  }

  const updateStatus = async (appId: string, newStatus: string) => {
    await supabase
      .from('applications')
      .update({ status: newStatus, status_updated_at: new Date().toISOString() })
      .eq('id', appId)
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a))
    if (selectedApp?.id === appId) setSelectedApp((prev: any) => ({ ...prev, status: newStatus }))
    toast.success(`Status updated to ${newStatus}`)
  }

  const filteredApps = applications.filter(app => {
    const matchesJob = selectedJob ? app.job?.id === selectedJob : true
    const matchesStatus = statusFilter ? app.status === statusFilter : true
    const matchesSearch = searchQuery
      ? app.seeker?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.seeker?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    return matchesJob && matchesStatus && matchesSearch
  })

  const statusBadge: Record<string, string> = {
    applied: 'badge-yellow', viewed: 'badge-blue', shortlisted: 'badge-green',
    interview: 'badge-green', offered: 'badge-green', rejected: 'badge-red',
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--bg-secondary)] pt-16">
        <div className="container-custom px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">Applicants</h1>
              <p className="text-[var(--text-muted)] mt-1">{filteredApps.length} candidates found</p>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-4 mb-5 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="input pl-9 py-2.5 text-sm"
              />
            </div>
            <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} className="input py-2.5 text-sm w-auto">
              <option value="">All Jobs</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input py-2.5 text-sm w-auto">
              <option value="">All Status</option>
              {APPLICATION_STATUSES.map(s => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Applicants List */}
            <div className="lg:col-span-2 space-y-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="card p-4 animate-pulse flex gap-3">
                    <div className="w-12 h-12 skeleton rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 skeleton rounded w-1/2" />
                      <div className="h-3 skeleton rounded w-3/4" />
                    </div>
                  </div>
                ))
              ) : filteredApps.length > 0 ? (
                filteredApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={cn(
                      'card-interactive p-4',
                      selectedApp?.id === app.id && 'ring-2 ring-brand-yellow'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center
                        font-bold text-brand-black text-lg flex-shrink-0">
                        {app.seeker?.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-[var(--text-primary)]">
                            {app.seeker?.full_name || 'Anonymous'}
                          </h3>
                          <span className={cn('badge text-xs', statusBadge[app.status] || 'badge-gray')}>
                            {app.status}
                          </span>
                          {app.is_seen_by_employer === false && (
                            <span className="badge bg-blue-500 text-white text-xs">New</span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-muted)] mt-0.5">{app.seeker?.email}</p>
                        {app.seeker_profile?.headline && (
                          <p className="text-xs text-[var(--text-secondary)] mt-1">{app.seeker_profile.headline}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                          {app.seeker_profile?.experience_years !== undefined && (
                            <span>{app.seeker_profile.experience_years} yrs exp</span>
                          )}
                          {app.seeker_profile?.current_location && (
                            <span>📍 {app.seeker_profile.current_location}</span>
                          )}
                          <span>Applied {timeAgo(app.created_at)}</span>
                          {app.applied_via === 'whatsapp' && <span className="text-green-500">via WhatsApp</span>}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <select
                          value={app.status}
                          onChange={(e) => { e.stopPropagation(); updateStatus(app.id, e.target.value) }}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs border border-[var(--border)] rounded-lg px-2 py-1.5 bg-[var(--bg-card)]
                            text-[var(--text-primary)] focus:outline-none focus:border-brand-yellow"
                        >
                          {APPLICATION_STATUSES.map(s => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {app.seeker_profile?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[var(--border)]">
                        {app.seeker_profile.skills.slice(0, 4).map((skill: string) => (
                          <span key={skill} className="tag text-xs py-0.5">{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="card p-12 text-center">
                  <Users size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
                  <p className="text-[var(--text-muted)]">No applicants match your filters</p>
                </div>
              )}
            </div>

            {/* Applicant Detail Panel */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              {selectedApp ? (
                <div className="card p-5 space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-brand-yellow flex items-center justify-center
                      font-bold text-brand-black text-2xl mx-auto mb-3">
                      {selectedApp.seeker?.full_name?.[0]?.toUpperCase()}
                    </div>
                    <h3 className="font-display font-bold text-xl text-[var(--text-primary)]">
                      {selectedApp.seeker?.full_name}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">{selectedApp.seeker?.email}</p>
                    {selectedApp.seeker?.phone && (
                      <p className="text-sm text-[var(--text-muted)]">{selectedApp.seeker.phone}</p>
                    )}
                  </div>

                  {selectedApp.seeker_profile?.headline && (
                    <p className="text-sm text-[var(--text-secondary)] text-center italic">
                      "{selectedApp.seeker_profile.headline}"
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-muted)]">Applied for</span>
                      <span className="font-medium text-[var(--text-primary)]">{selectedApp.job?.title}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-muted)]">Experience</span>
                      <span className="font-medium">{selectedApp.seeker_profile?.experience_years || 0} years</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-muted)]">Applied</span>
                      <span>{timeAgo(selectedApp.created_at)}</span>
                    </div>
                  </div>

                  {selectedApp.cover_letter && (
                    <div className="p-3 rounded-xl bg-[var(--bg-secondary)]">
                      <p className="text-xs text-[var(--text-muted)] mb-1.5 font-semibold uppercase tracking-wide">Cover Letter</p>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-4">
                        {selectedApp.cover_letter}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Update Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateStatus(selectedApp.id, 'shortlisted')}
                        className={cn('p-2.5 rounded-xl text-xs font-semibold border-2 transition-all',
                          selectedApp.status === 'shortlisted'
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-green-500 hover:text-green-500'
                        )}
                      >
                        <CheckCircle2 size={14} className="mx-auto mb-1" />
                        Shortlist
                      </button>
                      <button
                        onClick={() => updateStatus(selectedApp.id, 'rejected')}
                        className={cn('p-2.5 rounded-xl text-xs font-semibold border-2 transition-all',
                          selectedApp.status === 'rejected'
                            ? 'bg-red-500 border-red-500 text-white'
                            : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-red-500 hover:text-red-500'
                        )}
                      >
                        <XCircle size={14} className="mx-auto mb-1" />
                        Reject
                      </button>
                      <button
                        onClick={() => updateStatus(selectedApp.id, 'interview')}
                        className="p-2.5 rounded-xl text-xs font-semibold border-2 border-[var(--border)]
                          text-[var(--text-secondary)] hover:border-blue-500 hover:text-blue-500 transition-all"
                      >
                        <Award size={14} className="mx-auto mb-1" />
                        Interview
                      </button>
                      <button
                        onClick={() => updateStatus(selectedApp.id, 'offered')}
                        className="p-2.5 rounded-xl text-xs font-semibold border-2 border-[var(--border)]
                          text-[var(--text-secondary)] hover:border-brand-yellow hover:text-brand-yellow transition-all"
                      >
                        <CheckCircle2 size={14} className="mx-auto mb-1" />
                        Offer
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {selectedApp.seeker_profile?.resume_url && (
                      <a href={selectedApp.seeker_profile.resume_url} target="_blank" rel="noopener noreferrer"
                        className="btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2">
                        <FileText size={15} /> Download Resume
                      </a>
                    )}
                    {selectedApp.seeker?.phone && (
                      <a href={getWhatsAppLink(selectedApp.seeker.phone, selectedApp.job?.title, 'your company')}
                        target="_blank" rel="noopener noreferrer"
                        className="btn-whatsapp w-full py-2.5 text-sm flex items-center justify-center gap-2">
                        <MessageCircle size={15} /> Contact on WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card p-10 text-center">
                  <Users size={32} className="text-[var(--text-muted)] mx-auto mb-3" />
                  <p className="text-[var(--text-muted)] text-sm">Select an applicant to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
