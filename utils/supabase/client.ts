import { createBrowserClient } from '@supabase/ssr'

// utils/supabase/client.ts
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true, 
        autoRefreshToken: true,   
      },
      // --- เพิ่มส่วนนี้เข้าไปครับ ---
      cookieOptions: {
        domain: ".hpk-hms.site", 
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production", // ใช้ true บน Vercel
      },
    }
  )