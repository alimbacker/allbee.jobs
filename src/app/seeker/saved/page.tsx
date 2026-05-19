'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookmarkCheck, Search, Trash2 } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { JobCard } from '@/components/JobCard'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Job } from '@/types'
import toast from 'react-hot-toast'

export default function SavedJobsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    fetchSaved()
  }, [user])

  const fetchSaved = async () => {
    if (!user) return
    const { data } = await supabase
      .from('saved_jobs')
      .select(`job:jobs(*, company:companies(id, name, logo_url, city, is_verified))`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setSavedJobs(data?.map((d: any) => d.job).filter(Boolean) as Job[] || [])
    setLoading(false)
  }

  const handleUnsave = async (jobId: string) => {
    await supabase.from('saved_jobs').delete().eq('user_id', user!.id).eq('job_id', jobId)
    setSavedJobs(prev => prev.filter(j => j.id !== jobId))
    toast.success('Removed from saved jobs')
  }

  const clearAll = async () => {
    if (!confirm('Remove all saved jobs?')) return
    await supabase.from('saved_jobs').delete().eq('user_id', user!.id)
    setSavedJobs([])
    toast.success('All saved jobs cleared')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--bg-secondary)] pt-16">
        <div className="container-custom px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">Saved Jobs</h1>
              <p className="text-[var(--text-muted)] mt-1">{savedJobs.length} jobs saved</p>
            </div>
            {savedJobs.length > 0 && (
              <button onClick={clearAll} className="btn-ghost text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 size={15} /> Clear All
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="flex gap-3 mb-3">
                    <div className="w-12 h-12 skeleton rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 skeleton rounded w-3/4" />
                      <div className="h-3 skeleton rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-9 skeleton rounded-xl" />
                </div>
              ))}
            </div>
          ) : savedJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {savedJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={true}
                  onSave={handleUnsave}
                />
              ))}
            </div>
          ) : (
            <div className="card p-16 text-center">
              <BookmarkCheck size={48} className="text-[var(--text-muted)] mx-auto mb-4" />
              <h3 className="font-display font-bold text-xl text-[var(--text-primary)] mb-2">No saved jobs</h3>
              <p className="text-[var(--text-muted)] mb-6">
                Bookmark jobs you're interested in to view them later
              </p>
              <Link href="/jobs" className="btn-primary inline-flex">
                <Search size={16} /> Browse Jobs
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
