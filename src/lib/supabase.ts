import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import { createServerClient, type CookieOptions } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          phone: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'seeker' | 'employer' | 'admin'
          language_preference: string
          is_verified: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      jobs: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string
          job_type: string
          salary_min: number | null
          salary_max: number | null
          location: string
          location_lat: number | null
          location_lng: number | null
          status: string
          views_count: number
          applications_count: number
          is_featured: boolean
          created_at: string
        }
      }
      applications: {
        Row: {
          id: string
          job_id: string
          seeker_id: string
          company_id: string
          status: string
          created_at: string
        }
      }
      companies: {
        Row: {
          id: string
          owner_id: string
          name: string
          logo_url: string | null
          city: string
          is_verified: boolean
          created_at: string
        }
      }
    }
  }
}

// Browser client (for client components)
export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Server client (for server components / API routes)
export const createServerSupabaseClient = () => {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {}
        },
      },
    }
  )
}

// Admin client (server-side only, with service role)
export const createAdminClient = () => {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
