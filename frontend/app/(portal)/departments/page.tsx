'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, Pill, ArrowRightLeft, HeartHandshake, ShieldCheck,
  Shield, Loader2, Lock, ArrowRight, Stethoscope, Activity
} from 'lucide-react';

/* ======================= SSO CONFIG ======================= */

const AUTH0_DOMAIN = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;

const CLIENTS = {
  PORTAL: {
    id: "CLIENT_ID_ADMIN_CENTRAL",
    callback: "http://localhost:3000"
  },
  WAREHOUSE: {
    id: "CLIENT_ID_WAREHOUSE_GROUP",
    callback: "http://localhost:3001/auth/callback"
  },
  PHARMACY: {
    id: "CLIENT_ID_PHARMACY_APP",
    callback: "http://localhost:3002/auth/callback"
  },
  CHEEWABHIBALN: {
    id: "CLIENT_ID_CHEEWABHIBALN_APP",
    callback: "http://localhost:3003/auth/callback"
  }
};

const SYSTEMS_MAP: Record<string, { client: typeof CLIENTS[keyof typeof CLIENTS], path: string }> = {
  "01": { client: CLIENTS.WAREHOUSE, path: "/dashboard" },      // คลังหลัก
  "04": { client: CLIENTS.WAREHOUSE, path: "/borrow-return" },  // เบิกยืมคืน
  "02": { client: CLIENTS.PHARMACY, path: "/dispense" },        // จ่ายยา
  "05": { client: CLIENTS.CHEEWABHIBALN, path: "/palliative-care" },// ชีวาภิบาล
  "07": { client: CLIENTS.PORTAL, path: "/opd-dashboard" },     // ผู้ป่วยนอก (OPD)
  "06": { client: CLIENTS.PORTAL, path: "/dental-clinic" },     // ทันตกรรม
};

/* ======================= UI DATA ======================= */

const departments = [
  { label: 'คลังหลัก', department_code: '01', icon: Package, description: 'บริหารจัดการสต็อกเวชภัณฑ์และอุปกรณ์การแพทย์ส่วนกลาง', accent: 'emerald' },
  { label: 'จ่ายยาและคลังยาย่อย', department_code: '02', icon: Pill, description: 'จัดการคลังยาย่อยและระบบการจ่ายยาให้ผู้ป่วย', accent: 'teal' },
  { label: 'ผู้ป่วยนอก (OPD)', department_code: '07', icon: Stethoscope, description: 'ระบบจัดการข้อมูล คัดกรอง ตรวจรักษา และส่งต่อผู้ป่วยนอก', accent: 'amber' },
  { label: 'เบิกยืมคืน', department_code: '04', icon: ArrowRightLeft, description: 'บันทึกและติดตามการเบิก ยืม หรือคืนอุปกรณ์ต่างๆ อย่างเป็นระบบ', accent: 'sky' },
  { label: 'ชีวาภิบาล', department_code: '05', icon: HeartHandshake, description: 'ดูแลและจัดการข้อมูลผู้ป่วยระยะท้ายแบบประคับประคอง', accent: 'indigo' },
  { label: 'ทันตกรรม', department_code: '06', icon: Activity, description: 'ระบบจัดการคลินิกทันตกรรม ประวัติการรักษา และการนัดหมาย', accent: 'rose' },
];

