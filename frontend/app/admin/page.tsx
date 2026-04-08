'use client'

import Link from 'next/link'
import { Users, ShieldCheck, LayoutDashboard } from 'lucide-react'

export default function AdminHomePage() {
	return (
		<section className="space-y-6">
			<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<div className="flex items-center gap-3">
					<div className="rounded-xl bg-blue-50 p-2 text-blue-600">
						<LayoutDashboard className="h-5 w-5" />
					</div>
					<div>
						<h1 className="text-2xl font-extrabold text-slate-800">Admin Dashboard</h1>
						<p className="text-sm text-slate-500">ภาพรวมการจัดการระบบสิทธิ์ผู้ใช้งาน</p>
					</div>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Link
					href="/admin/users"
					className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
				>
					<div className="mb-3 inline-flex rounded-lg bg-blue-50 p-2 text-blue-600">
						<Users className="h-5 w-5" />
					</div>
					<h2 className="text-lg font-bold text-slate-800">จัดการผู้ใช้งาน</h2>
					<p className="mt-1 text-sm text-slate-500">กำหนดสิทธิ์ระบบให้เจ้าหน้าที่แต่ละคน</p>
				</Link>

				<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
					<div className="mb-3 inline-flex rounded-lg bg-emerald-50 p-2 text-emerald-600">
						<ShieldCheck className="h-5 w-5" />
					</div>
					<h2 className="text-lg font-bold text-slate-800">สถานะความปลอดภัย</h2>
					<p className="mt-1 text-sm text-slate-500">ระบบพร้อมใช้งานและการยืนยันตัวตนทำงานปกติ</p>
				</div>
			</div>
		</section>
	)
}
