'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Phone, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import { AllBeeLogo } from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

type AuthMethod = 'email' | 'phone'
type AuthStep = 'method' | 'otp'

export default function LoginPage() {
  const [method, setMethod] = useState<AuthMethod>('email')
  const [step, setStep] = useState<AuthStep>('method')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Please fill all fields')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back! 🐝')
      router.push('/seeker/dashboard')
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) toast.error(error.message)
    setLoading(false)
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) return toast.error('Enter phone number')
    setLoading(true)
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
    const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('OTP sent to your phone!')
      setStep('otp')
    }
    setLoading(false)
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) return toast.error('Enter OTP')
    setLoading(true)
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'sms',
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Logged in successfully! 🐝')
      router.push('/seeker/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-black to-brand-gray-800
        items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-20" />
        <div className="absolute top-12 right-12 text-7xl animate-float">🐝</div>
        <div className="relative text-center">
          <AllBeeLogo size={60} className="justify-center mb-8" />
          <h2 className="font-display font-bold text-4xl text-white mb-4">
            Welcome Back!
          </h2>
          <p className="text-gray-400 text-lg max-w-md">
            Sign in to access thousands of local jobs across Tamil Nadu.
            Your dream job is waiting! 🎯
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[
              { value: '50K+', label: 'Jobs' },
              { value: '10K+', label: 'Companies' },
              { value: '2L+', label: 'Users' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="font-display font-bold text-2xl text-brand-yellow">{value}</div>
                <div className="text-gray-400 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--bg-primary)]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-brand-yellow text-sm mb-6">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <AllBeeLogo />
          </div>

          <div className="hidden lg:block mb-2">
            <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-brand-yellow text-sm">
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>

          <h1 className="font-display font-bold text-3xl text-[var(--text-primary)] mb-2">
            Sign In
          </h1>
          <p className="text-[var(--text-muted)] mb-8">
            New to AllBee?{' '}
            <Link href="/auth/register" className="text-brand-yellow hover:underline font-medium">
              Create an account
            </Link>
          </p>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 p-3.5 rounded-xl
              border-2 border-[var(--border)] hover:border-brand-yellow
              text-[var(--text-primary)] font-medium transition-all mb-6
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

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-[var(--bg-primary)] text-[var(--text-muted)]">or sign in with</span>
            </div>
          </div>

          {/* Method Tabs */}
          <div className="flex rounded-xl border border-[var(--border)] p-1 mb-6">
            {[
              { id: 'email', label: 'Email', icon: Mail },
              { id: 'phone', label: 'Mobile OTP', icon: Phone },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setMethod(id as AuthMethod); setStep('method') }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium
                  transition-all ${method === id
                    ? 'bg-brand-yellow text-brand-black shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Email Form */}
          {method === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs text-brand-yellow hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]
                      hover:text-[var(--text-primary)] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
              </button>
            </form>
          )}

          {/* Phone/OTP Form */}
          {method === 'phone' && step === 'method' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="label">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="input w-20 text-center bg-[var(--bg-secondary)] flex items-center justify-center font-medium">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="input flex-1"
                    maxLength={10}
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send OTP'}
              </button>
            </form>
          )}

          {method === 'phone' && step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-[var(--text-muted)]">
                  OTP sent to <strong className="text-[var(--text-primary)]">+91 {phone}</strong>
                </p>
                <button type="button" onClick={() => setStep('method')}
                  className="text-xs text-brand-yellow hover:underline mt-1">
                  Change number
                </button>
              </div>
              <div>
                <label className="label">Enter 6-digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="input text-center text-2xl tracking-widest font-bold"
                  maxLength={6}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify OTP'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
