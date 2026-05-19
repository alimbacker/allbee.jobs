'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import {
  User, Upload, Plus, X, MapPin, Locate, Save, Loader2,
  FileText, CheckCircle2, Briefcase, GraduationCap, Link2, Globe
} from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { CITIES_TN, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const SKILLS_SUGGESTIONS = [
  'Microsoft Office', 'Tally ERP', 'AutoCAD', 'Photoshop', 'Communication',
  'Sales', 'Customer Service', 'Driving', 'English Speaking', 'Accounts',
  'Data Entry', 'Social Media', 'Marketing', 'Machine Operation', 'Quality Control',
  'Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Excel', 'Leadership',
]

export default function SeekerProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState('personal')
  const [loading, setLoading] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [seekerProfile, setSeekerProfile] = useState<any>({
    headline: '', bio: '', skills: [], experience_years: 0,
    experience_level: 'fresher', current_location: '', location_lat: null, location_lng: null,
    preferred_job_types: [], expected_salary_min: '', expected_salary_max: '',
    resume_url: '', resume_filename: '', linkedin_url: '', portfolio_url: '',
    education: [], experience: [], is_open_to_work: true,
  })
  const [personalData, setPersonalData] = useState({
    full_name: '', phone: '', language_preference: 'en',
  })
  const [skillInput, setSkillInput] = useState('')
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (user) fetchProfile()
    else if (!user) router.push('/auth/login')
  }, [user])

  const fetchProfile = async () => {
    if (!user) return
    const [profileRes, spRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('seeker_profiles').select('*').eq('user_id', user.id).single(),
    ])
    if (profileRes.data) {
      setPersonalData({
        full_name: profileRes.data.full_name || '',
        phone: profileRes.data.phone || '',
        language_preference: profileRes.data.language_preference || 'en',
      })
    }
    if (spRes.data) {
      setSeekerProfile({
        ...spRes.data,
        education: spRes.data.education || [],
        experience: spRes.data.experience || [],
        skills: spRes.data.skills || [],
        preferred_job_types: spRes.data.preferred_job_types || [],
        expected_salary_min: spRes.data.expected_salary_min || '',
        expected_salary_max: spRes.data.expected_salary_max || '',
      })
    }
    setPageLoading(false)
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file || !user) return
    if (file.size > 5 * 1024 * 1024) return toast.error('File too large. Max 5MB.')
    setUploadingResume(true)
    const ext = file.name.split('.').pop()
    const path = `resumes/${user.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('resumes').upload(path, file, { upsert: true })
    if (error) {
      toast.error('Upload failed: ' + error.message)
    } else {
      const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(path)
      setSeekerProfile((prev: any) => ({
        ...prev,
        resume_url: publicUrl,
        resume_filename: file.name,
      }))
      toast.success('Resume uploaded! 📄')
    }
    setUploadingResume(false)
  }, [user])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
  })

  const handleLocate = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setSeekerProfile((prev: any) => ({
          ...prev,
          location_lat: pos.coords.latitude,
          location_lng: pos.coords.longitude,
        }))
        toast.success('Location detected!')
      },
      () => toast.error('Could not detect location')
    )
  }

  const addSkill = (skill: string) => {
    const s = skill || skillInput.trim()
    if (s && !seekerProfile.skills.includes(s)) {
      setSeekerProfile((prev: any) => ({ ...prev, skills: [...prev.skills, s] }))
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setSeekerProfile((prev: any) => ({ ...prev, skills: prev.skills.filter((s: string) => s !== skill) }))
  }

  const addEducation = () => {
    setSeekerProfile((prev: any) => ({
      ...prev,
      education: [...prev.education, {
        degree: '', institution: '', year_start: 2020, year_end: 2024, is_current: false, grade: ''
      }]
    }))
  }

  const updateEducation = (index: number, key: string, value: any) => {
    setSeekerProfile((prev: any) => {
      const edu = [...prev.education]
      edu[index] = { ...edu[index], [key]: value }
      return { ...prev, education: edu }
    })
  }

  const removeEducation = (index: number) => {
    setSeekerProfile((prev: any) => ({
      ...prev,
      education: prev.education.filter((_: any, i: number) => i !== index)
    }))
  }

  const addExperience = () => {
    setSeekerProfile((prev: any) => ({
      ...prev,
      experience: [...prev.experience, {
        title: '', company: '', location: '', year_start: 2022, month_start: 1,
        year_end: null, month_end: null, is_current: false, description: ''
      }]
    }))
  }

  const updateExperience = (index: number, key: string, value: any) => {
    setSeekerProfile((prev: any) => {
      const exp = [...prev.experience]
      exp[index] = { ...exp[index], [key]: value }
      return { ...prev, experience: exp }
    })
  }

  const removeExperience = (index: number) => {
    setSeekerProfile((prev: any) => ({
      ...prev,
      experience: prev.experience.filter((_: any, i: number) => i !== index)
    }))
  }

  const handleSave = async () => {
    if (!user) return
    setLoading(true)
    const [profileUpdate, spUpsert] = await Promise.all([
      supabase.from('profiles').update({
        full_name: personalData.full_name,
        phone: personalData.phone,
        language_preference: personalData.language_preference,
      }).eq('id', user.id),
      supabase.from('seeker_profiles').upsert({
        user_id: user.id,
        ...seekerProfile,
        expected_salary_min: seekerProfile.expected_salary_min ? parseInt(seekerProfile.expected_salary_min) : null,
        expected_salary_max: seekerProfile.expected_salary_max ? parseInt(seekerProfile.expected_salary_max) : null,
      }, { onConflict: 'user_id' }),
    ])
    if (profileUpdate.error || spUpsert.error) {
      toast.error('Failed to save profile')
    } else {
      await refreshProfile()
      toast.success('Profile saved! 🎉')
    }
    setLoading(false)
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'skills', label: 'Skills', icon: CheckCircle2 },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
  ]

  if (pageLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--bg-secondary)] pt-16">
        <div className="container-custom px-4 py-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">My Profile</h1>
              <p className="text-[var(--text-muted)] mt-1">Keep your profile updated to get better job matches</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-[var(--text-secondary)]">Open to Work</span>
                <div
                  onClick={() => setSeekerProfile((p: any) => ({ ...p, is_open_to_work: !p.is_open_to_work }))}
                  className={cn(
                    'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                    seekerProfile.is_open_to_work ? 'bg-green-500' : 'bg-[var(--border)]'
                  )}
                >
                  <div className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow',
                    seekerProfile.is_open_to_work ? 'left-6' : 'left-1'
                  )} />
                </div>
              </label>
              <button onClick={handleSave} disabled={loading} className="btn-primary">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Profile
              </button>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="card p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[var(--text-primary)]">Profile Completion</span>
              <span className="font-bold text-brand-yellow">{seekerProfile.profile_completion || 0}%</span>
            </div>
            <div className="h-3 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-yellow to-brand-yellow-dark rounded-full transition-all duration-500"
                style={{ width: `${seekerProfile.profile_completion || 0}%` }}
              />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Complete your profile to get 3x more views from employers
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-5">
            {/* Tabs */}
            <aside className="lg:w-52 flex-shrink-0">
              <div className="card p-2 lg:sticky lg:top-24">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      activeTab === id
                        ? 'bg-brand-yellow text-brand-black'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                    )}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </aside>

            {/* Tab Content */}
            <div className="flex-1 min-w-0">
              {/* Personal Info */}
              {activeTab === 'personal' && (
                <div className="card p-6 space-y-5">
                  <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Full Name *</label>
                      <input value={personalData.full_name}
                        onChange={(e) => setPersonalData(p => ({ ...p, full_name: e.target.value }))}
                        placeholder="Priya Ramesh" className="input" />
                    </div>
                    <div>
                      <label className="label">Mobile Number</label>
                      <input value={personalData.phone}
                        onChange={(e) => setPersonalData(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+91 9876543210" className="input" type="tel" />
                    </div>
                  </div>

                  <div>
                    <label className="label">Professional Headline</label>
                    <input value={seekerProfile.headline}
                      onChange={(e) => setSeekerProfile((p: any) => ({ ...p, headline: e.target.value }))}
                      placeholder="e.g. Experienced Sales Executive | 5+ Years | Coimbatore"
                      className="input" />
                  </div>

                  <div>
                    <label className="label">About Me</label>
                    <textarea value={seekerProfile.bio}
                      onChange={(e) => setSeekerProfile((p: any) => ({ ...p, bio: e.target.value }))}
                      rows={4} placeholder="Briefly describe yourself, your experience and career goals..."
                      className="input resize-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Current Location</label>
                      <div className="flex gap-2">
                        <select value={seekerProfile.current_location}
                          onChange={(e) => setSeekerProfile((p: any) => ({ ...p, current_location: e.target.value }))}
                          className="input flex-1">
                          <option value="">Select City</option>
                          {CITIES_TN.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                        <button onClick={handleLocate} className="btn-secondary px-3" title="Use GPS">
                          <Locate size={16} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="label">Years of Experience</label>
                      <input type="number" min={0} max={50}
                        value={seekerProfile.experience_years}
                        onChange={(e) => setSeekerProfile((p: any) => ({ ...p, experience_years: parseInt(e.target.value) || 0 }))}
                        className="input" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Expected Salary Min (₹/month)</label>
                      <input type="number" value={seekerProfile.expected_salary_min}
                        onChange={(e) => setSeekerProfile((p: any) => ({ ...p, expected_salary_min: e.target.value }))}
                        placeholder="15000" className="input" />
                    </div>
                    <div>
                      <label className="label">Expected Salary Max (₹/month)</label>
                      <input type="number" value={seekerProfile.expected_salary_max}
                        onChange={(e) => setSeekerProfile((p: any) => ({ ...p, expected_salary_max: e.target.value }))}
                        placeholder="25000" className="input" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">LinkedIn URL</label>
                      <div className="relative">
                        <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input value={seekerProfile.linkedin_url}
                          onChange={(e) => setSeekerProfile((p: any) => ({ ...p, linkedin_url: e.target.value }))}
                          placeholder="linkedin.com/in/yourname" className="input pl-9" />
                      </div>
                    </div>
                    <div>
                      <label className="label">Portfolio / Website</label>
                      <div className="relative">
                        <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input value={seekerProfile.portfolio_url}
                          onChange={(e) => setSeekerProfile((p: any) => ({ ...p, portfolio_url: e.target.value }))}
                          placeholder="yourwebsite.com" className="input pl-9" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label">Preferred Language</label>
                    <div className="flex gap-3">
                      {[{ id: 'en', label: '🇬🇧 English' }, { id: 'ta', label: '🇮🇳 Tamil' }].map(({ id, label }) => (
                        <button key={id} onClick={() => setPersonalData(p => ({ ...p, language_preference: id }))}
                          className={cn('flex-1 p-3 rounded-xl border-2 text-sm font-medium transition-all',
                            personalData.language_preference === id
                              ? 'border-brand-yellow bg-brand-yellow-light text-brand-yellow'
                              : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-brand-yellow/50'
                          )}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Skills */}
              {activeTab === 'skills' && (
                <div className="card p-6 space-y-5">
                  <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Skills & Expertise</h2>
                  <div>
                    <label className="label">Add Skills</label>
                    <div className="flex gap-2 mb-3">
                      <input value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill('') } }}
                        placeholder="Type a skill and press Enter or click Add"
                        className="input flex-1" />
                      <button onClick={() => addSkill('')} className="btn-primary px-4">
                        <Plus size={16} />
                      </button>
                    </div>
                    {seekerProfile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {seekerProfile.skills.map((skill: string) => (
                          <span key={skill} className="badge badge-yellow gap-2 py-1.5 px-3">
                            {skill}
                            <button onClick={() => removeSkill(skill)} className="hover:text-red-600">
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-[var(--text-muted)] mb-2">Suggested skills (click to add):</p>
                      <div className="flex flex-wrap gap-2">
                        {SKILLS_SUGGESTIONS.filter(s => !seekerProfile.skills.includes(s)).map(skill => (
                          <button key={skill} onClick={() => addSkill(skill)}
                            className="tag text-xs hover:bg-brand-yellow hover:text-brand-black hover:border-brand-yellow">
                            + {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label">Preferred Job Types</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['full_time', 'part_time', 'contract', 'internship', 'freelance'].map(type => (
                        <label key={type} className={cn(
                          'flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all capitalize',
                          seekerProfile.preferred_job_types?.includes(type)
                            ? 'border-brand-yellow bg-brand-yellow-light dark:bg-yellow-900/20'
                            : 'border-[var(--border)] hover:border-brand-yellow/50'
                        )}>
                          <div onClick={() => {
                            const types = seekerProfile.preferred_job_types || []
                            setSeekerProfile((p: any) => ({
                              ...p,
                              preferred_job_types: types.includes(type)
                                ? types.filter((t: string) => t !== type)
                                : [...types, type]
                            }))
                          }}
                            className={cn('w-4 h-4 rounded border-2 flex-shrink-0 transition-colors',
                              seekerProfile.preferred_job_types?.includes(type)
                                ? 'bg-brand-yellow border-brand-yellow'
                                : 'border-[var(--border-strong)]'
                            )} />
                          <span className="text-sm text-[var(--text-secondary)]">
                            {type.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Resume */}
              {activeTab === 'resume' && (
                <div className="card p-6 space-y-5">
                  <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Resume / CV</h2>
                  {seekerProfile.resume_url ? (
                    <div className="p-5 rounded-xl border-2 border-green-500/30 bg-green-50 dark:bg-green-900/20 flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                        <FileText size={22} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[var(--text-primary)]">{seekerProfile.resume_filename || 'Resume'}</p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">✓ Resume uploaded</p>
                      </div>
                      <div className="flex gap-2">
                        <a href={seekerProfile.resume_url} target="_blank" rel="noopener noreferrer"
                          className="btn-secondary py-2 px-3 text-sm">View</a>
                        <button
                          onClick={() => setSeekerProfile((p: any) => ({ ...p, resume_url: '', resume_filename: '' }))}
                          className="btn-ghost py-2 px-3 text-sm text-red-500">Remove</button>
                      </div>
                    </div>
                  ) : null}

                  <div
                    {...getRootProps()}
                    className={cn(
                      'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all',
                      isDragActive
                        ? 'border-brand-yellow bg-brand-yellow-light dark:bg-yellow-900/20'
                        : 'border-[var(--border)] hover:border-brand-yellow hover:bg-brand-yellow-light/50'
                    )}
                  >
                    <input {...getInputProps()} />
                    {uploadingResume ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 size={36} className="animate-spin text-brand-yellow" />
                        <p className="text-sm text-[var(--text-muted)]">Uploading resume...</p>
                      </div>
                    ) : (
                      <>
                        <Upload size={36} className="mx-auto text-brand-yellow mb-3" />
                        <p className="font-semibold text-[var(--text-primary)]">
                          {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                        </p>
                        <p className="text-sm text-[var(--text-muted)] mt-1">
                          or click to browse — PDF, DOC, DOCX (max 5MB)
                        </p>
                      </>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--bg-secondary)]">
                    <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-2">💡 Resume Tips</h3>
                    <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
                      <li>• Keep it to 1-2 pages</li>
                      <li>• Use simple, clean formatting</li>
                      <li>• Include your contact number</li>
                      <li>• List your relevant skills clearly</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Experience */}
              {activeTab === 'experience' && (
                <div className="card p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Work Experience</h2>
                    <button onClick={addExperience} className="btn-primary py-2 px-4 text-sm">
                      <Plus size={15} /> Add
                    </button>
                  </div>
                  {seekerProfile.experience.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-[var(--border)] rounded-2xl">
                      <Briefcase size={32} className="mx-auto text-[var(--text-muted)] mb-3" />
                      <p className="text-[var(--text-muted)]">No experience added yet</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Freshers can skip this section</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {seekerProfile.experience.map((exp: any, i: number) => (
                        <div key={i} className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="badge badge-blue">Experience {i + 1}</span>
                            <button onClick={() => removeExperience(i)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg">
                              <X size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="label">Job Title *</label>
                              <input value={exp.title} onChange={(e) => updateExperience(i, 'title', e.target.value)}
                                placeholder="Sales Executive" className="input" />
                            </div>
                            <div>
                              <label className="label">Company *</label>
                              <input value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)}
                                placeholder="Company Name" className="input" />
                            </div>
                            <div>
                              <label className="label">Start Year</label>
                              <input type="number" value={exp.year_start}
                                onChange={(e) => updateExperience(i, 'year_start', parseInt(e.target.value))}
                                min={1990} max={2030} className="input" />
                            </div>
                            <div>
                              <label className="label">End Year</label>
                              <input type="number" value={exp.year_end || ''}
                                onChange={(e) => updateExperience(i, 'year_end', parseInt(e.target.value) || null)}
                                min={1990} max={2030} placeholder="Leave blank if current"
                                className="input" disabled={exp.is_current} />
                            </div>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <div onClick={() => updateExperience(i, 'is_current', !exp.is_current)}
                              className={cn('w-4 h-4 rounded border-2 transition-colors',
                                exp.is_current ? 'bg-brand-yellow border-brand-yellow' : 'border-[var(--border-strong)]'
                              )} />
                            <span className="text-sm text-[var(--text-secondary)]">Currently working here</span>
                          </label>
                          <div>
                            <label className="label">Description</label>
                            <textarea value={exp.description} rows={2}
                              onChange={(e) => updateExperience(i, 'description', e.target.value)}
                              placeholder="Brief description of responsibilities..." className="input resize-none" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Education */}
              {activeTab === 'education' && (
                <div className="card p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Education</h2>
                    <button onClick={addEducation} className="btn-primary py-2 px-4 text-sm">
                      <Plus size={15} /> Add
                    </button>
                  </div>
                  {seekerProfile.education.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-[var(--border)] rounded-2xl">
                      <GraduationCap size={32} className="mx-auto text-[var(--text-muted)] mb-3" />
                      <p className="text-[var(--text-muted)]">No education added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {seekerProfile.education.map((edu: any, i: number) => (
                        <div key={i} className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="badge badge-yellow">Education {i + 1}</span>
                            <button onClick={() => removeEducation(i)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg">
                              <X size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="label">Degree / Qualification *</label>
                              <input value={edu.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                                placeholder="B.E. Computer Science" className="input" />
                            </div>
                            <div>
                              <label className="label">Institution *</label>
                              <input value={edu.institution} onChange={(e) => updateEducation(i, 'institution', e.target.value)}
                                placeholder="PSG College of Technology" className="input" />
                            </div>
                            <div>
                              <label className="label">Start Year</label>
                              <input type="number" value={edu.year_start}
                                onChange={(e) => updateEducation(i, 'year_start', parseInt(e.target.value))}
                                min={1990} max={2030} className="input" />
                            </div>
                            <div>
                              <label className="label">End Year</label>
                              <input type="number" value={edu.year_end || ''}
                                onChange={(e) => updateEducation(i, 'year_end', parseInt(e.target.value) || null)}
                                min={1990} max={2030} placeholder="Leave blank if ongoing"
                                className="input" />
                            </div>
                            <div>
                              <label className="label">Grade / Percentage</label>
                              <input value={edu.grade} onChange={(e) => updateEducation(i, 'grade', e.target.value)}
                                placeholder="8.5 CGPA / 85%" className="input" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end mt-5">
                <button onClick={handleSave} disabled={loading} className="btn-primary px-8">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save All Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
