'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, X, MapPin, Locate } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { JOB_CATEGORIES, CITIES_TN, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const BENEFITS_OPTIONS = [
  'PF / ESI', 'Health Insurance', 'Annual Bonus', 'Paid Leaves',
  'Free Meals', 'Transport', 'Training', 'Flexible Hours',
  'Work From Home', 'Overtime Pay', 'Incentives', 'Accommodation',
]

export default function PostJobPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    job_type: 'full_time',
    experience_level: 'fresher',
    experience_min: 0,
    experience_max: 2,
    salary_min: '',
    salary_max: '',
    salary_type: 'monthly',
    is_salary_disclosed: true,
    is_salary_negotiable: false,
    location: '',
    location_lat: '',
    location_lng: '',
    is_remote: false,
    is_hybrid: false,
    vacancies: 1,
    skills_required: [] as string[],
    requirements: [] as string[],
    benefits: [] as string[],
    whatsapp_apply: false,
    whatsapp_number: '',
    is_urgent: false,
    application_deadline: '',
    tags: [] as string[],
  })
  const [skillInput, setSkillInput] = useState('')
  const [reqInput, setReqInput] = useState('')

  useEffect(() => {
    if (user) fetchCompany()
  }, [user])

  const fetchCompany = async () => {
    const { data } = await supabase.from('companies').select('*').eq('owner_id', user!.id).single()
    setCompany(data)
    if (!data) toast.error('Please create a company profile first!')
  }

  const handleLocate = () => {
    setLocating(true)
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setForm(prev => ({
          ...prev,
          location_lat: pos.coords.latitude.toString(),
          location_lng: pos.coords.longitude.toString(),
        }))
        setLocating(false)
        toast.success('Location detected!')
      },
      () => { setLocating(false); toast.error('Could not detect location') }
    )
  }

  const addSkill = () => {
    if (skillInput.trim() && !form.skills_required.includes(skillInput.trim())) {
      setForm(prev => ({ ...prev, skills_required: [...prev.skills_required, skillInput.trim()] }))
      setSkillInput('')
    }
  }

  const addRequirement = () => {
    if (reqInput.trim()) {
      setForm(prev => ({ ...prev, requirements: [...prev.requirements, reqInput.trim()] }))
      setReqInput('')
    }
  }

  const toggleBenefit = (b: string) => {
    setForm(prev => ({
      ...prev,
      benefits: prev.benefits.includes(b)
        ? prev.benefits.filter(x => x !== b)
        : [...prev.benefits, b],
    }))
  }

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.location) {
      return toast.error('Please fill all required fields')
    }
    if (!company) return toast.error('Please set up your company profile first')
    setLoading(true)

    const slug = form.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '-' + Date.now()

    const { data, error } = await supabase.from('jobs').insert({
      ...form,
      slug,
      company_id: company.id,
      posted_by: user!.id,
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      location_lat: form.location_lat ? parseFloat(form.location_lat) : null,
      location_lng: form.location_lng ? parseFloat(form.location_lng) : null,
      status: 'active',
    }).select().single()

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Job posted successfully! 🎉')
      router.push('/employer/dashboard')
    }
    setLoading(false)
  }

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--bg-secondary)] pt-16">
        <div className="container-custom px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">Post a Job</h1>
            <p className="text-[var(--text-muted)] mt-1">Find the perfect local candidate</p>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-0 mb-8">
            {['Job Details', 'Requirements', 'Salary & Location', 'Settings'].map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <button
                  onClick={() => setStep(i + 1)}
                  className={cn('flex items-center gap-2 text-sm font-medium transition-colors',
                    step >= i + 1 ? 'text-brand-yellow' : 'text-[var(--text-muted)]')}
                >
                  <span className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                    step > i + 1 ? 'bg-brand-yellow text-brand-black' :
                      step === i + 1 ? 'bg-brand-yellow text-brand-black' :
                        'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)]'
                  )}>
                    {step > i + 1 ? '✓' : i + 1}
                  </span>
                  <span className="hidden md:block">{s}</span>
                </button>
                {i < 3 && <div className={cn('flex-1 h-0.5 mx-2', step > i + 1 ? 'bg-brand-yellow' : 'bg-[var(--border)]')} />}
              </div>
            ))}
          </div>

          <div className="card p-6">
            {/* Step 1: Job Details */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Job Details</h2>

                <div>
                  <label className="label">Job Title *</label>
                  <input value={form.title} onChange={(e) => update('title', e.target.value)}
                    placeholder="e.g. Sales Executive, Web Developer, Security Guard"
                    className="input" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Category *</label>
                    <select value={form.category_id} onChange={(e) => update('category_id', e.target.value)} className="input">
                      <option value="">Select Category</option>
                      {JOB_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Job Type *</label>
                    <select value={form.job_type} onChange={(e) => update('job_type', e.target.value)} className="input">
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Job Description *</label>
                  <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
                    rows={7} placeholder="Describe the role, responsibilities, and what a typical day looks like..."
                    className="input resize-none" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Experience Level</label>
                    <select value={form.experience_level} onChange={(e) => update('experience_level', e.target.value)} className="input">
                      <option value="fresher">Fresher / 0 years</option>
                      <option value="junior">Junior / 1-2 years</option>
                      <option value="mid">Mid / 3-5 years</option>
                      <option value="senior">Senior / 5-8 years</option>
                      <option value="lead">Lead / 8+ years</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Min. Experience (Years)</label>
                    <input type="number" value={form.experience_min}
                      onChange={(e) => update('experience_min', parseInt(e.target.value))}
                      min={0} className="input" />
                  </div>
                  <div>
                    <label className="label">Vacancies</label>
                    <input type="number" value={form.vacancies}
                      onChange={(e) => update('vacancies', parseInt(e.target.value))}
                      min={1} className="input" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={() => setStep(2)} className="btn-primary">
                    Next: Requirements →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Requirements */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Requirements & Skills</h2>

                <div>
                  <label className="label">Required Skills</label>
                  <div className="flex gap-2 mb-3">
                    <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder="Add a skill and press Enter" className="input flex-1" />
                    <button onClick={addSkill} className="btn-primary px-4">
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.skills_required.map(skill => (
                      <span key={skill} className="badge badge-yellow gap-2">
                        {skill}
                        <button onClick={() => update('skills_required', form.skills_required.filter(s => s !== skill))}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Job Requirements</label>
                  <div className="flex gap-2 mb-3">
                    <input value={reqInput} onChange={(e) => setReqInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                      placeholder="e.g. Must have valid driving license" className="input flex-1" />
                    <button onClick={addRequirement} className="btn-primary px-4">
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.requirements.map((req, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--bg-secondary)]">
                        <span className="text-brand-yellow mt-0.5">•</span>
                        <span className="flex-1 text-sm text-[var(--text-secondary)]">{req}</span>
                        <button onClick={() => update('requirements', form.requirements.filter((_, idx) => idx !== i))}
                          className="text-[var(--text-muted)] hover:text-red-500">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Benefits & Perks</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {BENEFITS_OPTIONS.map(benefit => (
                      <label key={benefit} className={cn(
                        'flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all',
                        form.benefits.includes(benefit)
                          ? 'border-brand-yellow bg-brand-yellow-light dark:bg-yellow-900/20'
                          : 'border-[var(--border)] hover:border-brand-yellow/50'
                      )}>
                        <div onClick={() => toggleBenefit(benefit)}
                          className={cn('w-4 h-4 rounded border-2 flex-shrink-0 transition-colors',
                            form.benefits.includes(benefit) ? 'bg-brand-yellow border-brand-yellow' : 'border-[var(--border-strong)]'
                          )} />
                        <span className="text-sm text-[var(--text-secondary)]">{benefit}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep(1)} className="btn-secondary">← Back</button>
                  <button onClick={() => setStep(3)} className="btn-primary">Next: Salary & Location →</button>
                </div>
              </div>
            )}

            {/* Step 3: Salary & Location */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Salary & Location</h2>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">Salary Range</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <div onClick={() => update('is_salary_disclosed', !form.is_salary_disclosed)}
                          className={cn('w-4 h-4 rounded border-2 transition-colors',
                            form.is_salary_disclosed ? 'bg-brand-yellow border-brand-yellow' : 'border-[var(--border-strong)]'
                          )} />
                        Show Salary
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <div onClick={() => update('is_salary_negotiable', !form.is_salary_negotiable)}
                          className={cn('w-4 h-4 rounded border-2 transition-colors',
                            form.is_salary_negotiable ? 'bg-brand-yellow border-brand-yellow' : 'border-[var(--border-strong)]'
                          )} />
                        Negotiable
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <input type="number" value={form.salary_min} onChange={(e) => update('salary_min', e.target.value)}
                      placeholder="Min (₹)" className="input" />
                    <input type="number" value={form.salary_max} onChange={(e) => update('salary_max', e.target.value)}
                      placeholder="Max (₹)" className="input" />
                    <select value={form.salary_type} onChange={(e) => update('salary_type', e.target.value)} className="input">
                      <option value="monthly">Per Month</option>
                      <option value="yearly">Per Year</option>
                      <option value="hourly">Per Hour</option>
                      <option value="per_day">Per Day</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Job Location *</label>
                  <div className="flex gap-2">
                    <select value={form.location} onChange={(e) => update('location', e.target.value)} className="input flex-1">
                      <option value="">Select City</option>
                      {CITIES_TN.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <button onClick={handleLocate} disabled={locating}
                      className="btn-secondary px-3 gap-1 text-sm flex-shrink-0">
                      <Locate size={16} className={locating ? 'animate-spin' : ''} />
                      Detect
                    </button>
                  </div>
                  {form.location_lat && (
                    <p className="text-xs text-green-500 mt-1.5">
                      ✓ GPS coordinates captured: {form.location_lat}, {form.location_lng}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => update('is_remote', !form.is_remote)}
                      className={cn('w-5 h-5 rounded border-2 transition-colors',
                        form.is_remote ? 'bg-brand-yellow border-brand-yellow' : 'border-[var(--border-strong)]'
                      )} />
                    <span className="text-sm text-[var(--text-secondary)]">🏠 Remote Work Available</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => update('is_hybrid', !form.is_hybrid)}
                      className={cn('w-5 h-5 rounded border-2 transition-colors',
                        form.is_hybrid ? 'bg-brand-yellow border-brand-yellow' : 'border-[var(--border-strong)]'
                      )} />
                    <span className="text-sm text-[var(--text-secondary)]">🏢 Hybrid Mode</span>
                  </label>
                </div>

                <div>
                  <label className="label">Application Deadline</label>
                  <input type="date" value={form.application_deadline}
                    onChange={(e) => update('application_deadline', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input" />
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep(2)} className="btn-secondary">← Back</button>
                  <button onClick={() => setStep(4)} className="btn-primary">Next: Settings →</button>
                </div>
              </div>
            )}

            {/* Step 4: Settings & Publish */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Final Settings</h2>

                <div className="space-y-4">
                  <label className="flex items-start gap-4 p-4 rounded-xl border-2 border-[var(--border)] cursor-pointer
                    hover:border-green-500 transition-colors">
                    <div onClick={() => update('whatsapp_apply', !form.whatsapp_apply)}
                      className={cn('w-5 h-5 rounded border-2 mt-0.5 transition-colors flex-shrink-0',
                        form.whatsapp_apply ? 'bg-green-500 border-green-500' : 'border-[var(--border-strong)]'
                      )} />
                    <div>
                      <p className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                        📱 Enable WhatsApp Apply
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        Let candidates apply directly via WhatsApp
                      </p>
                    </div>
                  </label>

                  {form.whatsapp_apply && (
                    <div>
                      <label className="label">WhatsApp Number</label>
                      <div className="flex gap-2">
                        <div className="input w-20 text-center bg-[var(--bg-secondary)] flex items-center justify-center font-medium text-sm">+91</div>
                        <input type="tel" value={form.whatsapp_number}
                          onChange={(e) => update('whatsapp_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="9876543210" className="input flex-1" maxLength={10} />
                      </div>
                    </div>
                  )}

                  <label className="flex items-start gap-4 p-4 rounded-xl border-2 border-[var(--border)] cursor-pointer
                    hover:border-red-500 transition-colors">
                    <div onClick={() => update('is_urgent', !form.is_urgent)}
                      className={cn('w-5 h-5 rounded border-2 mt-0.5 transition-colors flex-shrink-0',
                        form.is_urgent ? 'bg-red-500 border-red-500' : 'border-[var(--border-strong)]'
                      )} />
                    <div>
                      <p className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                        ⚡ Mark as Urgent
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        Highlight this job as urgent hiring to attract more applicants
                      </p>
                    </div>
                  </label>
                </div>

                {/* Preview Summary */}
                <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-3">Job Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-[var(--text-muted)]">Title:</span> <span className="font-medium">{form.title || '—'}</span></div>
                    <div><span className="text-[var(--text-muted)]">Type:</span> <span className="font-medium capitalize">{form.job_type.replace('_', ' ')}</span></div>
                    <div><span className="text-[var(--text-muted)]">Location:</span> <span className="font-medium">{form.location || '—'}</span></div>
                    <div><span className="text-[var(--text-muted)]">Vacancies:</span> <span className="font-medium">{form.vacancies}</span></div>
                    <div><span className="text-[var(--text-muted)]">Salary:</span> <span className="font-medium">
                      {form.salary_min && form.salary_max ? `₹${form.salary_min} - ₹${form.salary_max}` : 'Not specified'}
                    </span></div>
                    <div><span className="text-[var(--text-muted)]">WhatsApp:</span> <span className="font-medium">{form.whatsapp_apply ? '✓ Yes' : 'No'}</span></div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep(3)} className="btn-secondary">← Back</button>
                  <button onClick={handleSubmit} disabled={loading} className="btn-primary px-8">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : '🚀 Publish Job'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
