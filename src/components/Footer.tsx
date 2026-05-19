import Link from 'next/link'
import { AllBeeLogo } from '@/components/ui/Logo'
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'

const footerLinks = {
  'For Job Seekers': [
    { label: 'Browse Jobs', href: '/jobs' },
    { label: 'Jobs by Category', href: '/jobs?view=categories' },
    { label: 'Jobs Near Me', href: '/jobs?nearby=true' },
    { label: 'Fresher Jobs', href: '/jobs?level=fresher' },
    { label: 'Part Time Jobs', href: '/jobs?type=part_time' },
    { label: 'Work From Home', href: '/jobs?remote=true' },
  ],
  'For Employers': [
    { label: 'Post a Job', href: '/employer/post-job' },
    { label: 'Browse Candidates', href: '/employer/candidates' },
    { label: 'Employer Dashboard', href: '/employer/dashboard' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Company Profile', href: '/employer/profile' },
  ],
  'Company': [
    { label: 'About AllBee', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Sitemap', href: '/sitemap.xml' },
  ],
  'Popular Cities': [
    { label: 'Jobs in Coimbatore', href: '/jobs?city=Coimbatore' },
    { label: 'Jobs in Chennai', href: '/jobs?city=Chennai' },
    { label: 'Jobs in Madurai', href: '/jobs?city=Madurai' },
    { label: 'Jobs in Salem', href: '/jobs?city=Salem' },
    { label: 'Jobs in Tiruppur', href: '/jobs?city=Tiruppur' },
    { label: 'Jobs in Erode', href: '/jobs?city=Erode' },
  ],
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-brand-black text-white">
      {/* Main Footer */}
      <div className="container-custom px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <AllBeeLogo size={36} />
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              AllBee Jobs is Tamil Nadu's leading hyperlocal job portal connecting 
              local businesses with nearby job seekers. Find jobs near you and hire 
              local talent easily.
            </p>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <MapPin size={14} className="text-brand-yellow flex-shrink-0" />
                Coimbatore, Tamil Nadu 641 001
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Phone size={14} className="text-brand-yellow flex-shrink-0" />
                +91 90000 00000
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Mail size={14} className="text-brand-yellow flex-shrink-0" />
                hello@allbee.jobs
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
                { icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-brand-yellow hover:text-brand-black
                    flex items-center justify-center transition-all duration-200 text-gray-400"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-brand-yellow transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                🐝 Get Job Alerts in Your Inbox
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Subscribe and get daily job alerts for jobs near you!
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input bg-white/10 border-white/20 text-white placeholder:text-gray-500 flex-1 md:w-72"
              />
              <button className="btn-primary flex-shrink-0">Subscribe</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm text-center md:text-left">
            © {currentYear} AllBee Solutions Pvt Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="badge bg-brand-yellow/10 text-brand-yellow text-xs border border-brand-yellow/20">
              🇮🇳 Made in Tamil Nadu
            </span>
            <span className="text-gray-500 text-xs">
              🐝 Your Local Career Partner
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
