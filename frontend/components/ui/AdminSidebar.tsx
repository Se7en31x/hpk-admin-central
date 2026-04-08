'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Users, ShieldCheck, History, ChevronLeft, LayoutGrid, FileSearch } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menus = [
    {
      group: 'การจัดการสิทธิ์',
      items: [
        { name: 'จัดการสิทธิ์ผู้ใช้งาน', path: '/admin/users', icon: Users },
        { name: 'กำหนดบทบาท (Roles)', path: '/admin/roles', icon: ShieldCheck },
        { name: 'ภาพรวมระบบ', path: '/admin', icon: LayoutGrid },
      ]
    },
    {
      group: 'ตรวจสอบระบบ',
      items: [
        { name: 'ประวัติการล็อกอิน', path: '/admin/logs/login', icon: History },
        { name: 'Audit Logs', path: '/admin/logs/audit', icon: FileSearch },
      ]
    }
  ];

  return (
    <aside className={`relative h-screen ${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shadow-sm z-20`}>
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 py-4 border-b border-slate-50`}>
        {!collapsed && <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Admin Control</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
          {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {menus.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && <h3 className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{group.group}</h3>}
            <ul className="space-y-1">
              {group.items.map((menu) => {
                const active = pathname === menu.path;
                const Icon = menu.icon;
                return (
                  <li key={menu.path}>
                    <Link href={menu.path} className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start gap-3'} px-3 py-2.5 rounded-xl transition-all ${active ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {!collapsed && <span className="text-sm">{menu.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}