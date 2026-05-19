'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bookmark, BookmarkCheck, MapPin, Clock, Briefcase, DollarSign, Users, Zap, MessageCircle } from 'lucide-react'
import { cn, formatSalary, timeAgo, formatJobType, getWhatsAppLink } from '@/lib/utils'
import type { Job } from '@/types'

interface JobCardProps {
  job: Job
  onSave?: (jobId: string) => void
  isSaved?: boolean
  showDistance?: boolean
  compact?: boolean
}

const jobTypeBadgeClass: Record<string, string> = {
  full_time: 'badge-green',
  part_time: 'badge-blue',
  contract: 'badge-yellow',
  internship: 'badge-yellow',
  freelance: 'badge-gray',
}

export function JobCard({ job, onSave, isSaved = false, showDistance = false, compact = false }: JobCardProps) {
  const [saved, setSaved] = useState(isSaved)
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setSaved(!saved)
    onSave?.(job.id)
    setSaving(false)
  }

  return (
    <Link href={`/jobs/${job.id}`}>
      <article
        className={cn(
          'card-interactive group p-5',
          compact ? 'p-4' : 'p-5',
          job.is_featured && 'ring-2 ring-brand-yellow/30'
        )}
      >
        {/* Featured / Urgent Badges */}
        {(job.is_featured || job.is_urgent) && (
          <div className="flex gap-2 mb-3">
            {job.is_featured && (
              <span className="badge badge-yellow">
                ⭐ Featured
              </span>
            )}
            {job.is_urgent && (
              <span className="badge badge-red">
                <Zap size={10} className="fill-current" /> Urgent
              </span>
            )}
          </div>
        )}

        {/* Header: Company Logo + Info */}
        <div className="flex items-start gap-3">
          {/* Company Logo */}
          <div className="w-12 h-12 flex-shrink-0 rounded-xl border border-[var(--border)] overflow-hidden
            bg-[var(--bg-secondary)] flex items-center justify-center font-display font-bold text-lg
            text-[var(--text-muted)] group-hover:border-brand-yellow transition-colors">
            {job.company?.logo_url ? (
              <Image
                src={job.company.logo_url}
                alt={job.company.name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            ) : (
              job.company?.name?.[0]?.toUpperCase() || '?'
            )}
          </div>

          {/* Company + Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-display font-bold text-[var(--text-primary)] group-hover:text-brand-yellow
                  transition-colors truncate leading-tight">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-[var(--text-secondary)] truncate">
                    {job.company?.name}
                  </p>
                  {job.company?.is_verified && (
                    <span title="Verified employer" className="text-brand-yellow text-xs">✓</span>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className={cn(
                  'p-1.5 rounded-lg transition-all flex-shrink-0',
                  saved
                    ? 'text-brand-yellow bg-brand-yellow-light dark:bg-yellow-900/30'
                    : 'text-[var(--text-muted)] hover:text-brand-yellow hover:bg-brand-yellow-light dark:hover:bg-yellow-900/20'
                )}
                aria-label={saved ? 'Remove from saved' : 'Save job'}
              >
                {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Tags Row */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className={cn('badge', jobTypeBadgeClass[job.job_type] || 'badge-gray')}>
            {formatJobType(job.job_type)}
          </span>
          {job.is_remote && <span className="badge badge-blue">🏠 Remote</span>}
          {job.is_hybrid && <span className="badge badge-gray">🏢 Hybrid</span>}
          {job.experience_level === 'fresher' && (
            <span className="badge badge-green">✓ Freshers OK</span>
          )}
        </div>

        {/* Info Row */}
        <div className={cn('grid gap-x-4 gap-y-2 mt-3 text-sm text-[var(--text-muted)]',
          compact ? 'grid-cols-1' : 'grid-cols-2')}>
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="flex-shrink-0 text-brand-yellow" />
            <span className="truncate">
              {job.location}
              {showDistance && job.distance_km !== undefined && (
                <span className="text-brand-yellow font-medium ml-1">
                  ({job.distance_km.toFixed(1)} km)
                </span>
              )}
            </span>
          </div>

          {job.is_salary_disclosed && (job.salary_min || job.salary_max) && (
            <div className="flex items-center gap-1.5">
              <DollarSign size={13} className="flex-shrink-0 text-brand-yellow" />
              <span className="font-medium text-[var(--text-primary)]">
                {formatSalary(job.salary_min, job.salary_max)}
                <span className="font-normal text-[var(--text-muted)]">/mo</span>
              </span>
            </div>
          )}

          {job.vacancies > 1 && (
            <div className="flex items-center gap-1.5">
              <Users size={13} className="flex-shrink-0 text-brand-yellow" />
              <span>{job.vacancies} openings</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Clock size={13} className="flex-shrink-0 text-brand-yellow" />
            <span>{timeAgo(job.created_at)}</span>
          </div>
        </div>

        {/* Skills */}
        {!compact && job.skills_required && job.skills_required.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[var(--border)]">
            {job.skills_required.slice(0, 4).map((skill) => (
              <span key={skill} className="tag text-xs py-0.5">{skill}</span>
            ))}
            {job.skills_required.length > 4 && (
              <span className="tag text-xs py-0.5 text-brand-yellow">
                +{job.skills_required.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer: Apply Buttons */}
        {!compact && (
          <div className="flex items-center gap-2 mt-4">
            <span
              className="btn-primary py-2 px-4 text-sm flex-1 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              Apply Now
            </span>
            {job.whatsapp_apply && job.whatsapp_number && (
              <a
                href={getWhatsAppLink(job.whatsapp_number, job.title, job.company?.name || '')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="btn-whatsapp py-2 px-3 text-sm flex-shrink-0"
                aria-label="Apply via WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
            )}
          </div>
        )}

        {/* Stats */}
        {!compact && (
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Briefcase size={11} /> {job.applications_count} applied
            </span>
            <span className="text-xs text-[var(--text-muted)]">•</span>
            <span className="text-xs text-[var(--text-muted)]">
              👁 {job.views_count} views
            </span>
          </div>
        )}
      </article>
    </Link>
  )
}

// Skeleton loader for job cards
export function JobCardSkeleton() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 skeleton rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 skeleton rounded w-3/4" />
          <div className="h-3 skeleton rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <div className="h-5 skeleton rounded-full w-20" />
        <div className="h-5 skeleton rounded-full w-16" />
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="h-4 skeleton rounded w-full" />
        <div className="h-4 skeleton rounded w-full" />
      </div>
      <div className="h-9 skeleton rounded-xl mt-4" />
    </div>
  )
}
