'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SlidersHorizontal, X, MapPin, Briefcase, ChevronDown, Grid3X3, List, Loader2, Filter } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SearchBar } from '@/components/SearchBar'
import { JobCard, JobCardSkeleton } from '@/components/JobCard'
import { createClient } from '@/lib/supabase'
import { cn, JOB_CATEGORIES, CITIES_TN, formatJobType } from '@/lib/utils'
import type { Job, SearchFilters } from '@/types'

const salaryRanges = [
  { label: 'Any Salary', min: 0, max: 0 },
  { label: 'Under ₹10K', min: 0, max: 10000 },
  { label: '₹10K – ₹20K', min: 10000, max: 20000 },
  { label: '₹20K – ₹40K', min: 20000, max: 40000 },
  { label: '₹40K – ₹75K', min: 40000, max: 75000 },
  { label: '₹75K+', min: 75000, max: 0 },
]

const distanceOptions = [5, 10, 25, 50]
const experienceLevels = ['fresher', 'junior', 'mid', 'senior', 'lead']

export default function JobsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    location: searchParams.get('location') || searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    job_type: (searchParams.get('type') as any) || '',
    experience_level: (searchParams.get('level') as any) || '',
    is_remote: searchParams.get('remote') === 'true',
    is_fresher: false,
    salary_min: 0,
    salary_max: 0,
    radius: 25,
    sort: (searchParams.get('sort') as any) || 'newest',
    page: 1,
    limit: 12,
  })

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          company:companies(id, name, logo_url, city, is_verified),
          category:job_categories(id, name, icon)
        `, { count: 'exact' })
        .eq('status', 'active')

      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }
      if (filters.job_type) {
        query = query.eq('job_type', filters.job_type)
      }
      if (filters.experience_level) {
        query = query.eq('experience_level', filters.experience_level)
      }
      if (filters.is_remote) {
        query = query.eq('is_remote', true)
      }
      if (filters.salary_min) {
        query = query.gte('salary_max', filters.salary_min)
      }
      if (filters.salary_max) {
        query = query.lte('salary_min', filters.salary_max)
      }
      if (searchParams.get('featured') === 'true') {
        query = query.eq('is_featured', true)
      }

      // Sorting
      switch (filters.sort) {
        case 'salary_high': query = query.order('salary_max', { ascending: false }); break
        case 'salary_low': query = query.order('salary_min', { ascending: true }); break
        default: query = query.order('created_at', { ascending: false })
      }

      const limit = filters.limit || 12
      const offset = ((filters.page || 1) - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data, count, error } = await query
      if (!error) {
        setJobs(data as Job[])
        setTotal(count || 0)
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [filters, searchParams])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      query: '', location: '', category: '', job_type: '' as any,
      experience_level: '' as any, is_remote: false, is_fresher: false,
      salary_min: 0, salary_max: 0, radius: 25, sort: 'newest', page: 1, limit: 12
    })
  }

  const activeFilterCount = [
    filters.job_type, filters.experience_level, filters.is_remote,
    filters.salary_min, filters.category
  ].filter(Boolean).length

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--bg-secondary)] pt-16">
        {/* Search Header */}
        <div className="bg-[var(--bg-card)] border-b border-[var(--border)]">
          <div className="container-custom px-4 py-6">
            <SearchBar
              defaultQuery={filters.query}
              defaultLocation={filters.location}
              onSearch={(q, loc) => setFilters(prev => ({ ...prev, query: q, location: loc, page: 1 }))}
              size="sm"
            />
          </div>
        </div>

        <div className="container-custom px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="card p-5 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-bold text-lg text-[var(--text-primary)]">
                    Filters
                  </h2>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters}
                      className="text-xs text-brand-yellow hover:underline flex items-center gap-1">
                      <X size={12} /> Clear all ({activeFilterCount})
                    </button>
                  )}
                </div>

                <FilterPanel filters={filters} updateFilter={updateFilter} />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Top Bar */}
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h1 className="font-display font-bold text-xl text-[var(--text-primary)]">
                    {filters.query ? `"${filters.query}"` : 'All Jobs'}
                    {filters.location && ` in ${filters.location}`}
                  </h1>
                  <p className="text-sm text-[var(--text-muted)] mt-0.5">
                    {loading ? 'Searching...' : `${total.toLocaleString()} jobs found`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden btn-secondary py-2 px-3 text-sm gap-2"
                  >
                    <Filter size={16} />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="bg-brand-yellow text-brand-black w-5 h-5 rounded-full text-xs flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  {/* Sort */}
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="input py-2 text-sm w-auto"
                  >
                    <option value="newest">Newest First</option>
                    <option value="salary_high">Highest Salary</option>
                    <option value="salary_low">Lowest Salary</option>
                  </select>

                  {/* View Mode */}
                  <div className="hidden md:flex border border-[var(--border)] rounded-xl overflow-hidden">
                    {[
                      { mode: 'grid', icon: Grid3X3 },
                      { mode: 'list', icon: List },
                    ].map(({ mode, icon: Icon }) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode as 'grid' | 'list')}
                        className={cn('p-2.5 transition-colors', viewMode === mode
                          ? 'bg-brand-yellow text-brand-black'
                          : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'
                        )}
                      >
                        <Icon size={16} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Filter Panel */}
              {showFilters && (
                <div className="lg:hidden card p-5 mb-5 animate-slide-down">
                  <FilterPanel filters={filters} updateFilter={updateFilter} />
                </div>
              )}

              {/* Active Filter Tags */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {filters.job_type && (
                    <FilterTag label={formatJobType(filters.job_type)}
                      onRemove={() => updateFilter('job_type', '')} />
                  )}
                  {filters.experience_level && (
                    <FilterTag label={filters.experience_level}
                      onRemove={() => updateFilter('experience_level', '')} />
                  )}
                  {filters.is_remote && (
                    <FilterTag label="Remote" onRemove={() => updateFilter('is_remote', false)} />
                  )}
                </div>
              )}

              {/* Jobs Grid/List */}
              {loading ? (
                <div className={cn('grid gap-4',
                  viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
                  {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
                </div>
              ) : jobs.length > 0 ? (
                <>
                  <div className={cn('grid gap-4',
                    viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
                    {jobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSaved={savedJobIds.has(job.id)}
                        compact={viewMode === 'list'}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {Array.from({ length: Math.ceil(total / (filters.limit || 12)) }, (_, i) => i + 1)
                      .slice(0, 7).map((p) => (
                        <button
                          key={p}
                          onClick={() => updateFilter('page', p)}
                          className={cn(
                            'w-10 h-10 rounded-xl font-medium transition-all text-sm',
                            filters.page === p
                              ? 'bg-brand-yellow text-brand-black'
                              : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-brand-yellow'
                          )}
                        >
                          {p}
                        </button>
                      ))}
                  </div>
                </>
              ) : (
                <div className="card p-16 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="font-display font-bold text-xl text-[var(--text-primary)] mb-2">
                    No jobs found
                  </h3>
                  <p className="text-[var(--text-muted)] mb-6">
                    Try adjusting your search or filters
                  </p>
                  <button onClick={clearFilters} className="btn-primary inline-flex">
                    Clear Filters
                  </button>
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

function FilterPanel({ filters, updateFilter }: {
  filters: SearchFilters,
  updateFilter: (k: keyof SearchFilters, v: any) => void
}) {
  return (
    <div className="space-y-6">
      {/* Job Type */}
      <div>
        <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-3">Job Type</h3>
        <div className="space-y-2">
          {['full_time', 'part_time', 'contract', 'internship', 'freelance'].map((type) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => updateFilter('job_type', filters.job_type === type ? '' : type)}
                className={cn(
                  'w-4 h-4 rounded border-2 transition-all flex-shrink-0',
                  filters.job_type === type ? 'bg-brand-yellow border-brand-yellow' : 'border-[var(--border)] group-hover:border-brand-yellow'
                )}
              />
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-brand-yellow transition-colors">
                {formatJobType(type)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div>
        <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-3">Salary Range</h3>
        <div className="space-y-2">
          {salaryRanges.map(({ label, min, max }) => (
            <label key={label} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => updateFilter('salary_min', min) || updateFilter('salary_max', max)}
                className={cn(
                  'w-4 h-4 rounded-full border-2 transition-all flex-shrink-0',
                  filters.salary_min === min && filters.salary_max === max
                    ? 'bg-brand-yellow border-brand-yellow'
                    : 'border-[var(--border)] group-hover:border-brand-yellow'
                )}
              />
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-brand-yellow transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div>
        <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-3">Experience Level</h3>
        <div className="space-y-2">
          {experienceLevels.map((level) => (
            <label key={level} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => updateFilter('experience_level', filters.experience_level === level ? '' : level)}
                className={cn(
                  'w-4 h-4 rounded border-2 transition-all flex-shrink-0',
                  filters.experience_level === level ? 'bg-brand-yellow border-brand-yellow' : 'border-[var(--border)] group-hover:border-brand-yellow'
                )}
              />
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-brand-yellow transition-colors capitalize">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Remote */}
      <div>
        <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-3">Work Mode</h3>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => updateFilter('is_remote', !filters.is_remote)}
            className={cn(
              'w-4 h-4 rounded border-2 transition-all',
              filters.is_remote ? 'bg-brand-yellow border-brand-yellow' : 'border-[var(--border)] group-hover:border-brand-yellow'
            )}
          />
          <span className="text-sm text-[var(--text-secondary)] group-hover:text-brand-yellow transition-colors">
            Remote Jobs
          </span>
        </label>
      </div>
    </div>
  )
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-yellow-light
      dark:bg-yellow-900/30 text-brand-yellow text-xs font-medium border border-brand-yellow/30">
      {label}
      <button onClick={onRemove} className="hover:text-brand-yellow-dark">
        <X size={12} />
      </button>
    </span>
  )
}

