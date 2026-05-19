'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, SlidersHorizontal, X, Locate } from 'lucide-react'
import { cn, JOB_CATEGORIES, CITIES_TN } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

interface SearchBarProps {
  defaultQuery?: string
  defaultLocation?: string
  onSearch?: (query: string, location: string) => void
  size?: 'sm' | 'lg'
  className?: string
}

export function SearchBar({
  defaultQuery = '',
  defaultLocation = '',
  onSearch,
  size = 'lg',
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultQuery)
  const [location, setLocation] = useState(defaultLocation)
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [locating, setLocating] = useState(false)
  const { t } = useLanguage()
  const router = useRouter()
  const locationRef = useRef<HTMLDivElement>(null)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (location) params.set('location', location)
    if (onSearch) {
      onSearch(query, location)
    } else {
      router.push(`/jobs?${params.toString()}`)
    }
  }

  const handleLocationInput = (value: string) => {
    setLocation(value)
    if (value.length > 1) {
      const matches = CITIES_TN.filter(city =>
        city.toLowerCase().startsWith(value.toLowerCase())
      )
      setLocationSuggestions(matches)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleLocateMe = () => {
    setLocating(true)
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLocation('Near Me')
        setLocating(false)
        const params = new URLSearchParams()
        if (query) params.set('q', query)
        params.set('lat', pos.coords.latitude.toString())
        params.set('lng', pos.coords.longitude.toString())
        params.set('nearby', 'true')
        router.push(`/jobs?${params.toString()}`)
      },
      () => { setLocating(false) }
    )
  }

  const isLarge = size === 'lg'

  return (
    <div className={cn('w-full', className)}>
      <div className={cn(
        'flex flex-col md:flex-row gap-3 md:gap-0',
        'md:rounded-2xl md:border-2 md:border-brand-yellow/30',
        'md:bg-[var(--bg-card)] md:shadow-yellow md:overflow-hidden',
        'hover:md:border-brand-yellow transition-colors'
      )}>
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-yellow" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('search_placeholder')}
            className={cn(
              'w-full bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'border-2 border-brand-yellow/30 md:border-0 outline-none',
              'rounded-xl md:rounded-none focus:ring-0 transition-colors',
              isLarge ? 'px-5 pl-11 py-4 text-base' : 'px-4 pl-10 py-3 text-sm'
            )}
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-[var(--border)]" />

        {/* Location Input */}
        <div className="flex-1 relative" ref={locationRef}>
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-yellow" size={18} />
          <input
            type="text"
            value={location}
            onChange={(e) => handleLocationInput(e.target.value)}
            onFocus={() => location.length > 1 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('location_placeholder')}
            className={cn(
              'w-full bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'border-2 border-brand-yellow/30 md:border-0 outline-none',
              'rounded-xl md:rounded-none focus:ring-0 transition-colors',
              isLarge ? 'px-5 pl-11 pr-10 py-4 text-base' : 'px-4 pl-10 pr-9 py-3 text-sm'
            )}
          />
          {location && (
            <button
              onClick={() => { setLocation(''); setShowSuggestions(false) }}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={14} />
            </button>
          )}
          <button
            onClick={handleLocateMe}
            disabled={locating}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-yellow hover:text-brand-yellow-dark disabled:opacity-50"
            title="Use my location"
          >
            <Locate size={16} className={locating ? 'animate-spin' : ''} />
          </button>

          {/* Location Suggestions */}
          {showSuggestions && locationSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 card shadow-card-hover py-1 z-50 animate-slide-down">
              {locationSuggestions.map((city) => (
                <button
                  key={city}
                  className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-primary)]
                    hover:bg-brand-yellow-light hover:text-brand-yellow-dark transition-colors"
                  onMouseDown={() => {
                    setLocation(city)
                    setShowSuggestions(false)
                  }}
                >
                  <MapPin size={12} className="inline mr-2 text-brand-yellow" />
                  {city}, Tamil Nadu
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className={cn(
            'btn-primary rounded-xl md:rounded-none md:rounded-r-xl flex-shrink-0 font-bold',
            isLarge ? 'px-8 py-4 text-base' : 'px-6 py-3 text-sm'
          )}
        >
          <Search size={18} />
          Search Jobs
        </button>
      </div>

      {/* Quick filters */}
      {isLarge && (
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-sm text-[var(--text-muted)]">Popular:</span>
          {['Fresher Jobs', 'Work From Home', 'Part Time', 'IT Jobs', 'Coimbatore'].map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term)
                router.push(`/jobs?q=${encodeURIComponent(term)}`)
              }}
              className="tag text-xs"
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
