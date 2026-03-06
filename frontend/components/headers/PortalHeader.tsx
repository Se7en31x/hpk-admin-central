import React from 'react';
import { Shield, HelpCircle, Menu } from 'lucide-react';
import Link from 'next/link';

export default function PortalHeader() {
  return (
    // ใช้สีขาวโปร่งแสง (White/80) ดูสะอาดและทันสมัย
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-colors duration-300">
      <div className="w-full px-6 lg:px-12 h-20 flex items-center justify-between">
        
        {/* ฝั่งซ้าย: โลโก้ และ ชื่อ */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-10 h-10 bg-emerald-600 flex items-center justify-center rounded-xl shadow-sm group-hover:bg-emerald-500 transition-colors">
            <span className="text-white font-black text-lg tracking-tighter">HPK</span>
          </div>
          
          <div className="hidden sm:flex sm:flex-col justify-center">
            <h1 className="text-lg font-bold text-slate-900 tracking-wide uppercase leading-tight">
              โรงพยาบาลวัดห้วยปลากั้ง
            </h1>
            <p className="text-[10px] text-emerald-600 font-bold tracking-[0.2em] uppercase mt-0.5">
              Central Portal
            </p>
          </div>
        </Link>

        {/* ฝั่งขวา: เมนู และ ปุ่ม Action */}
        <div className="flex items-center gap-6">
          <button className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span>ศูนย์ช่วยเหลือ</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200 hidden md:block"></div>

          {/* ปุ่มผู้ดูแลระบบ (เน้นสีเขียวเพื่อความน่าเชื่อถือ) */}
          <Link href="/admin-management">
            <button className="hidden md:flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-emerald-600 rounded-full transition-all duration-300 shadow-sm active:scale-95">
              <Shield className="w-4 h-4" />
              <span>ผู้ดูแลระบบ</span>
            </button>
          </Link>
          
          <button className="md:hidden p-2 text-slate-600 hover:text-emerald-600 transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}