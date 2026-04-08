import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set(name, value)
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set(name, '')
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set(name, '', options)
        },
      },
    }
  )

  // 1. ตรวจสอบ Session จาก Cookies
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // 2. กำหนดเงื่อนไข "หน้าสาธารณะ" (Public Pages) 
  // - หน้า Login (/login)
  // - หน้าแรกของ Portal (/)
  const isLoginPage = pathname.startsWith('/login')
  const isRootPage = pathname === '/'

  // 🚩 Logic: ถ้าไม่มี Session และไม่ใช่หน้าสาธารณะ -> ให้ดีดไปหน้า Login
  if (!session && !isLoginPage && !isRootPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // พ่วง URL เดิมไปด้วย เผื่อ Login เสร็จแล้วอยากให้วาร์ปกลับมาที่เดิม
    url.searchParams.set('next', pathname) 
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * ดักทุกหน้ายกเว้น:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo (โฟลเดอร์เก็บโลโก้ของคุณ)
     * - ไฟล์นามสกุลรูปภาพต่างๆ (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|logo|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}