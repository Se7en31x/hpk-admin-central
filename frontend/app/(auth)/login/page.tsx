'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  LogIn
} from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    // พื้นหลังสีเทาอ่อน เรียบ คลีน ไม่กวนสายตา
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans selection:bg-[#0094d4]/30 selection:text-[#00529a] relative">
      
      {/* ปุ่มกลับหน้าหลัก เรียบๆ ชัดเจน */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/departments" className="flex items-center gap-2 text-slate-500 hover:text-[#00529a] transition-colors text-sm font-bold bg-white py-2 px-4 rounded-full border border-slate-200 shadow-sm">
          <ArrowLeft className="w-4 h-4" />
          กลับสู่หน้าหลัก
        </Link>
      </div>

      {/* ===================== กล่อง Login ทึบและชัดเจน ===================== */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8 sm:p-10 relative z-10">
        
        {/* พื้นที่ใส่โลโก้ */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-20 w-20 items-center justify-center mb-5 rounded-2xl overflow-hidden border border-slate-100 bg-white">
            <Image 
              src="/logo/logoHPK2.png" 
              alt="โลโก้โรงพยาบาลวัดห้วยปลากั้ง" 
              width={80} 
              height={80} 
              className="w-full h-full object-contain p-2"
              priority 
            />
          </div>
          
          <h1 className="text-2xl font-black tracking-tight text-[#00529a] mb-1">
            เข้าสู่ระบบ
          </h1>
          <p className="text-sm font-medium text-[#0094d4]">
            โรงพยาบาลวัดห้วยปลากั้งเพื่อสังคม
          </p>
        </div>

        {/* ฟอร์มเข้าสู่ระบบ */}
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          
          {/* Input: Username - ใช้สีทึบ bg-slate-50 ขอบชัดเจน */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">ชื่อผู้ใช้งาน (Username)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0094d4] transition-colors">
                <User className="h-5 w-5" />
              </div>
              <input 
                type="text" 
                placeholder="ระบุชื่อผู้ใช้งาน"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0094d4]/20 focus:border-[#0094d4] transition-all"
                required
              />
            </div>
          </div>

          {/* Input: Password - ใช้สีทึบ bg-slate-50 ขอบชัดเจน */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-bold text-slate-700">รหัสผ่าน</label>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0094d4] transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0094d4]/20 focus:border-[#0094d4] transition-all"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#0094d4] transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button (คงความสวยงามด้วยสีธีมองค์กร) */}
          <div className="pt-4">
            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-[#00529a] to-[#0094d4] hover:from-[#00427a] hover:to-[#0082bc] text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              <LogIn className="w-5 h-5" />
              เข้าสู่ระบบ
            </button>
          </div>
          
        </form>

      </div>
    </div>
  );
}