import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files, API routes, and special Next.js paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Files with extensions (images, etc.)
  ) {
    return NextResponse.next()
  }

  // Extract brandSlug from pathname (first segment after /)
  const pathSegments = pathname.split('/').filter(Boolean)

  // If no path segments, redirect to a default brand or show brand selector
  if (pathSegments.length === 0) {
    // For now, redirect to /jumun (default brand)
    // In production, you might show a brand selector page
    return NextResponse.redirect(new URL('/jumun', request.url))
  }

  const brandSlug = pathSegments[0]

  // Validate that the brand exists in the database
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: brand, error } = await supabase
      .from('brands')
      .select('id, slug, name')
      .eq('slug', brandSlug)
      .single()

    // If brand doesn't exist, return 404 or redirect
    if (error || !brand) {
      // Return 404 response
      return new NextResponse(
        JSON.stringify({
          error: 'Brand not found',
          brandSlug,
          message: `The brand "${brandSlug}" does not exist.`
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Brand exists, add brand info to request headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-brand-id', brand.id)
    requestHeaders.set('x-brand-slug', brand.slug)
    requestHeaders.set('x-brand-name', brand.name)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error('Middleware error:', error)

    // On error, allow request to proceed but log the issue
    // This prevents the entire site from breaking if DB is down
    return NextResponse.next()
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
}
