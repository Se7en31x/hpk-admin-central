import React from 'react';
import { ShieldCheck, Bell, User, Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminHeader() {
  return (
    <nav className="sticky top-0 z-50 bg-slate-900 text-white shadow-xl">
      <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Admin Branding */}
        <div className="flex items-center gap-6">
          <Link href="/departments" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> กลับหน้า Portal
          </Link>
          <div className="h-6 w-[1px] bg-slate-700"></div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-blue-400 w-6 h-6" />
            <span className="font-bold tracking-tight">Admin Management</span>
          </div>
        </div>

        {/* Admin Tools */}
        <div className="flex items-center gap-6">
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">Administrator</p>
              <p className="text-[10px] text-slate-400">it.admin@hpk.com</p>
            </div>
            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center font-bold text-sm shadow-inner">
              AD
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}