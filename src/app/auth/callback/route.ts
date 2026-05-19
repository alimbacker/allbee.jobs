import { createServerSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const role = requestUrl.searchParams.get('role') || 'seeker'

  if (code) {
    const supabase = createServerSupabaseClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    if (data.user) {
      // Update role if provided during registration
      await supabase
        .from('profiles')
        .update({ role: role as 'seeker' | 'employer' })
        .eq('id', data.user.id)
        .is('role', null)
    }
  }

  // Redirect to dashboard based on role
  const dashboardUrl = role === 'employer'
    ? `${requestUrl.origin}/employer/dashboard`
    : `${requestUrl.origin}/seeker/dashboard`

  return NextResponse.redirect(dashboardUrl)
}
