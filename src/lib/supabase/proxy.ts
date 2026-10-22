import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value))
        },
      },
    },
  )

  // Supabase's SSR guidance recommends validating/refreshing claims in Proxy.
  const { error } = await supabase.auth.getClaims()

  if (isMissingRefreshToken(error)) {
    request.cookies
      .getAll()
      .filter(({ name }) => name.startsWith('sb-') && name.includes('-auth-token'))
      .forEach(({ name }) => {
        request.cookies.delete(name)
        response.cookies.set(name, '', { maxAge: 0, path: '/' })
      })
  }

  return response
}

function isMissingRefreshToken(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const authError = error as { code?: unknown; message?: unknown }
  return authError.code === 'refresh_token_not_found'
    || (typeof authError.message === 'string' && authError.message.includes('Refresh Token Not Found'))
}
