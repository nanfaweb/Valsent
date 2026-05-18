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
    // If user is logged in, check if they have a profile/discipline
    // We only need to check this if they are accessing a protected path OR if they are just logging in (e.g. valid session)
    // Avoid blocking APIS or assets

    // Performance optimization: Maybe only check on protected paths?
    // But requirement says: "If a logged-in user ... redirect them to an onboarding ... and force selection before allowing access to protected app pages"
    // Also: "Google OAuth users ... redirected to /onboarding/discipline"

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
  } else if (isProtectedPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/signup'
    return NextResponse.redirect(url)
  }

  return response
}
