'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Search, UserPlus, ChevronRight, ChevronLeft, Key
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const ITEMS_PER_PAGE = 10; // กำหนดจำนวนรายการต่อหน้า

type ProfileApiItem = {
    id: string;
    firstname_th: string | null;
    lastname_th: string | null;
    phone: string | null;
    department: string[];
    system: string[];
    role: string | null;
    status_: string | null;
    created_at: string | null;
    updated_at: string | null;
    users: { email: string | null; role: string | null; };
};

type UserRow = {
    id: string;
    firstname_th: string;
    lastname_th: string;
    email: string;
    phone: string;
    department: string[];
    system: string[];
    role_name: string;
    status: 'Active' | 'Disabled' | 'Banned';
    created_at: string;
    updated_at: string;
};

function formatDateTime(value: string | null | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('th-TH', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
}

function getStatusThaiLabel(status: 'Active' | 'Disabled' | 'Banned'): string {
    if (status === 'Disabled') return 'ปิดใช้งาน';
    if (status === 'Banned') return 'ระงับ';
    return 'ใช้งาน';
}

function normalizeStatusLabel(status: string | null | undefined): 'Active' | 'Disabled' | 'Banned' {
    const raw = (status || '').trim().toLowerCase();
    if (raw === 'disabled') return 'Disabled';
    if (raw === 'banned') return 'Banned';
    return 'Active';
}

function normalizeRoleLabel(role: string | null | undefined): string {
    const raw = (role || '').trim().toLowerCase();
    if (raw === 'super admin' || raw === 'superadmin') return 'Super Admin';
    if (raw === 'authenticated' || raw === 'staff' || raw === 'user' || raw === '') return 'Staff';
    return role || 'Staff';
}

function mapApiToUserRow(item: ProfileApiItem): UserRow {
    return {
        id: item.id,
        firstname_th: item.firstname_th || '-',
        lastname_th: item.lastname_th || '-',
        email: item.users?.email || '-',
        phone: item.phone || '-',
        department: Array.isArray(item.department) ? item.department : [],
        system: Array.isArray(item.system) ? item.system : [],
        role_name: normalizeRoleLabel(item.users?.role || item.role),
        status: normalizeStatusLabel(item.status_),
        created_at: formatDateTime(item.created_at),
        updated_at: formatDateTime(item.updated_at),
    };
}

export default function UserListPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [systemFilter, setSystemFilter] = useState('all');
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchProfiles = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/profiles`);
                if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลได้');
                const result = await response.json();
                const data = Array.isArray(result?.data) ? result.data : [];
                setUsers(data.map(mapApiToUserRow));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
            } finally {
                setLoading(false);
            }
        };
        fetchProfiles();
    }, []);

    const departmentOptions = useMemo(() => {
        return Array.from(new Set(users.flatMap((user) => user.department).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    }, [users]);

    const systemOptions = useMemo(() => {
        return Array.from(new Set(users.flatMap((user) => user.system).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    }, [users]);

    // Filter Logic
    const filteredUsers = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return users.filter((user) => {
            const fullName = `${user.firstname_th} ${user.lastname_th}`.toLowerCase();
            const matchesSearch =
                fullName.includes(q) ||
                user.email.toLowerCase().includes(q) ||
                user.department.join(' ').toLowerCase().includes(q);
            const matchesStatus = statusFilter === 'all' || user.status.toLowerCase() === statusFilter;
            const matchesDepartment = departmentFilter === 'all' || user.department.includes(departmentFilter);
            const matchesSystem = systemFilter === 'all' || user.system.includes(systemFilter);

            return matchesSearch && matchesStatus && matchesDepartment && matchesSystem;
        });
    }, [searchTerm, users, statusFilter, departmentFilter, systemFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, departmentFilter, systemFilter]);

    const renderTags = (items: string[]) => {
        if (items.length === 0) return <span className="text-slate-300">-</span>;
        return (
            <div className="flex items-center gap-1">
                <span className="truncate max-w-[100px] inline-block">{items[0]}</span>
                {items.length > 1 && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-bold">
                        +{items.length - 1}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className="w-full space-y-6 px-4 py-6 md:px-6 md:py-6">
            {/* Header Section - Compact */}
            <div className="space-y-3">
                <div>
                    <h1 className="text-xl font-black text-slate-900">จัดการเจ้าหน้าที่</h1>
                </div>

                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อ, แผนก..."
                                className="pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-100 outline-none w-64 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <select
                            className="h-[38px] min-w-[140px] rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">สถานะทั้งหมด</option>
                            <option value="active">ใช้งาน</option>
                            <option value="disabled">ปิดใช้งาน</option>
                            <option value="banned">ระงับ</option>
                        </select>

                        <select
                            className="h-[38px] min-w-[140px] rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                        >
                            <option value="all">แผนกทั้งหมด</option>
                            {departmentOptions.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>

                        <select
                            className="h-[38px] min-w-[140px] rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                            value={systemFilter}
                            onChange={(e) => setSystemFilter(e.target.value)}
                        >
                            <option value="all">ระบบทั้งหมด</option>
                            {systemOptions.map((system) => (
                                <option key={system} value={system}>
                                    {system}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end">
                        <Link
                            href="/admin/users/create"
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-blue-700 transition-all shadow-sm"
                        >
                            <UserPlus className="h-4 w-4" /> เพิ่ม
                        </Link>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[calc(100vh-250px)]">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                <th className="px-3 py-3 w-[7%] text-center">ลำดับ</th>
                                <th className="px-3 py-3 w-[18%]">ชื่อ-นามสกุล</th>
                                <th className="px-3 py-3 w-[14%]">อีเมล</th>
                                <th className="px-3 py-3 w-[11%]">เบอร์โทรศัพท์</th>
                                <th className="px-3 py-3 w-[14%]">แผนก</th>
                                <th className="px-3 py-3 w-[14%]">ระบบ</th>
                                <th className="px-3 py-3 w-[8%]">ประเภท</th>
                                <th className="px-3 py-3 w-[8%]">สถานะ</th>
                                <th className="px-3 py-3 w-[10%]">วันที่สร้าง</th>
                                <th className="px-3 py-3 w-[10%]">แก้ไขล่าสุด</th>
                                <th className="px-3 py-3 w-[12%] text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={11} className="px-3 py-8 text-center text-sm text-slate-600">กำลังโหลด...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={11} className="px-3 py-8 text-center text-sm text-red-500">{error}</td></tr>
                            ) : paginatedUsers.length === 0 ? (
                                <tr><td colSpan={11} className="px-3 py-8 text-center text-sm text-slate-600">ไม่พบข้อมูล</td></tr>
                            ) : paginatedUsers.map((user, index) => (
                                <tr key={user.id} className="hover:bg-blue-50/20 transition-colors group">
                                    <td className="px-3 py-3 text-center text-sm font-normal text-slate-700">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span className="text-sm font-normal text-slate-900 truncate block">
                                            {user.firstname_th} {user.lastname_th}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-sm font-normal text-slate-700 truncate">{user.email}</td>
                                    <td className="px-3 py-3 text-sm font-normal text-slate-700 truncate">{user.phone}</td>
                                    <td className="px-3 py-3 text-sm font-normal text-slate-700">{renderTags(user.department)}</td>
                                    <td className="px-3 py-3 text-sm font-normal text-slate-700">{renderTags(user.system)}</td>
                                    <td className="px-3 py-3">
                                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase ${user.role_name === 'Super Admin' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                                            }`}>
                                            {user.role_name}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3">
                                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase ${user.status === 'Active'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : user.status === 'Disabled'
                                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                : 'bg-rose-50 text-rose-700 border-rose-100'
                                            }`}>
                                            {getStatusThaiLabel(user.status)}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-xs text-slate-700 whitespace-nowrap">{user.created_at}</td>
                                    <td className="px-3 py-3 text-xs text-slate-700 whitespace-nowrap">{user.updated_at}</td>
                                    <td className="px-3 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            {/* 🚩 ปุ่ม Reset Password (กุญแจ) */}
                                            <Link 
                                                href={`/admin/users/${user.id}/reset-password`}
                                                title="เปลี่ยนรหัสผ่าน"
                                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-all"
                                            >
                                                <Key className="h-4 w-4" />
                                            </Link>
                                            <Link
                                                href={`/admin/users/${user.id}`}
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 text-slate-700 hover:text-blue-700 hover:border-blue-300 rounded text-[11px] font-bold transition-all shadow-sm"
                                            >
                                                จัดการ <ChevronRight className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Compact Pagination */}
                <div className="bg-white px-3 py-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-700 font-medium">
                        แสดง {Math.min(filteredUsers.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} ถึง {Math.min(filteredUsers.length, currentPage * ITEMS_PER_PAGE)} จาก {filteredUsers.length} รายการ
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                            .map((page, idx, arr) => (
                                <React.Fragment key={page}>
                                    {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-1 text-slate-400">...</span>}
                                    <button
                                        onClick={() => setCurrentPage(page)}
                                        className={`min-w-[32px] h-8 text-xs font-bold rounded-md transition-all ${currentPage === page
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                </React.Fragment>
                            ))}

                        <button
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}