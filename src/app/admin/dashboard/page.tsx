'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, Briefcase, Building2, TrendingUp, Eye, CheckCircle2,
  XCircle, AlertCircle, BarChart3, Activity, Search, Filter, ChevronRight
} from 'lucide-react'
import { Header } from '@/components/Header'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { timeAgo, cn } from '@/lib/utils'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

export default function AdminDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [stats, setStats] = useState({
    totalUsers: 0, totalJobs: 0, totalCompanies: 0,
    totalApplications: 0, activeJobs: 0, newUsersToday: 0,
  })
  const [recentJobs, setRecentJobs] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [chartData] = useState([
    { month: 'Jan', jobs: 120, users: 450, apps: 320 },
    { month: 'Feb', jobs: 180, users: 620, apps: 480 },
    { month: 'Mar', jobs: 240, users: 850, apps: 680 },
    { month: 'Apr', jobs: 310, users: 1100, apps: 890 },
    { month: 'May', jobs: 420, users: 1450, apps: 1150 },
    { month: 'Jun', jobs: 580, users: 1820, apps: 1520 },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/auth/login')
      else if (profile && profile.role !== 'admin') router.push('/')
      else fetchData()
    }
  }, [user, profile, authLoading])

  const fetchData = async () => {
    const [usersRes, jobsRes, companiesRes, appsRes, activeJobsRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('jobs').select('id', { count: 'exact', head: true }),
      supabase.from('companies').select('id', { count: 'exact', head: true }),
      supabase.from('applications').select('id', { count: 'exact', head: true }),
      supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ])

    setStats({
      totalUsers: usersRes.count || 0,
      totalJobs: jobsRes.count || 0,
      totalCompanies: companiesRes.count || 0,
      totalApplications: appsRes.count || 0,
      activeJobs: activeJobsRes.count || 0,
      newUsersToday: 0,
    })

    const [recentJobsRes, recentUsersRes] = await Promise.all([
      supabase.from('jobs')
        .select(`*, company:companies(name)`)
        .order('created_at', { ascending: false })
        .limit(8),
      supabase.from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8),
    ])

    setRecentJobs(recentJobsRes.data || [])
    setRecentUsers(recentUsersRes.data || [])
    setLoading(false)
  }

  const toggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    await supabase.from('jobs').update({ status: newStatus }).eq('id', jobId)
    setRecentJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j))
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    await supabase.from('profiles').update({ is_active: !isActive }).eq('id', userId)
    setRecentUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !isActive } : u))
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-float">🐝</div>
          <div className="w-8 h-8 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="card p-3 shadow-card-hover">
          <p className="font-semibold text-sm mb-1">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} className="text-xs" style={{ color: p.color }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--bg-secondary)] pt-16">
        <div className="container-custom px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="badge badge-yellow mb-2">🛡️ Admin Panel</span>
              <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">
                Analytics Dashboard
              </h1>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/users" className="btn-secondary py-2 px-4 text-sm">
                <Users size={16} /> Users
              </Link>
              <Link href="/admin/jobs" className="btn-secondary py-2 px-4 text-sm">
                <Briefcase size={16} /> Jobs
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-brand-yellow', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
              { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Active Jobs', value: stats.activeJobs, icon: Activity, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Companies', value: stats.totalCompanies, icon: Building2, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { label: 'Applications', value: stats.totalApplications, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
              { label: 'Platform Health', value: '99%', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="card p-4">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon size={18} className={color} />
                </div>
                <div className={`font-display font-bold text-2xl ${color}`}>{value}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <div className="card p-5">
              <h2 className="font-display font-bold text-lg text-[var(--text-primary)] mb-4">
                Platform Growth
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F5C518" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F5C518" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="users" stroke="#F5C518" fill="url(#colorUsers)" strokeWidth={2} name="Users" />
                  <Area type="monotone" dataKey="apps" stroke="#3B82F6" fill="none" strokeWidth={2} name="Applications" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h2 className="font-display font-bold text-lg text-[var(--text-primary)] mb-4">
                Monthly Jobs Posted
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="jobs" fill="#F5C518" radius={[6, 6, 0, 0]} name="Jobs" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Jobs */}
            <div className="card">
              <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                <h2 className="font-display font-bold text-lg text-[var(--text-primary)]">Recent Jobs</h2>
                <Link href="/admin/jobs" className="btn-ghost text-sm py-1">View all <ChevronRight size={14} /></Link>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {recentJobs.map((job) => (
                  <div key={job.id} className="p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[var(--text-primary)] truncate">{job.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{job.company?.name} • {timeAgo(job.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('badge text-xs',
                        job.status === 'active' ? 'badge-green' :
                          job.status === 'paused' ? 'badge-yellow' : 'badge-gray'
                      )}>
                        {job.status}
                      </span>
                      <button
                        onClick={() => toggleJobStatus(job.id, job.status)}
                        className={cn('p-1.5 rounded-lg text-xs transition-colors',
                          job.status === 'active'
                            ? 'text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-[var(--text-muted)] hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                        )}
                      >
                        {job.status === 'active' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Users */}
            <div className="card">
              <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                <h2 className="font-display font-bold text-lg text-[var(--text-primary)]">Recent Users</h2>
                <Link href="/admin/users" className="btn-ghost text-sm py-1">View all <ChevronRight size={14} /></Link>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {recentUsers.map((user) => (
                  <div key={user.id} className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-yellow flex items-center justify-center
                      font-bold text-brand-black text-sm flex-shrink-0">
                      {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[var(--text-primary)] truncate">
                        {user.full_name || 'No name'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('badge text-xs capitalize',
                        user.role === 'employer' ? 'badge-blue' :
                          user.role === 'admin' ? 'badge-yellow' : 'badge-gray'
                      )}>
                        {user.role}
                      </span>
                      <button
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                        className={cn('p-1.5 rounded-lg transition-colors',
                          user.is_active
                            ? 'text-green-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
                            : 'text-red-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-500'
                        )}
                        title={user.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {user.is_active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
