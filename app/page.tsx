'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import {
  Package, Pill, ArrowRightLeft, HeartHandshake, ShieldCheck,
  Shield, ArrowRight, Stethoscope, Activity,
  MapPin, Globe, Phone, Mail, Facebook, LogOut, Settings, ChevronDown, Code
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

/* ======================= SSO CONFIG ======================= */
const CLIENTS = {
  PORTAL: { baseUrl: process.env.NEXT_PUBLIC_URL_ADMIN }, // 3000
  WAREHOUSE: { baseUrl: process.env.NEXT_PUBLIC_URL_WAREHOUSE || "https://warehouse.hpk-hms.site/" }, // 3001
  WAREHOUSE_DEV: { baseUrl: process.env.NEXT_PUBLIC_URL_WAREHOUSE_DEV || "https://warehouse-dev.hpk-hms.site/" }, // สำหรับเพื่อน
  WAREHOUSE_DEV2: { baseUrl: process.env.NEXT_PUBLIC_URL_WAREHOUSE_DEV2 || "https://warehouse-dev-2.hpk-hms.site/" }, // สำหรับเพื่อน
  DISPENSE: { baseUrl: process.env.NEXT_PUBLIC_URL_DISPENSE || "https://dispense.hpk-hms.site/" }, // 3002
  CHEEWABHIBALN: { baseUrl: process.env.NEXT_PUBLIC_URL_CHEEWABHIBALN || "https://palliative.hpk-hms.site/" } // 3005
};

type ClientConfig = { baseUrl: string | undefined };
type SystemConfig = { client: ClientConfig; path: string };

const SYSTEMS_MAP: Record<string, SystemConfig> = {
  "Administration": { client: CLIENTS.PORTAL, path: "/admin" },
  "Warehouse": { client: CLIENTS.WAREHOUSE, path: "/warehouse" },
  "Warehouse-Dev": { client: CLIENTS.WAREHOUSE_DEV, path: "/warehouse" },
  "Warehouse-Dev2": { client: CLIENTS.WAREHOUSE_DEV2, path: "/warehouse" },
  "Borrow-Return": { client: CLIENTS.WAREHOUSE, path: "/request" },
  "Pharmacy": { client: CLIENTS.DISPENSE, path: "/dispense" },
  "Palliative": { client: CLIENTS.CHEEWABHIBALN, path: "/" },
  "OPD": { client: CLIENTS.PORTAL, path: "/opd-dashboard" },
  "Dental": { client: CLIENTS.PORTAL, path: "/dental-clinic" },
};

/* ======================= UI DATA ======================= */
const departments = [
  { label: 'ผู้ป่วยนอก (OPD)', department_code: '01', system_name: 'OPD', icon: Stethoscope, description: 'ระบบจัดการข้อมูล คัดกรอง ตรวจรักษา และส่งต่อผู้ป่วยนอก', accent: 'amber' },
  { label: 'ทันตกรรม', department_code: '02', system_name: 'Dental', icon: Activity, description: 'ระบบจัดการคลินิกทันตกรรม ประวัติการรักษา และการนัดหมาย', accent: 'rose' },
  { label: 'ชีวาภิบาล', department_code: '03', system_name: 'Palliative', icon: HeartHandshake, description: 'ดูแลและจัดการข้อมูลผู้ป่วยระยะท้ายแบบประคับประคอง', accent: 'indigo' },
  { label: 'จ่ายยาและคลังยาย่อย', department_code: '04', system_name: 'Pharmacy', icon: Pill, description: 'จัดการคลังยาย่อยและระบบการจ่ายยาให้ผู้ป่วย', accent: 'teal' },
  { label: 'คลังหลัก', department_code: '05', system_name: 'Warehouse', icon: Package, description: 'บริหารจัดการสต็อกเวชภัณฑ์และอุปกรณ์การแพทย์ส่วนกลาง', accent: 'emerald' },
  { label: 'คลังหลัก (Development)', department_code: '05-DEV', system_name: 'Warehouse-Dev', icon: Code, description: 'ระบบคลังสินค้าสำหรับพัฒนา (เครื่องเพื่อน/Cloudflare Tunnel)', accent: 'sky' },
  { label: 'คลังหลัก (Development 2)', department_code: '05-DEV2', system_name: 'Warehouse-Dev2', icon: Code, description: 'ระบบคลังสินค้าสำหรับพัฒนา (สำรอง)', accent: 'sky' },
  { label: 'เบิกยืมคืน', department_code: '06', system_name: 'Borrow-Return', icon: ArrowRightLeft, description: 'บันทึกและติดตามการเบิก ยืม หรือคืนอุปกรณ์ต่างๆ อย่างเป็นระบบ', accent: 'sky' },
  { label: 'ผู้ดูแลระบบ (Admin)', department_code: '99', system_name: 'Administration', icon: Settings, description: 'จัดการสิทธิ์การเข้าใช้งานและตั้งค่าระบบสารสนเทศส่วนกลาง', accent: 'slate' },
];

