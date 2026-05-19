'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, ArrowLeft, User, Building2, CheckCircle2 } from 'lucide-react'
import { AllBeeLogo } from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') || 'seeker'
  const [role, setRole] = useState<'seeker' | 'employer'>(defaultRole as 'seeker' | 'employer')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) return toast.error('Please accept terms & conditions')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
    } else if (data.user) {
      // Update profile role
      await supabase.from('profiles').upsert({ id: data.user.id, email, full_name: fullName, role })
      toast.success('Account created! Check your email to verify. 🐝')
      router.push(role === 'employer' ? '/employer/dashboard' : '/seeker/dashboard')
    }
    setLoading(false)
  }

  const handleGoogleRegister = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
      },
    })
    if (error) toast.error(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-black to-brand-gray-800
        items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-20" />
        <div className="absolute top-12 right-12 text-7xl animate-float">🐝</div>
        <div className="relative text-center max-w-md">
          <AllBeeLogo size={60} className="justify-center mb-8" />
          <h2 className="font-display font-bold text-4xl text-white mb-4">
            Join AllBee Jobs
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Tamil Nadu's most trusted hyperlocal job platform. Start your journey today!
          </p>
          <div className="space-y-4 text-left">
            {[
              'Free to join — no hidden charges',
              'Find jobs near your home',
              'Apply with WhatsApp in seconds',
              'Tamil language support',
              'Verified companies only',
            ].map((point) => (
              <div key={point} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-brand-yellow flex-shrink-0" />
                <span className="text-gray-300 text-sm">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--bg-primary)] overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-brand-yellow text-sm mb-4">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <div className="lg:hidden mb-4">
              <AllBeeLogo />
            </div>
            <h1 className="font-display font-bold text-3xl text-[var(--text-primary)] mb-1">
              Create Account
            </h1>
            <p className="text-[var(--text-muted)]">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-brand-yellow hover:underline font-medium">Sign in</Link>
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <p className="label mb-2">I want to...</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'seeker', label: 'Find a Job', sublabel: 'Job Seeker', icon: User },
                { id: 'employer', label: 'Hire People', sublabel: 'Employer', icon: Building2 },
              ].map(({ id, label, sublabel, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRole(id as 'seeker' | 'employer')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    role === id
                      ? 'border-brand-yellow bg-brand-yellow-light dark:bg-yellow-900/20'
                      : 'border-[var(--border)] hover:border-brand-yellow/50'
                  }`}
                >
                  <Icon size={22} className={role === id ? 'text-brand-yellow' : 'text-[var(--text-muted)]'} />
                  <p className={`font-semibold text-sm mt-2 ${role === id ? 'text-brand-yellow' : 'text-[var(--text-primary)]'}`}>
                    {label}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{sublabel}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 p-3.5 rounded-xl
              border-2 border-[var(--border)] hover:border-brand-yellow
              text-[var(--text-primary)] font-medium transition-all mb-5
              hover:bg-brand-yellow-light disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-[var(--bg-primary)] text-[var(--text-muted)]">or register with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Priya Ramesh"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                onClick={() => setAgreed(!agreed)}
                className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 transition-all flex items-center justify-center ${
                  agreed ? 'bg-brand-yellow border-brand-yellow' : 'border-[var(--border)] group-hover:border-brand-yellow'
                }`}
              >
                {agreed && <CheckCircle2 size={12} className="text-brand-black" />}
              </div>
              <span className="text-sm text-[var(--text-secondary)]">
                I agree to AllBee's{' '}
                <Link href="/terms" className="text-brand-yellow hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-brand-yellow hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <button type="submit" disabled={loading || !agreed} className="btn-primary w-full py-3.5 text-base">
              {loading ? <Loader2 size={18} className="animate-spin" /> : `Create ${role === 'employer' ? 'Employer' : ''} Account 🐝`}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
