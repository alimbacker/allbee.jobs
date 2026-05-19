'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Loader2, Upload, Save, Building2, MapPin, Globe, Phone, Mail, Locate } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { CITIES_TN, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const INDUSTRIES = [
  'Information Technology', 'Manufacturing', 'Retail & Trading', 'Education',
  'Healthcare', 'Construction', 'Hospitality & Food', 'Textiles & Garments',
  'Finance & Banking', 'Transport & Logistics', 'Agriculture', 'Media & Entertainment',
  'Real Estate', 'Automobile', 'E-commerce', 'Pharmaceutical', 'Other',
]

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

export default function EmployerProfilePage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', industry: '', company_size: '',
    founded_year: '', website: '', email: '', phone: '',
    address: '', city: '', pincode: '', logo_url: '',
    location_lat: '', location_lng: '',
  })
  const [existing, setExisting] = useState<any>(null)

  useEffect(() => {
    if (user) fetchCompany()
  }, [user])

  const fetchCompany = async () => {
    const { data } = await supabase.from('companies').select('*').eq('owner_id', user!.id).single()
    if (data) {
      setExisting(data)
      setForm({
        name: data.name || '', description: data.description || '',
        industry: data.industry || '', company_size: data.company_size || '',
        founded_year: data.founded_year?.toString() || '', website: data.website || '',
        email: data.email || '', phone: data.phone || '', address: data.address || '',
        city: data.city || '', pincode: data.pincode || '', logo_url: data.logo_url || '',
        location_lat: data.location_lat?.toString() || '',
        location_lng: data.location_lng?.toString() || '',
      })
    }
  }

  const onLogoDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file || !user) return
    setUploadingLogo(true)
    const path = `logos/${user.id}/${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('company-assets').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('company-assets').getPublicUrl(path)
      setForm(p => ({ ...p, logo_url: publicUrl }))
      toast.success('Logo uploaded!')
    }
    setUploadingLogo(false)
  }, [user])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onLogoDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
  })

  const handleLocate = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setForm(p => ({
          ...p,
          location_lat: pos.coords.latitude.toString(),
          location_lng: pos.coords.longitude.toString(),
        }))
        toast.success('Location captured!')
      },
      () => toast.error('Could not get location')
    )
  }

  const handleSave = async () => {
    if (!form.name || !form.city) return toast.error('Company name and city are required')
    setLoading(true)
    const slug = form.name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-')
    const payload = {
      owner_id: user!.id,
      name: form.name,
      slug: existing ? existing.slug : `${slug}-${Date.now()}`,
      description: form.description,
      industry: form.industry,
      company_size: form.company_size,
      founded_year: form.founded_year ? parseInt(form.founded_year) : null,
      website: form.website,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      pincode: form.pincode,
      logo_url: form.logo_url,
      location_lat: form.location_lat ? parseFloat(form.location_lat) : null,
      location_lng: form.location_lng ? parseFloat(form.location_lng) : null,
    }
    const { error } = existing
      ? await supabase.from('companies').update(payload).eq('id', existing.id)
      : await supabase.from('companies').insert(payload)
    if (error) toast.error(error.message)
    else toast.success('Company profile saved! 🏢')
    setLoading(false)
  }

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--bg-secondary)] pt-16">
        <div className="container-custom px-4 py-8 max-w-3xl">
          <div className="mb-6">
            <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">Company Profile</h1>
            <p className="text-[var(--text-muted)] mt-1">
              {existing ? 'Update your company information' : 'Set up your company profile to start posting jobs'}
            </p>
          </div>

          <div className="space-y-5">
            {/* Logo Upload */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg text-[var(--text-primary)] mb-4">Company Logo</h2>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-secondary)]
                  flex items-center justify-center overflow-hidden flex-shrink-0">
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={32} className="text-[var(--text-muted)]" />
                  )}
                </div>
                <div
                  {...getRootProps()}
                  className={cn(
                    'flex-1 border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all',
                    isDragActive ? 'border-brand-yellow bg-brand-yellow-light' : 'border-[var(--border)] hover:border-brand-yellow'
                  )}
                >
                  <input {...getInputProps()} />
                  {uploadingLogo ? (
                    <Loader2 size={20} className="animate-spin text-brand-yellow mx-auto" />
                  ) : (
                    <>
                      <Upload size={20} className="text-brand-yellow mx-auto mb-1" />
                      <p className="text-sm text-[var(--text-muted)]">Upload logo (JPG, PNG)</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="card p-6 space-y-4">
              <h2 className="font-display font-bold text-lg text-[var(--text-primary)]">Basic Information</h2>
              <div>
                <label className="label">Company Name *</label>
                <input value={form.name} onChange={(e) => update('name', e.target.value)}
                  placeholder="AllBee Solutions Pvt Ltd" className="input" required />
              </div>
              <div>
                <label className="label">About Company</label>
                <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
                  rows={4} placeholder="Describe what your company does, your culture, and what makes you a great place to work..."
                  className="input resize-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Industry</label>
                  <select value={form.industry} onChange={(e) => update('industry', e.target.value)} className="input">
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Company Size</label>
                  <select value={form.company_size} onChange={(e) => update('company_size', e.target.value)} className="input">
                    <option value="">Select Size</option>
                    {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Founded Year</label>
                  <input type="number" value={form.founded_year} onChange={(e) => update('founded_year', e.target.value)}
                    placeholder="2010" min={1900} max={new Date().getFullYear()} className="input" />
                </div>
                <div>
                  <label className="label">Website</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input value={form.website} onChange={(e) => update('website', e.target.value)}
                      placeholder="https://yourcompany.com" className="input pl-9" />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="card p-6 space-y-4">
              <h2 className="font-display font-bold text-lg text-[var(--text-primary)]">Contact Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                      placeholder="hr@company.com" className="input pl-9" />
                  </div>
                </div>
                <div>
                  <label className="label">Phone / WhatsApp</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
                      placeholder="+91 9876543210" className="input pl-9" />
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="card p-6 space-y-4">
              <h2 className="font-display font-bold text-lg text-[var(--text-primary)]">Location</h2>
              <div>
                <label className="label">Address</label>
                <input value={form.address} onChange={(e) => update('address', e.target.value)}
                  placeholder="123, Main Street, RS Puram" className="input" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="label">City *</label>
                  <select value={form.city} onChange={(e) => update('city', e.target.value)} className="input" required>
                    <option value="">Select City</option>
                    {CITIES_TN.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Pincode</label>
                  <input value={form.pincode} onChange={(e) => update('pincode', e.target.value)}
                    placeholder="641001" maxLength={6} className="input" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleLocate} className="btn-secondary py-2.5 px-4 text-sm gap-2">
                  <Locate size={16} /> Detect GPS Location
                </button>
                {form.location_lat && (
                  <span className="text-xs text-green-500">
                    ✓ GPS: {parseFloat(form.location_lat).toFixed(4)}, {parseFloat(form.location_lng).toFixed(4)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={handleSave} disabled={loading} className="btn-primary px-8 py-3.5 text-base">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {existing ? 'Update Profile' : 'Create Company Profile'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
