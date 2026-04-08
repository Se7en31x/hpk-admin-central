'use client';

import Image from "next/image";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AdminNavbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <header className="w-full bg-[#1e1b4b] text-white shadow-xl relative z-[50]">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center">
            <Image src="https://res.cloudinary.com/dgoxbpj1j/image/upload/v1773921237/logo-removebg-preview_frzye8.png" 
                   alt="Logo" width={48} height={48} className="object-contain" />
          </div>
          <div className="flex flex-col leading-none">
            <h1 className="text-sm font-bold text-white/90">โรงพยาบาลวัดห้วยปลากั้งเพื่อสังคม</h1>
            <span className="text-xs font-medium text-indigo-300 mt-1 uppercase tracking-wider">System Administration</span>
          </div>
        </div>

        <div className="relative">
          <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 p-1.5 hover:bg-white/10 rounded-full transition-all">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">Admin Center</p>
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-tighter">Super Admin</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-white/20">A</div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden text-slate-700">
              <button className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-slate-50 transition-colors">
                <User className="w-4 h-4 text-indigo-600" /> โปรไฟล์
              </button>
              <div className="h-[1px] bg-slate-100"></div>
              <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold">
                <LogOut className="w-4 h-4" /> ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}