'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { ChevronLeft, Key, Save, ShieldAlert, Eye, EyeOff } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4100';

export default function ResetPasswordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return Swal.fire({ icon: 'error', title: 'รหัสผ่านไม่ตรงกัน', text: 'กรุณาตรวจสอบการกรอกรหัสผ่านอีกครั้ง' });
    }

    if (newPassword.length < 6) {
      return Swal.fire({ icon: 'warning', title: 'รหัสผ่านสั้นเกินไป', text: 'ต้องมีอย่างน้อย 6 ตัวอักษร' });
    }

    const result = await Swal.fire({
      title: 'ยืนยันการเปลี่ยนรหัสผ่าน?',
      text: "ผู้ใช้งานจะเข้าสู่ระบบด้วยรหัสผ่านเดิมไม่ได้ทันที",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: id,
          newPassword: newPassword
        }),
      });

      const resData = await response.json();

      if (!response.ok) throw new Error(resData.message || 'เกิดข้อผิดพลาด');

      await Swal.fire({
        icon: 'success',
        title: 'เปลี่ยนรหัสผ่านสำเร็จ',
        timer: 2000,
        showConfirmButton: false
      });

      router.push(`/admin/users`); // หรือกลับไปหน้า Detail เดิม
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'ล้มเหลว', text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()} 
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ChevronLeft className="h-5 w-5 text-slate-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">เปลี่ยนรหัสผ่าน (Force Reset)</h1>
          <p className="text-sm text-slate-500 font-medium">จัดการรหัสผ่านสำหรับเจ้าหน้าที่ ID: #{id}</p>
        </div>
      </div>

      {/* Info Warning */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800 font-medium">
          การเปลี่ยนรหัสผ่านตรงนี้จะเป็นการเปลี่ยนทันทีโดย **ไม่ต้องมีการยืนยันผ่านอีเมล** กรุณาแจ้งรหัสผ่านใหม่ให้เจ้าหน้าที่ทราบหลังจากดำเนินการเสร็จสิ้น
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleReset} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Key className="h-4 w-4" /> รหัสผ่านใหม่
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-mono"
                  placeholder="กรอกรหัสผ่านใหม่"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">ยืนยันรหัสผ่านใหม่อีกครั้ง</label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-mono"
                placeholder="กรอกรหัสผ่านเพื่อยืนยัน"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-all"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-10 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all disabled:bg-blue-300 disabled:shadow-none"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
            ) : (
              <><Save className="h-5 w-5" /> บันทึกรหัสผ่านใหม่</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}