const accentMap: Record<string, { border: string; text: string; iconBg: string; iconText: string; badgeBg: string; badgeText: string; btnBg: string; btnBorder: string }> = {
  sky: { border: 'border-slate-200 hover:border-[#0094d4]', text: 'text-[#00529a]', iconBg: 'bg-sky-50', iconText: 'text-sky-600', badgeBg: 'bg-sky-100', badgeText: 'text-sky-700', btnBg: 'bg-white hover:bg-slate-50', btnBorder: 'border-slate-200' },
  teal: { border: 'border-slate-200 hover:border-[#0094d4]', text: 'text-[#00529a]', iconBg: 'bg-teal-50', iconText: 'text-teal-600', badgeBg: 'bg-teal-100', badgeText: 'text-teal-700', btnBg: 'bg-white hover:bg-slate-50', btnBorder: 'border-slate-200' },
  amber: { border: 'border-slate-200 hover:border-[#0094d4]', text: 'text-[#00529a]', iconBg: 'bg-amber-50', iconText: 'text-amber-600', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700', btnBg: 'bg-white hover:bg-slate-50', btnBorder: 'border-slate-200' },
  indigo: { border: 'border-slate-200 hover:border-[#0094d4]', text: 'text-[#00529a]', iconBg: 'bg-indigo-50', iconText: 'text-indigo-600', badgeBg: 'bg-indigo-100', badgeText: 'text-indigo-700', btnBg: 'bg-white hover:bg-slate-50', btnBorder: 'border-slate-200' },
  emerald: { border: 'border-slate-200 hover:border-[#0094d4]', text: 'text-[#00529a]', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', btnBg: 'bg-white hover:bg-slate-50', btnBorder: 'border-slate-200' },
  rose: { border: 'border-slate-200 hover:border-[#0094d4]', text: 'text-[#00529a]', iconBg: 'bg-rose-50', iconText: 'text-rose-600', badgeBg: 'bg-rose-100', badgeText: 'text-rose-700', btnBg: 'bg-white hover:bg-slate-50', btnBorder: 'border-slate-200' },
};

export default function UnifiedPortal() {
  const router = useRouter();
  const [loadingCode, setLoadingCode] = useState<string | null>(null);

  /* ======================= SSO REDIRECT ======================= */

  const handleDepartmentAction = (deptCode: string) => {
    const config = SYSTEMS_MAP[deptCode];
    if (!config) return;

    setLoadingCode(deptCode);

    // state คือ 'GPS' บอกว่าพอ login เสร็จ ให้แอปปลายทางพาไป path ไหน
    const state = encodeURIComponent(config.path);

    const url =
      `${AUTH0_DOMAIN}/authorize` +
      `?response_type=code` +
      `&client_id=${config.client.id}` +
      `&redirect_uri=${encodeURIComponent(config.client.callback)}` +
      `&scope=openid profile email` +
      `&state=${state}`;

    if (typeof window !== 'undefined') {
      window.location.assign(url); // ใช้ .assign() แทนการใช้ =
    }
  };

  /* ======================= UI ======================= */

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#0094d4]/30 selection:text-[#00529a]">

      {/* HERO */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#00529a] to-[#0094d4] pt-0 pb-36">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:40px_40px]" />

        <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-12">
          <div className="flex items-center gap-4">
            <div className="flex h-15 w-15 items-center justify-center rounded-xl bg-white shadow-md">
              <img src="/logo/logoHPKnobg.png" className="h-full w-full object-contain" alt="Logo" />
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-base font-extrabold leading-tight tracking-tight text-white">โรงพยาบาลวัดห้วยปลากั้งเพื่อสังคม</span>
              <span className="text-[12px] font-bold uppercase text-[#A6E0FF]">Wat Huay Pla Kang Social Welfare Hospital</span>
            </div>
          </div>

          <button
            onClick={() => window.location.href =
              `${AUTH0_DOMAIN}/authorize?response_type=code&client_id=CLIENT_ID_PORTAL&redirect_uri=${encodeURIComponent("http://localhost:3000")}&scope=openid profile email`}
            className="hidden md:flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            <Shield className="h-4 w-4 text-[#A6E0FF]" /> ผู้ดูแลระบบ
          </button>
        </nav>

        <div className="relative z-20 mx-auto mt-8 max-w-5xl px-6 text-center md:mt-12">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#0094d4]/50 bg-[#00529a]/50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#A6E0FF] shadow-sm backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5" /> ระบบปฏิบัติการส่วนกลาง ปลอดภัย 100%
          </div>
          <h1 className="mb-6 text-5xl font-black leading-[1.1] tracking-tight text-white md:text-7xl lg:text-8xl drop-shadow-md">
            ระบบบริหารจัดการ<br />โรงพยาบาล
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-blue-50/90 md:text-xl">
            ยกระดับการให้บริการทางการแพทย์ ด้วยระบบสารสนเทศส่วนกลางที่รวดเร็ว และโปร่งใส
          </p>
        </div>
      </div>

      {/* CARDS */}
      <div className="relative z-30 mx-auto -mt-8 max-w-7xl px-6 pb-24 lg:px-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {departments.map(({ label, icon: Icon, department_code, description, accent }) => {
            const a = accentMap[accent] || accentMap.sky;
            const isTargetLoading = loadingCode === department_code;

            return (
              <div
                key={department_code}
                onClick={() => handleDepartmentAction(department_code)}
                className={`flex flex-col cursor-pointer overflow-hidden rounded-[1.5rem] border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 ${a.border}`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${a.iconBg}`}>
                    <Icon className={`h-7 w-7 ${a.iconText}`} strokeWidth={1.8} />
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest ${a.badgeBg} ${a.badgeText}`}>
                    CODE {department_code}
                  </span>
                </div>

                <div className="flex-1 mb-8">
                  <h3 className={`mb-3 text-xl font-extrabold leading-snug ${a.text}`}>{label}</h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-slate-500 font-medium">{description}</p>
                </div>

                <div className={`mt-auto flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition-all ${isTargetLoading ? 'bg-slate-100 text-slate-400' : `${a.btnBg} ${a.btnBorder} text-[#0094d4] hover:bg-[#0094d4] hover:text-white`}`}>
                  <span className="flex items-center gap-2">
                    {isTargetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    {isTargetLoading ? 'กำลังพาวาร์ป...' : 'เข้าสู่ระบบงาน'}
                  </span>
                  <ArrowRight className={`h-4 w-4 ${isTargetLoading ? 'hidden' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="bg-slate-900 pt-16 pb-12 text-white text-center">
        <div className="text-slate-400 text-sm font-medium">
          © {new Date().getFullYear()} โรงพยาบาลวัดห้วยปลากั้งเพื่อสังคม — Medical Information System
        </div>
      </footer>
    </div>
  );
}