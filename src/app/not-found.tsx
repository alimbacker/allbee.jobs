import Link from 'next/link'
import { AllBeeLogo } from '@/components/ui/Logo'
import { ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center px-4 text-center">
      <AllBeeLogo size={48} className="justify-center mb-8" />
      <div className="text-8xl font-display font-extrabold text-brand-yellow mb-2">404</div>
      <h1 className="font-display font-bold text-3xl text-[var(--text-primary)] mb-3">
        Oops! Page not found
      </h1>
      <p className="text-[var(--text-muted)] text-lg max-w-md mb-8">
        The page you're looking for doesn't exist. Maybe the job has been filled or the URL is incorrect.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/" className="btn-primary">
          <ArrowLeft size={18} /> Go Home
        </Link>
        <Link href="/jobs" className="btn-secondary">
          <Search size={18} /> Browse Jobs
        </Link>
      </div>
      <div className="mt-12 text-6xl animate-float">🐝</div>
    </div>
  )
}
