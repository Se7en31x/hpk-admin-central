import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development' || request.nextUrl.hostname === 'localhost' || request.nextUrl.hostname === '127.0.0.1';

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
          // 1. เพิ่ม domain เข้าไปใน options เพื่อให้แชร์ข้าม Sub-domain ได้
          const extendedOptions = { ...options };
          if (!isDev) {
            extendedOptions.domain = ".hpk-hms.site";
          }
          
          request.cookies.set({ name, value, ...extendedOptions })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...extendedOptions })
        },
        remove(name: string, options: CookieOptions) {
          // 2. ทำเหมือนกันตอนลบคุกกี้
          const extendedOptions = { ...options };
          if (!isDev) {
            extendedOptions.domain = ".hpk-hms.site";
          }

          request.cookies.set({ name, value: '', ...extendedOptions })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...extendedOptions })
        },
      },
    }
  )

  // ใช้ getUser() แทน getSession() เพื่อความปลอดภัยสูงสุด (เช็คกับ Server จริง)
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // 3. ปรับ Logic การ Redirect กลับหน้าหลัก (hpk-hms.site)
  if (!user && !pathname.startsWith('/login') && pathname !== '/') {
    const redirectUrl = isDev 
      ? new URL('/login', request.url) 
      : new URL('https://hpk-hms.site/login', request.url);
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}