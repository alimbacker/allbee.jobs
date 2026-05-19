interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
}

export function AllBeeLogo({ size = 32, showText = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Bee SVG Icon */}
      <div className="relative bee-animate flex-shrink-0">
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Wings */}
          <ellipse cx="10" cy="14" rx="9" ry="5" fill="#F5C518" opacity="0.7" transform="rotate(-15 10 14)" />
          <ellipse cx="30" cy="14" rx="9" ry="5" fill="#F5C518" opacity="0.7" transform="rotate(15 30 14)" />

          {/* Body */}
          <ellipse cx="20" cy="22" rx="9" ry="12" fill="#F5C518" />

          {/* Stripes */}
          <rect x="11.5" y="19" width="17" height="3.5" rx="1.75" fill="#0A0A0A" opacity="0.8" />
          <rect x="11.5" y="25" width="17" height="3.5" rx="1.75" fill="#0A0A0A" opacity="0.8" />

          {/* Head */}
          <circle cx="20" cy="11" r="6.5" fill="#F5C518" />

          {/* Eyes */}
          <circle cx="17.5" cy="10" r="1.8" fill="#0A0A0A" />
          <circle cx="22.5" cy="10" r="1.8" fill="#0A0A0A" />
          <circle cx="18" cy="9.5" r="0.6" fill="white" />
          <circle cx="23" cy="9.5" r="0.6" fill="white" />

          {/* Smile */}
          <path d="M17 13 Q20 15.5 23 13" stroke="#0A0A0A" strokeWidth="1.2" strokeLinecap="round" fill="none" />

          {/* Antennae */}
          <line x1="17" y1="5" x2="13" y2="1" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12.5" cy="0.8" r="1.2" fill="#F5C518" stroke="#0A0A0A" strokeWidth="0.8" />
          <line x1="23" y1="5" x2="27" y2="1" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="27.5" cy="0.8" r="1.2" fill="#F5C518" stroke="#0A0A0A" strokeWidth="0.8" />

          {/* Stinger */}
          <path d="M20 34 L18 38 L22 38 Z" fill="#D4A800" />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-display font-extrabold text-xl text-[var(--text-primary)] tracking-tight">
            All<span className="text-brand-yellow">Bee</span>{' '}
            <span className="text-[var(--text-primary)]">Jobs</span>
          </span>
          <span className="text-[9px] text-[var(--text-muted)] font-body tracking-wider uppercase">
            Your Local Career Partner
          </span>
        </div>
      )}
    </div>
  )
}
