'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
}

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({ username: '', password: '' })

    const supabase = createClient()
    const router = useRouter()

    const validateAccess = useCallback(async (user: User | null) => {
        if (!user) throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
        const metadata = user?.app_metadata;
        const systems = metadata?.systems || [];
        if (metadata?.is_disabled === true) throw new Error('บัญชีของคุณถูกระงับการใช้งาน');
        if (!Array.isArray(systems) || systems.length === 0) throw new Error('คุณยังไม่มีสิทธิ์เข้าถึงระบบงานใดๆ');
        return true;
    }, []);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                try {
                    await validateAccess(session.user);
                    router.push('/');
                } catch {
                    await supabase.auth.signOut();
                }
            }
        };
        checkSession();
    }, [supabase, router, validateAccess]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setErrors({
                username: !username ? 'กรุณาระบุชื่อผู้ใช้งาน' : '',
                password: !password ? 'กรุณาระบุรหัสผ่าน' : ''
            });
            return;
        }

        setLoading(true);
        setErrors({ username: '', password: '' });

        try {
            const email = username.includes('@') ? username : `${username.trim()}@hpk.com`;
            const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

            if (authError) throw new Error('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
            await validateAccess(data.user);

            router.push('/');
            router.refresh();
        } catch (err: unknown) {
            setErrors({ username: '', password: getErrorMessage(err) });
            await supabase.auth.signOut();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6 font-sans text-gray-800">
            {/* Login Card - ขยายกว้างขึ้นเล็กน้อย */}
            <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl border border-gray-200 p-10 md:p-12">
                
                {/* Header Section */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <img
                        src="https://res.cloudinary.com/dgoxbpj1j/image/upload/v1773921237/logo-removebg-preview_frzye8.png"
                        alt="HPK Logo"
                        className="w-24 h-24 mb-4 object-contain"
                    />
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                        ระบบบริหารจัดการโรงพยาบาล
                    </h1>
                    <p className="text-gray-500 font-medium text-sm mt-2">
                        โรงพยาบาลวัดห้วยปลากั้งเพื่อสังคม
                    </p>
                </div>

                {/* Form Section */}
                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Username */}
                    <div>
                        <label className="text-xs font-bold text-gray-600 mb-2 ml-1 uppercase block tracking-wider">
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="กรอกชื่อผู้ใช้งาน"
                            className={`w-full px-4 py-3 bg-white border rounded-xl text-base outline-none transition-all ${
                                errors.username 
                                    ? 'border-red-500 focus:ring-2 focus:ring-red-100' 
                                    : 'border-gray-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100'
                            }`}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        {errors.username && <p className="text-red-500 text-xs mt-1.5 ml-1 italic font-medium">! {errors.username}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-xs font-bold text-gray-600 mb-2 ml-1 uppercase block tracking-wider">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="กรอกรหัสผ่าน"
                            className={`w-full px-4 py-3 bg-white border rounded-xl text-base outline-none transition-all ${
                                errors.password 
                                    ? 'border-red-500 focus:ring-2 focus:ring-red-100' 
                                    : 'border-gray-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100'
                            }`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1.5 ml-1 italic font-medium">! {errors.password}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 mt-2 rounded-xl font-bold text-base text-white transition-all shadow-lg ${
                            loading 
                                ? 'bg-blue-300 cursor-not-allowed' 
                                : 'bg-[#1E40AF] hover:bg-[#1e3a8a] active:scale-[0.98]'
                        }`}
                    >
                        {loading ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบ'}
                    </button>
                </form>
            </div>
        </div>
    )
}