'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin, Briefcase, CheckCircle2, ChevronRight } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { createClient } from '@/lib/supabase'
import { CITIES_TN, cn } from '@/lib/utils'
import type { Company } from '@/types'

export default function CompaniesPage() {
  const supabase = createClient()
  const [companies, setCompanies] = useState<(Company & { job_count: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select(`*, jobs:jobs(count)`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    setCompanies((data || []).map((c: any) => ({
      ...c,
      job_count: c.jobs?.[0]?.count || 0
    })))
    setLoading(false)
  }

  const filtered = companies.filter(c => {
    const matchSearch = search
      ? c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.industry?.toLowerCase().includes(search.toLowerCase())
      : true
    const matchCity = cityFilter ? c.city === cityFilter : true
    return matchSearch && matchCity
  })

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--bg-secondary)] pt-16">
        {/* Hero */}
        <div className="bg-gradient-to-r from-brand-black to-brand-gray-800 py-16 px-4">
          <div className="container-custom text-center">
            <h1 className="font-display font-extrabold text-4xl text-white mb-3">
              Top <span className="text-gradient">Companies</span> Hiring Now
            </h1>
            <p className="text-gray-400 mb-8 text-lg">
              Discover great places to work across Tamil Nadu
            </p>
            <div className="max-w-2xl mx-auto flex gap-3">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search companies or industry..."
                  className="input pl-11 bg-white/10 border-white/20 text-white placeholder:text-gray-400" />
              </div>
              <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}
                className="input bg-white/10 border-white/20 text-white w-40">
                <option value="">All Cities</option>
                {CITIES_TN.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="container-custom px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[var(--text-muted)]">{filtered.length} companies found</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-5 animate-pulse space-y-3">
                  <div className="flex gap-3">
                    <div className="w-14 h-14 skeleton rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 skeleton rounded w-3/4" />
                      <div className="h-3 skeleton rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-10 skeleton rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((company) => (
                <Link key={company.id} href={`/companies/${company.id}`}>
                  <div className="card-interactive p-5 group">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]
                        flex items-center justify-center font-bold text-xl text-[var(--text-muted)] flex-shrink-0
                        group-hover:border-brand-yellow transition-colors overflow-hidden">
                        {company.logo_url ? (
                          <Image src={company.logo_url} alt={company.name} width={56} height={56} className="object-cover w-full h-full" />
                        ) : company.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-display font-bold text-[var(--text-primary)] group-hover:text-brand-yellow
                            transition-colors truncate">
                            {company.name}
                          </h3>
                          {company.is_verified && (
                            <CheckCircle2 size={14} className="text-brand-yellow flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-muted)] mt-0.5">{company.industry}</p>
                      </div>
                    </div>

                    {company.description && (
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">
                        {company.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} className="text-brand-yellow" /> {company.city}
                        </span>
                        {company.company_size && (
                          <span>{company.company_size} employees</span>
                        )}
                      </div>
                      <span className="badge badge-yellow text-xs">
                        <Briefcase size={10} /> {company.job_count} jobs
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card p-16 text-center">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="font-display font-bold text-xl text-[var(--text-primary)] mb-2">No companies found</h3>
              <p className="text-[var(--text-muted)]">Try different search terms</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