type AccentStyle = {
  border: string;
  text: string;
  iconBg: string;
  iconText: string;
  badgeBg: string;
  badgeText: string;
  btnBg: string;
  btnBorder: string;
};

const accentMap: Record<string, AccentStyle> = {
  sky: { border: 'border-slate-200 hover:border-[#0094d4]', text: 'text-[#00529a]', iconBg: 'bg-sky-50', iconText: 'text-sky-600', badgeBg: 'bg-sky-100', badgeText: 'text-sky-700', btnBg: 'bg-white', btnBorder: 'border-slate-200' },
  teal: { border: 'border-slate-200 hover:border-[#0094d4]', text: 'text-[#00529a]', iconBg: 'bg-teal-50', iconText: 'text-teal-600', badgeBg: 'bg-teal-100', badgeText: 'text-teal-700', btnBg: 'bg-white', btnBorder: 'border-slate-200' },
  amber: { border: 'border-slate-200 hover:border-[#0094d4]', text: 'text-[#00529a]', iconBg: 'bg-amber-50', iconText: 'text-amber-600', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700', btnBg: 'bg-white', btnBorder: 'border-slate-200' },
  indigo: { border: 'border-slate-200 hover:border-[#0094d4]', text: 'text-[#00529a]', iconBg: 'bg-indigo-50', iconText: 'text-indigo-600', badgeBg: 'bg-indigo-100', badgeText: 'text-indigo-700', btnBg: 'bg-white', btnBorder: 'border-slate-200' },
  emerald: { border: 'border-slate-200 hover:border-[#0094d4]', text: 'text-[#00529a]', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', btnBg: 'bg-white', btnBorder: 'border-slate-200' },
  rose: { border: 'border-slate-200 hover:border-[#0094d4]', text: 'text-[#00529a]', iconBg: 'bg-rose-50', iconText: 'text-rose-600', badgeBg: 'bg-rose-100', badgeText: 'text-rose-700', btnBg: 'bg-white', btnBorder: 'border-slate-200' },
  slate: { border: 'border-slate-200 hover:border-[#0094d4]', text: 'text-[#00529a]', iconBg: 'bg-slate-100', iconText: 'text-slate-600', badgeBg: 'bg-slate-200', badgeText: 'text-slate-700', btnBg: 'bg-white', btnBorder: 'border-slate-200' },
};

export default function UnifiedPortal() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
    };
    fetchSession();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    router.push('/auth/login');
    router.refresh();
  };

  const handleDepartmentAction = async (systemName: string, deptCode: string) => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();

    if (!currentSession) {
      router.push(`/auth/login`);
      return;
    }

    try {
      const userMeta = currentSession.user.app_metadata;
      const userAllowedSystems = userMeta?.systems || [];

      // เช็คสิทธิ์แบบรองรับ Object จาก Database
      const hasPermission = userAllowedSystems.some((sys: any) => {
        const nameInDb = typeof sys === 'string' ? sys : sys?.name;
        
        // ให้สิทธิ์เข้า Dev ได้ถ้ามีสิทธิ์ Warehouse หรือ Administration
        if ((systemName === 'Warehouse-Dev' || systemName === 'Warehouse-Dev2') && (nameInDb === 'Warehouse' || nameInDb === 'Administration')) {
          return true;
        }
        
        return nameInDb === 'Administration' || nameInDb === systemName;
      });

      if (hasPermission) {
        const config = SYSTEMS_MAP[systemName];

        if (!config) return;

        const baseUrl = config.client.baseUrl || '';

        if (!baseUrl) {
          alert(`❌ ไม่พบ URL สำหรับระบบ ${systemName} กรุณาตั้งค่า Environment Variable`);
          return;
        }

        const targetUrl = `${baseUrl.replace(/\/$/, '')}${config.path}`;
        window.location.assign(targetUrl);
      } else {
        alert(`❌ ขออภัย คุณไม่มีสิทธิ์เข้าใช้งานระบบ ${systemName}\nกรุณาติดต่อผู้ดูแลระบบ`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const displayName = session?.user?.app_metadata?.full_name || session?.user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#0094d4]/30 selection:text-[#00529a]">

      {/* HERO SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#00529a] to-[#0094d4] pt-0 pb-36">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:40px_40px]" />

        <nav className="relative z-50 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-12">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-md">
              <img src="/logo/logoHPKnobg.png" className="h-full w-full object-contain" alt="Logo" />
            </div>
            <div className="hidden flex-col sm:flex text-white">
              <span className="text-base font-extrabold leading-tight tracking-tight">โรงพยาบาลวัดห้วยปลากั้งเพื่อสังคม</span>
              <span className="text-[12px] font-bold uppercase text-[#A6E0FF]">Wat Huay Pla Kang Social Welfare Hospital</span>
            </div>
          </div>

          {/* 🚩 USER MENU DROPDOWN */}
          <div className="relative flex items-center" ref={menuRef}>
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 pl-2 pr-4 py-1.5 text-sm font-semibold text-white hover:bg-white/20 transition-all shadow-inner"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-sm border border-white/30 text-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[150px] truncate">{displayName}</span>
                  <ChevronDown className={`h-4 w-4 text-blue-200 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signed in as</p>
                      <p className="text-xs font-bold text-slate-700 truncate">{session.user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/auth/login')}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-bold text-white hover:bg-white/20 transition-all"
              >
                <Shield className="h-4 w-4 text-[#A6E0FF]" /> เข้าสู่ระบบ
              </button>
            )}
          </div>
        </nav>

        <div className="relative z-20 mx-auto mt-8 max-w-5xl px-6 text-center md:mt-12">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#0094d4]/50 bg-[#00529a]/50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#A6E0FF] shadow-sm backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5" /> ระบบปฏิบัติการส่วนกลาง ปลอดภัย 100%
          </div>
          <h1 className="mb-6 text-5xl font-black leading-[1.1] tracking-tight text-white md:text-7xl lg:text-8xl drop-shadow-md">
            ระบบบริหารจัดการ<br />โรงพยาบาล
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-blue-50/90 md:text-xl font-medium">
            ยกระดับการให้บริการทางการแพทย์ ด้วยระบบสารสนเทศส่วนกลางที่รวดเร็ว และโปร่งใส
          </p>
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="relative z-30 mx-auto -mt-8 max-w-7xl px-6 pb-24 lg:px-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {departments.map(({ label, icon: Icon, department_code, system_name, description, accent }) => {
            const a = accentMap[accent] || accentMap.sky;

            return (
              <div
                key={department_code}
                onClick={() => handleDepartmentAction(system_name, department_code)}
                className={`group flex flex-col cursor-pointer overflow-hidden rounded-[1.5rem] border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 active:shadow-sm ${a.border}`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${a.iconBg}`}>
                    <Icon className={`h-7 w-7 ${a.iconText}`} strokeWidth={1.8} />
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest ${a.badgeBg} ${a.badgeText}`}>
                    CODE {department_code}
                  </span>
                </div>

                <div className="flex-1 mb-6">
                  <h3 className={`mb-3 text-xl font-extrabold leading-snug ${a.text}`}>{label}</h3>
                  <p className="line-clamp-2 text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
                </div>

                {/* ปุ่มลูกศรแบบมินิมอล */}
                <div className="mt-auto flex w-full justify-end">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 ${a.btnBg} ${a.btnBorder} text-[#0094d4] group-hover:bg-[#0094d4] group-hover:text-white group-hover:border-[#0094d4]`}>
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white p-1">
                  <img src="/logo/logoHPKnobg.png" className="h-full w-full object-contain" alt="Hospital Logo" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white leading-none">โรงพยาบาลวัดห้วยปลากั้ง</h4>
                  <p className="text-[10px] font-bold text-[#0094d4] uppercase tracking-wider mt-1">Wat Huay Pla Kang Hospital</p>
                </div>
              </div>
              <div className="space-y-4 text-slate-400 max-w-md text-sm leading-relaxed">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-[#0094d4] shrink-0" />
                  <span>553 หมู่ที่ 3 ต.ริมกก อ.เมือง จ.เชียงราย 57100</span>
                </div>
                <div className="flex gap-3">
                  <Globe className="h-5 w-5 text-[#0094d4] shrink-0" />
                  <span>โรงพยาบาลวัดห้วยปลากั้งเพื่อสังคม (ไม่คิดค่าใช้จ่าย)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:items-end space-y-6">
              <h5 className="text-lg font-bold">ติดต่อสอบถาม</h5>
              <div className="space-y-4 text-slate-400 text-sm">
                <div className="flex items-center gap-3 md:justify-end font-bold text-white">
                  <span>053-150-202</span>
                  <Phone className="h-5 w-5 text-[#0094d4]" />
                </div>
                <div className="flex items-center gap-3 md:justify-end font-bold text-white">
                  <span>info@huayplakang.com</span>
                  <Mail className="h-5 w-5 text-[#0094d4]" />
                </div>
                <div className="flex items-center gap-4 pt-2 md:justify-end">
                  <a href="#" className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#0094d4] transition-all">
                    <Facebook className="h-5 w-5 text-white" />
                  </a>
                  <a href="#" className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#0094d4] transition-all">
                    <Globe className="h-5 w-5 text-white" />
                  </a>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} โรงพยาบาลวัดห้วยปลากั้งเพื่อสังคม — MIS v1.0.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}