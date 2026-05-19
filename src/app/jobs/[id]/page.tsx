'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin, Clock, Briefcase, DollarSign, Users, Star, MessageCircle,
  Bookmark, BookmarkCheck, Share2, ArrowLeft, Building2, CheckCircle2,
  Calendar, Award, ExternalLink, Loader2, Eye
} from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { JobCard } from '@/components/JobCard'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import {
  formatSalary, timeAgo, formatJobType, formatExperienceLevel,
  getWhatsAppLink, formatDate, cn
} from '@/lib/utils'
import type { Job, Application } from '@/types'
import toast from 'react-hot-toast'

export default function JobDetailPage() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [job, setJob] = useState<Job | null>(null)
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([])
  const [application, setApplication] = useState<Application | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')

  useEffect(() => {
    if (id) fetchJob()
  }, [id, user])

  const fetchJob = async () => {
    const { data } = await supabase
      .from('jobs')
      .select(`*, company:companies(*), category:job_categories(*)`)
      .eq('id', id)
      .single()

    if (data) {
      setJob(data as Job)
      // Track view
      await supabase.rpc('increment_job_views', { job_id: id as string })
      // Check if saved/applied
      if (user) {
        const [savedRes, appRes] = await Promise.all([
          supabase.from('saved_jobs').select('id').eq('user_id', user.id).eq('job_id', id).single(),
          supabase.from('applications').select('*').eq('seeker_id', user.id).eq('job_id', id).single(),
        ])
        setIsSaved(!!savedRes.data)
        setApplication(appRes.data as Application | null)
      }
      // Fetch related
      const { data: related } = await supabase
        .from('jobs')
        .select(`*, company:companies(id, name, logo_url, city, is_verified)`)
        .eq('status', 'active')
        .eq('category_id', data.category_id)
        .neq('id', id)
        .limit(3)
      setRelatedJobs((related as Job[]) || [])
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!user) return router.push('/auth/login')
    if (isSaved) {
      await supabase.from('saved_jobs').delete().eq('user_id', user.id).eq('job_id', id)
      setIsSaved(false)
      toast.success('Removed from saved jobs')
    } else {
      await supabase.from('saved_jobs').insert({ user_id: user.id, job_id: id })
      setIsSaved(true)
      toast.success('Job saved! 🔖')
    }
  }

  const handleApply = async () => {
    if (!user) return router.push('/auth/login')
    if (profile?.role !== 'seeker') return toast.error('Only job seekers can apply')
    setApplying(true)
    const { error } = await supabase.from('applications').insert({
      job_id: id,
      seeker_id: user.id,
      company_id: job?.company_id,
      cover_letter: coverLetter,
      applied_via: 'platform',
    })
    if (error) {
      if (error.code === '23505') toast.error('You have already applied to this job!')
      else toast.error('Failed to apply. Please try again.')
    } else {
      toast.success('Application submitted! 🎉')
      setShowApplyModal(false)
      await fetchJob()
    }
    setApplying(false)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: job?.title, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied!')
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <Loader2 size={40} className="animate-spin text-brand-yellow" />
        </div>
        <Footer />
      </>
    )
  }

  if (!job) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-4">
          <div className="text-6xl">😕</div>
          <h1 className="font-display font-bold text-2xl">Job not found</h1>
          <Link href="/jobs" className="btn-primary">Browse Jobs</Link>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--bg-secondary)] pt-16">
        <div className="container-custom px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-6">
            <Link href="/jobs" className="hover:text-brand-yellow flex items-center gap-1">
              <ArrowLeft size={14} /> Jobs
            </Link>
            <span>/</span>
            <span className="text-[var(--text-primary)]">{job.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-5">
              {/* Job Header Card */}
              <div className="card p-6">
                {(job.is_featured || job.is_urgent) && (
                  <div className="flex gap-2 mb-4">
                    {job.is_featured && <span className="badge badge-yellow">⭐ Featured</span>}
                    {job.is_urgent && <span className="badge badge-red">⚡ Urgent Hiring</span>}
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl border border-[var(--border)] overflow-hidden
                    bg-[var(--bg-secondary)] flex items-center justify-center font-display font-bold text-xl
                    text-[var(--text-muted)] flex-shrink-0">
                    {job.company?.logo_url ? (
                      <Image src={job.company.logo_url} alt={job.company.name} width={64} height={64} className="object-cover" />
                    ) : job.company?.name?.[0]?.toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h1 className="font-display font-extrabold text-2xl text-[var(--text-primary)] leading-tight">
                      {job.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Link href={`/companies/${job.company_id}`}
                        className="text-brand-yellow hover:underline font-medium">
                        {job.company?.name}
                      </Link>
                      {job.company?.is_verified && (
                        <span title="Verified" className="badge badge-green text-xs">✓ Verified</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-brand-yellow" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-brand-yellow" />
                        {timeAgo(job.created_at)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Eye size={14} className="text-brand-yellow" />
                        {job.views_count} views
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users size={14} className="text-brand-yellow" />
                        {job.applications_count} applied
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-5 pb-5 border-b border-[var(--border)]">
                  <span className="badge badge-green">{formatJobType(job.job_type)}</span>
                  <span className="badge badge-blue">{formatExperienceLevel(job.experience_level)}</span>
                  {job.is_remote && <span className="badge badge-blue">🏠 Remote</span>}
                  {job.is_hybrid && <span className="badge badge-gray">🏢 Hybrid</span>}
                  {job.vacancies > 1 && <span className="badge badge-yellow">{job.vacancies} Vacancies</span>}
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                  {[
                    {
                      icon: DollarSign,
                      label: 'Salary',
                      value: job.is_salary_disclosed
                        ? formatSalary(job.salary_min, job.salary_max)
                        : 'Negotiable',
                    },
                    { icon: Briefcase, label: 'Job Type', value: formatJobType(job.job_type) },
                    { icon: Award, label: 'Experience', value: formatExperienceLevel(job.experience_level) },
                    {
                      icon: Calendar,
                      label: 'Deadline',
                      value: job.application_deadline ? formatDate(job.application_deadline) : 'Open',
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="text-center p-3 rounded-xl bg-[var(--bg-secondary)]">
                      <Icon size={18} className="text-brand-yellow mx-auto mb-1" />
                      <p className="text-xs text-[var(--text-muted)]">{label}</p>
                      <p className="font-semibold text-sm text-[var(--text-primary)] mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="card p-6">
                <h2 className="font-display font-bold text-xl text-[var(--text-primary)] mb-4">Job Description</h2>
                <div className="prose prose-sm max-w-none text-[var(--text-secondary)] whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="card p-6">
                  <h2 className="font-display font-bold text-xl text-[var(--text-primary)] mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                        <CheckCircle2 size={16} className="text-brand-yellow flex-shrink-0 mt-0.5" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {job.skills_required && job.skills_required.length > 0 && (
                <div className="card p-6">
                  <h2 className="font-display font-bold text-xl text-[var(--text-primary)] mb-4">Skills Required</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill) => (
                      <span key={skill} className="tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <div className="card p-6">
                  <h2 className="font-display font-bold text-xl text-[var(--text-primary)] mb-4">Benefits & Perks</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {job.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <span className="text-brand-yellow">✓</span> {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Apply Card - Sticky */}
              <div className="card p-5 lg:sticky lg:top-24">
                {application ? (
                  <div className="text-center">
                    <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
                    <h3 className="font-bold text-lg text-[var(--text-primary)] mb-1">Applied!</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-3">
                      Applied {timeAgo(application.created_at)}
                    </p>
                    <span className={cn(
                      'badge text-sm px-4 py-2',
                      application.status === 'shortlisted' ? 'badge-green' :
                        application.status === 'rejected' ? 'badge-red' : 'badge-yellow'
                    )}>
                      Status: {application.status}
                    </span>
                    <Link href="/seeker/applications" className="btn-secondary w-full mt-4 text-sm">
                      Track Application
                    </Link>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => user ? setShowApplyModal(true) : router.push('/auth/login')}
                      className="btn-primary w-full py-3.5 text-base animate-pulse-yellow"
                    >
                      Apply Now
                    </button>
                    {job.whatsapp_apply && job.whatsapp_number && (
                      <a
                        href={getWhatsAppLink(job.whatsapp_number, job.title, job.company?.name || '')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp w-full py-3 mt-3 text-sm"
                      >
                        <MessageCircle size={18} />
                        Apply via WhatsApp
                      </a>
                    )}
                    <div className="flex gap-3 mt-3">
                      <button onClick={handleSave}
                        className={cn('flex-1 btn-secondary py-2.5 text-sm', isSaved && 'border-brand-yellow text-brand-yellow')}>
                        {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                      <button onClick={handleShare} className="flex-1 btn-secondary py-2.5 text-sm">
                        <Share2 size={16} /> Share
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Company Card */}
              <div className="card p-5">
                <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-4">About Company</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]
                    flex items-center justify-center font-bold text-lg text-[var(--text-muted)]">
                    {job.company?.name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{job.company?.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{job.company?.city}, TN</p>
                  </div>
                </div>
                {job.company?.description && (
                  <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-3">
                    {job.company.description}
                  </p>
                )}
                <Link href={`/companies/${job.company_id}`}
                  className="btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2">
                  <Building2 size={15} /> View Company Profile
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          </div>

          {/* Related Jobs */}
          {relatedJobs.length > 0 && (
            <div className="mt-10">
              <h2 className="section-title mb-6">Similar Jobs</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedJobs.map((rj) => <JobCard key={rj.id} job={rj} />)}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 animate-scale-in">
            <h2 className="font-display font-bold text-xl text-[var(--text-primary)] mb-2">
              Apply for {job.title}
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-5">at {job.company?.name}</p>

            <div className="mb-4">
              <label className="label">Cover Letter (Optional)</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
                placeholder="Tell the employer why you're a great fit for this role..."
                className="input resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowApplyModal(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleApply} disabled={applying} className="btn-primary flex-1">
                {applying ? <Loader2 size={16} className="animate-spin" /> : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
