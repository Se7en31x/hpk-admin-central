import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set(name, value)
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set(name, '')
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set(name, '', options)
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = request.nextUrl

  if (session) {
    const loginTime = new Date(session.user.last_sign_in_at!).getTime()
    const isExpired = Date.now() - loginTime > 12 * 60 * 60 * 1000

    if (isExpired) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  const isPublicPage = pathname.startsWith('/login') || pathname === '/'

  if (!session && !isPublicPage) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}