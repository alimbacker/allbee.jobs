import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://allbee.jobs'
  const supabase = createAdminClient()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, updated_at')
    .eq('status', 'active')
    .limit(500)

  const { data: companies } = await supabase
    .from('companies')
    .select('id, updated_at')
    .limit(200)

  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/jobs', changefreq: 'hourly', priority: '0.9' },
    { url: '/companies', changefreq: 'daily', priority: '0.8' },
    { url: '/auth/login', changefreq: 'monthly', priority: '0.5' },
    { url: '/auth/register', changefreq: 'monthly', priority: '0.6' },
    { url: '/about', changefreq: 'monthly', priority: '0.4' },
    { url: '/contact', changefreq: 'monthly', priority: '0.4' },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(({ url, changefreq, priority }) => `
  <url>
    <loc>${baseUrl}${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`).join('')}

  ${(jobs || []).map((job: { id: string; updated_at: string }) => `
  <url>
    <loc>${baseUrl}/jobs/${job.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${job.updated_at}</lastmod>
  </url>`).join('')}

  ${(companies || []).map((company: { id: string; updated_at: string }) => `
  <url>
    <loc>${baseUrl}/companies/${company.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
    <lastmod>${company.updated_at}</lastmod>
  </url>`).join('')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
