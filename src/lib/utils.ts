import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSalary(min?: number | null, max?: number | null, type?: string) {
  const formatNum = (n: number) => {
    if (n >= 100000) return `${(n / 100000).toFixed(1)}L`
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
    return n.toString()
  }

  if (!min && !max) return 'Salary not disclosed'
  if (min && max) return `₹${formatNum(min)} - ₹${formatNum(max)}`
  if (min) return `₹${formatNum(min)}+`
  if (max) return `Up to ₹${formatNum(max)}`
  return ''
}

export function formatDate(date: string) {
  return format(new Date(date), 'dd MMM yyyy')
}

export function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatJobType(type: string) {
  return {
    full_time: 'Full Time',
    part_time: 'Part Time',
    contract: 'Contract',
    internship: 'Internship',
    freelance: 'Freelance',
  }[type] || type
}

export function formatExperienceLevel(level: string) {
  return {
    fresher: 'Fresher',
    junior: '1-2 Years',
    mid: '3-5 Years',
    senior: '5-8 Years',
    lead: '8+ Years',
  }[level] || level
}

export function getWhatsAppLink(phone: string, jobTitle: string, companyName: string) {
  const message = encodeURIComponent(
    `Hi! I'm interested in the ${jobTitle} position at ${companyName}. I found your job posting on AllBee Jobs. Could you please share more details?`
  )
  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const JOB_CATEGORIES = [
  { value: 'it-software', label: 'IT & Software', label_ta: 'தகவல் தொழில்நுட்பம்', icon: '💻' },
  { value: 'sales-marketing', label: 'Sales & Marketing', label_ta: 'விற்பனை & சந்தைப்படுத்தல்', icon: '📈' },
  { value: 'manufacturing', label: 'Manufacturing', label_ta: 'உற்பத்தி', icon: '🏭' },
  { value: 'healthcare', label: 'Healthcare', label_ta: 'சுகாதாரம்', icon: '🏥' },
  { value: 'education', label: 'Education', label_ta: 'கல்வி', icon: '📚' },
  { value: 'retail', label: 'Retail', label_ta: 'சில்லறை வர்த்தகம்', icon: '🛒' },
  { value: 'construction', label: 'Construction', label_ta: 'கட்டுமானம்', icon: '🏗️' },
  { value: 'hospitality', label: 'Hospitality', label_ta: 'விருந்தோம்பல்', icon: '🍽️' },
  { value: 'transport-logistics', label: 'Transport & Logistics', label_ta: 'போக்குவரத்து', icon: '🚛' },
  { value: 'finance-banking', label: 'Finance & Banking', label_ta: 'நிதி & வங்கி', icon: '🏦' },
  { value: 'textiles-fashion', label: 'Textiles & Fashion', label_ta: 'ஜவுளி & நாகரிகம்', icon: '👗' },
  { value: 'customer-support', label: 'Customer Support', label_ta: 'வாடிக்கையாளர் சேவை', icon: '🎧' },
]

export const CITIES_TN = [
  'Coimbatore', 'Chennai', 'Madurai', 'Tiruchirappalli', 'Salem',
  'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukkudi',
  'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur',
  'Udhagamandalam', 'Hosur', 'Nagercoil', 'Kanchipuram', 'Kumbakonam'
]

export const translations = {
  en: {
    find_jobs: 'Find Jobs',
    post_job: 'Post a Job',
    nearby_jobs: 'Jobs Near You',
    search_placeholder: 'Job title, skills, or company',
    location_placeholder: 'City or area',
    apply_now: 'Apply Now',
    save_job: 'Save Job',
    whatsapp_apply: 'Apply via WhatsApp',
    full_time: 'Full Time',
    part_time: 'Part Time',
    fresher: 'Fresher Welcome',
    login: 'Login',
    register: 'Register',
    dashboard: 'Dashboard',
    my_applications: 'My Applications',
    my_profile: 'My Profile',
    logout: 'Logout',
  },
  ta: {
    find_jobs: 'வேலை தேடு',
    post_job: 'வேலை பதிவிடு',
    nearby_jobs: 'அருகில் வேலைகள்',
    search_placeholder: 'வேலை தலைப்பு, திறன்கள் அல்லது நிறுவனம்',
    location_placeholder: 'நகரம் அல்லது பகுதி',
    apply_now: 'இப்போது விண்ணப்பிக்கவும்',
    save_job: 'சேமி',
    whatsapp_apply: 'WhatsApp மூலம் விண்ணப்பிக்கவும்',
    full_time: 'முழு நேரம்',
    part_time: 'பகுதி நேரம்',
    fresher: 'புதியவர்கள் வரவேற்கப்படுகிறார்கள்',
    login: 'உள்நுழைய',
    register: 'பதிவு செய்',
    dashboard: 'டாஷ்போர்டு',
    my_applications: 'என் விண்ணப்பங்கள்',
    my_profile: 'என் சுயவிவரம்',
    logout: 'வெளியேறு',
  }
}
