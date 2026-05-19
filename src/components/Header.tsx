'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Menu, X, Sun, Moon, Globe, ChevronDown, Bell, Briefcase, User, LogOut, LayoutDashboard, Settings } from 'lucide-react'
import { AllBeeLogo } from '@/components/ui/Logo'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, profile, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
    router.push('/')
  }

  const getDashboardLink = () => {
    if (profile?.role === 'employer') return '/employer/dashboard'
    if (profile?.role === 'admin') return '/admin/dashboard'
    return '/seeker/dashboard'
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'glass border-b border-[var(--border)] shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <AllBeeLogo size={30} />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/jobs" className={cn('nav-link', pathname.startsWith('/jobs') && 'nav-link-active')}>
              {t('find_jobs')}
            </Link>
            <Link href="/companies" className={cn('nav-link', pathname.startsWith('/companies') && 'nav-link-active')}>
              Companies
            </Link>
            {profile?.role === 'employer' && (
              <Link href="/employer/post-job" className={cn('nav-link', pathname === '/employer/post-job' && 'nav-link-active')}>
                {t('post_job')}
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="btn-ghost text-xs font-semibold px-2.5 py-1.5 gap-1"
              title="Toggle language"
            >
              <Globe size={14} />
              {language === 'en' ? 'தமிழ்' : 'EN'}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="btn-ghost p-2"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                {/* Notification bell */}
                <button className="btn-ghost p-2 relative">
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-yellow rounded-full" />
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-brand-black font-bold text-sm">
                      {profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <ChevronDown size={14} className={cn('transition-transform', isUserMenuOpen && 'rotate-180')} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-12 w-56 card shadow-card-hover py-1 animate-slide-down">
                      <div className="px-4 py-3 border-b border-[var(--border)]">
                        <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{profile?.email}</p>
                        <span className="badge badge-yellow mt-1 capitalize">{profile?.role}</span>
                      </div>
                      <Link href={getDashboardLink()} onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-brand-yellow transition-colors">
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      <Link href="/seeker/profile" onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-brand-yellow transition-colors">
                        <User size={16} /> {t('my_profile')}
                      </Link>
                      {profile?.role === 'seeker' && (
                        <Link href="/seeker/applications" onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-brand-yellow transition-colors">
                          <Briefcase size={16} /> {t('my_applications')}
                        </Link>
                      )}
                      <hr className="border-[var(--border)] my-1" />
                      <button onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <LogOut size={16} /> {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login" className="btn-ghost">
                  {t('login')}
                </Link>
                <Link href="/auth/register" className="btn-primary py-2 px-4 text-sm">
                  {t('register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden btn-ghost p-2"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileOpen && (
          <div className="md:hidden border-t border-[var(--border)] py-4 px-4 animate-slide-down space-y-1 bg-[var(--bg-card)]">
            <Link href="/jobs" className="flex items-center gap-3 nav-link w-full"
              onClick={() => setIsMobileOpen(false)}>
              <Briefcase size={18} /> {t('find_jobs')}
            </Link>
            <Link href="/companies" className="flex items-center gap-3 nav-link w-full"
              onClick={() => setIsMobileOpen(false)}>
              Companies
            </Link>
            {profile?.role === 'employer' && (
              <Link href="/employer/post-job" className="flex items-center gap-3 nav-link w-full"
                onClick={() => setIsMobileOpen(false)}>
                {t('post_job')}
              </Link>
            )}
            {!user ? (
              <div className="flex gap-3 pt-3 border-t border-[var(--border)]">
                <Link href="/auth/login" className="btn-secondary flex-1 py-2 text-sm"
                  onClick={() => setIsMobileOpen(false)}>
                  {t('login')}
                </Link>
                <Link href="/auth/register" className="btn-primary flex-1 py-2 text-sm"
                  onClick={() => setIsMobileOpen(false)}>
                  {t('register')}
                </Link>
              </div>
            ) : (
              <div className="pt-3 border-t border-[var(--border)]">
                <Link href={getDashboardLink()} className="flex items-center gap-3 nav-link w-full"
                  onClick={() => setIsMobileOpen(false)}>
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <button onClick={() => { handleSignOut(); setIsMobileOpen(false) }}
                  className="flex items-center gap-3 nav-link w-full text-red-500">
                  <LogOut size={18} /> {t('logout')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
