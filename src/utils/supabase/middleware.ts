import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const protectedPaths = [
    '/dashboard',
    '/exams',
    '/account',
    '/results',
    '/payment',
    '/admin',
  ]

  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path)) || request.nextUrl.pathname.startsWith('/exam/')
  const isOnboardingPath = request.nextUrl.pathname.startsWith('/onboarding')
  const isApiProfilePath = request.nextUrl.pathname === '/api/profiles/create'

  if (user) {
    const isAdmin = user.email === process.env.ADMIN_EMAIL;

    if (isAdmin) {
      // If admin attempts to access any protected or onboarding path outside /admin, redirect to /admin
      if ((isProtectedPath || isOnboardingPath) && !request.nextUrl.pathname.startsWith('/admin')) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }
    } else {
      // Protect /admin from non-admin users
      if (request.nextUrl.pathname.startsWith('/admin')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }

      // Check onboarding status for regular users
      if (isProtectedPath) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('discipline')
          .eq('id', user.id)
          .single()

        if (!profile || !profile.discipline) {
          const url = request.nextUrl.clone()
          url.pathname = '/onboarding/discipline'
          return NextResponse.redirect(url)
        }
      }
    }
  } else if (isProtectedPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/signup'
    return NextResponse.redirect(url)
  }

  return response
}
