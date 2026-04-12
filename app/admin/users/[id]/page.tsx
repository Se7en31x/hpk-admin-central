'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Select, { type SingleValue, type StylesConfig } from 'react-select';
import { 
  ArrowLeft, Save, User, MapPin, ShieldCheck, 
  Briefcase, Heart, UserCog, Trash2, X
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4100';

type LookupOption = {
  value: string;
  label: string;
};

type SelectOption = {
  value: string;
  label: string;
};

type ProvinceLookup = {
  province: string;
  value: string;
};

type DistrictLookup = {
  district: string;
  provcode: string;
  distcode: string;
  value: string;
};

type SubdistrictLookup = {
  subdistrict: string;
  provcode: string;
  distcode: string;
  subdistcode: string;
  value: string;
};

type LookupState = {
  systems: LookupOption[];
  departments: LookupOption[];
  roles: LookupOption[];
  titles: LookupOption[];
  sexes: LookupOption[];
  mstatuses: LookupOption[];
  provinces: ProvinceLookup[];
  districts: DistrictLookup[];
  subdistricts: SubdistrictLookup[];
};

const initialLookups: LookupState = {
  systems: [],
  departments: [],
  roles: [],
  titles: [],
  sexes: [],
  mstatuses: [],
  provinces: [],
  districts: [],
  subdistricts: [],
};

type ProfileFormState = {
  firstname_th: string;
  lastname_th: string;
  firstname_en: string;
  lastname_en: string;
  cid: string;
  birth_date: string;
  title_code: string;
  sex_id: string;
  mstatus: string;
  phone: string;
  address_detail: string;
  subdistrict_code: string;
  district_code: string;
  province_code: string;
  zip_code: string;
  profession_id: string;
  current_maininscl: string;
  role_id: string;
  status: 'Active' | 'Disabled' | 'Banned';
  system_id: number[];
  department_id: number[];
};

const initialForm: ProfileFormState = {
  firstname_th: '',
  lastname_th: '',
  firstname_en: '',
  lastname_en: '',
  cid: '',
  birth_date: '',
  title_code: '',
  sex_id: '',
  mstatus: '',
  phone: '',
  address_detail: '',
  subdistrict_code: '',
  district_code: '',
  province_code: '',
  zip_code: '',
  profession_id: '',
  current_maininscl: '',
  role_id: '',
  status: 'Active',
  system_id: [],
  department_id: [],
};

const controlledDropdownStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderColor: state.isFocused ? '#60a5fa' : '#e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(59,130,246,0.15)' : 'none',
    borderRadius: 8,
    '&:hover': {
      borderColor: state.isFocused ? '#60a5fa' : '#cbd5e1',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    paddingTop: 2,
    paddingBottom: 2,
    fontSize: 14,
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  menu: (base) => ({
    ...base,
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 10px 25px rgba(15,23,42,0.14)',
    zIndex: 50,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 14,
    backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#0f172a',
    cursor: 'pointer',
  }),
};

function toInputDate(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function toNumberOrNull(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function validateFormBeforeSave(form: ProfileFormState): string | null {
  if (!form.firstname_th.trim()) return 'กรุณากรอกชื่อภาษาไทย';
  if (!form.lastname_th.trim()) return 'กรุณากรอกนามสกุลภาษาไทย';
  if (form.system_id.length === 0) return 'กรุณาเลือกสิทธิ์การเข้าใช้งานอย่างน้อย 1 ระบบ';
  if (form.department_id.length === 0) return 'กรุณาเลือกแผนกอย่างน้อย 1 แผนก';

  if (form.cid.trim() && !/^\d{13}$/.test(form.cid.trim())) {
    return 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';
  }

  if (form.phone.trim() && !/^\d{9,10}$/.test(form.phone.replace(/[-\s]/g, ''))) {
    return 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก';
  }

  if (form.birth_date) {
    const selected = new Date(form.birth_date);
    const today = new Date();
    if (selected > today) return 'วันเกิดต้องไม่เป็นวันที่ในอนาคต';
  }

  return null;
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [lookups, setLookups] = useState<LookupState>(initialLookups);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState<ProfileFormState>(initialForm);

  const selectedProvinceCode = form.province_code ? form.province_code.padStart(2, '0') : '';
  const selectedDistrictCode = form.district_code ? form.district_code.padStart(4, '0') : '';

  const filteredDistricts = lookups.districts.filter((item) => item.provcode === selectedProvinceCode);
  const filteredSubdistricts = lookups.subdistricts.filter(
    (item) => item.provcode === selectedProvinceCode && item.distcode === selectedDistrictCode.slice(2, 4),
  );

  const roleOptions: SelectOption[] = lookups.roles;
  const statusOptions: SelectOption[] = [
    { value: 'Active', label: 'ใช้งาน' },
    { value: 'Disabled', label: 'ปิดใช้งาน' },
    { value: 'Banned', label: 'ระงับ' },
  ];
  const provinceOptions: SelectOption[] = lookups.provinces.map((item) => ({
    value: item.province,
    label: item.value,
  }));
  const districtOptions: SelectOption[] = filteredDistricts.map((item) => ({
    value: item.district,
    label: item.value,
  }));
  const subdistrictOptions: SelectOption[] = filteredSubdistricts.map((item) => ({
    value: item.subdistrict,
    label: item.value,
  }));

  useEffect(() => {
    const loadPageData = async () => {
      setLoadingLookups(true);
      setLoadingProfile(true);
      setErrorMessage('');

      try {
        const [lookupRes, profileRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/lookups/profile-form`),
          fetch(`${API_BASE_URL}/api/profiles/${id}`),
        ]);

        if (!lookupRes.ok) throw new Error('โหลดข้อมูลตัวเลือกไม่สำเร็จ');
        if (!profileRes.ok) throw new Error('โหลดข้อมูลเจ้าหน้าที่ไม่สำเร็จ');

        const lookupJson = await lookupRes.json();
        const profileJson = await profileRes.json();

        const lookupData = lookupJson?.data;
        const profile = profileJson?.data;

        setLookups({
          systems: (lookupData?.systems || []).map((item: { id: number; system_code: string; name_th: string; name_en: string }) => ({
            value: String(item.id),
            label: item.name_th
              ? `${item.name_th}${item.name_en ? ` (${item.name_en})` : ''}`
              : (item.name_en || item.system_code),
          })),
          departments: (lookupData?.departments || []).map((item: { id: number; name: string | null; name_en: string | null; code: string | null }) => ({
            value: String(item.id),
            label: item.name
              ? `${item.name}${item.name_en ? ` (${item.name_en})` : item.code ? ` (${item.code})` : ''}`
              : (item.name_en || item.code || `Department ${item.id}`),
          })),
          roles: (lookupData?.roles || []).map((item: { id: number; code: string; role_name_th: string; role_name_en: string }) => ({
            value: String(item.id),
            label: item.role_name_th || item.role_name_en,
          })),
          titles: (lookupData?.titles || []).map((item: { title_code: string; name: string; short_name: string | null }) => ({
            value: item.title_code,
            label: item.short_name || item.name,
          })),
          sexes: (lookupData?.sexes || []).map((item: { sex_code: string; sex: string }) => ({
            value: item.sex_code,
            label: item.sex,
          })),
          mstatuses: (lookupData?.mstatuses || []).map((item: { mstatus_code: string; mstatus: string }) => ({
            value: item.mstatus_code,
            label: item.mstatus,
          })),
          provinces: lookupData?.provinces || [],
          districts: lookupData?.districts || [],
          subdistricts: lookupData?.subdistricts || [],
        });

        setForm({
          firstname_th: profile?.firstname_th || '',
          lastname_th: profile?.lastname_th || '',
          firstname_en: profile?.firstname_en || '',
          lastname_en: profile?.lastname_en || '',
          cid: profile?.cid || '',
          birth_date: toInputDate(profile?.birth_date || null),
          title_code: profile?.title_code || '',
          sex_id: profile?.sex_id != null ? String(profile.sex_id) : '',
          mstatus: profile?.mstatus != null ? String(profile.mstatus) : '',
          phone: profile?.phone || '',
          address_detail: profile?.address_detail || '',
          subdistrict_code: profile?.subdistrict_code != null ? String(profile.subdistrict_code).padStart(6, '0') : '',
          district_code: profile?.district_code != null ? String(profile.district_code).padStart(4, '0') : '',
          province_code: profile?.province_code != null ? String(profile.province_code).padStart(2, '0') : '',
          zip_code: profile?.zip_code != null ? String(profile.zip_code) : '',
          profession_id: profile?.profession_id || '',
          current_maininscl: profile?.current_maininscl != null ? String(profile.current_maininscl) : '',
          role_id: profile?.role_id != null ? String(profile.role_id) : '',
          status: (profile?.status_ === 'Disabled' || profile?.status_ === 'Banned') ? profile.status_ : 'Active',
          system_id: Array.isArray(profile?.system_id) ? profile.system_id : [],
          department_id: Array.isArray(profile?.department_id) ? profile.department_id : [],
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
        setErrorMessage(msg);
      } finally {
        setLoadingLookups(false);
        setLoadingProfile(false);
      }
    };

    loadPageData();
  }, [id]);

  const updateField = (field: keyof ProfileFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: 'system_id' | 'department_id', value: string) => {
    const numValue = Number(value);
    setForm((prev) => {
      const exists = prev[field].includes(numValue);
      const next = exists ? prev[field].filter((v) => v !== numValue) : [...prev[field], numValue];
      return { ...prev, [field]: next };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage('');

    try {
      const validationMessage = validateFormBeforeSave(form);
      if (validationMessage) {
        setErrorMessage(validationMessage);
        await Swal.fire({
          icon: 'warning',
          title: 'ข้อมูลไม่ครบ',
          text: validationMessage,
          confirmButtonText: 'ตกลง',
        });
        return;
      }

      const payload = {
        firstname_th: form.firstname_th || null,
        lastname_th: form.lastname_th || null,
        firstname_en: form.firstname_en || null,
        lastname_en: form.lastname_en || null,
        cid: form.cid || null,
        birth_date: form.birth_date || null,
        title_code: form.title_code || null,
        sex_id: toNumberOrNull(form.sex_id),
        mstatus: toNumberOrNull(form.mstatus),
        phone: form.phone || null,
        address_detail: form.address_detail || null,
        subdistrict_code: toNumberOrNull(form.subdistrict_code),
        district_code: toNumberOrNull(form.district_code),
        province_code: toNumberOrNull(form.province_code),
        zip_code: toNumberOrNull(form.zip_code),
        profession_id: form.profession_id || null,
        current_maininscl: toNumberOrNull(form.current_maininscl),
        role_id: form.role_id ? Number(form.role_id) : null,
        status: form.status,
        system_id: form.system_id,
        department_id: form.department_id,
      };

      const response = await fetch(`${API_BASE_URL}/api/profiles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('บันทึกข้อมูลไม่สำเร็จ');
      }

      await Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        confirmButtonText: 'ตกลง',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      setErrorMessage(msg);
      await Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: msg,
        confirmButtonText: 'ปิด',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'ยืนยันการลบผู้ใช้',
      text: 'ระบบจะตั้งสถานะเป็น Disabled และบันทึก deleted_at',
      showCancelButton: true,
      confirmButtonText: 'ยืนยันลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#dc2626',
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('ลบผู้ใช้ไม่สำเร็จ');
      }

      await Swal.fire({
        icon: 'success',
        title: 'ลบผู้ใช้สำเร็จ',
        text: 'ผู้ใช้ถูกปิดการใช้งานแล้ว',
        confirmButtonText: 'ตกลง',
      });

      router.push('/admin/users');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบผู้ใช้';
      await Swal.fire({
        icon: 'error',
        title: 'ลบผู้ใช้ไม่สำเร็จ',
        text: msg,
        confirmButtonText: 'ปิด',
      });
    }
  };

  if (loadingLookups || loadingProfile) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
          <p className="mt-3 text-sm font-medium text-slate-600">กำลังเตรียมข้อมูลเจ้าหน้าที่...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-sans text-slate-900 space-y-6 px-4 py-6 pb-20 md:px-6 md:py-6">
      
      {/* 1. ส่วนหัวหน้าจอ (เรียบง่ายที่สุด) */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-slate-400" />
            <h1 className="text-xl font-bold text-slate-800">จัดการข้อมูลเจ้าหน้าที่</h1>
            <span className="ml-2 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
              User ID: #{id}
            </span>
          </div>
        </div>
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 transition-all hover:bg-blue-100"
        >
          <ArrowLeft className="h-4 w-4" /> ย้อนกลับ
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- คอลัมน์ซ้าย: สังกัดและสิทธิ์ (4/12) --- */}
        <div className="lg:col-span-4 space-y-8">
          {/* สิทธิ์ระบบงาน */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-700" />
              <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">สิทธิ์การเข้าใช้งานระบบ</span>
            </div>
            <div className="p-5 space-y-2">
              {(lookups.systems.length > 0 ? lookups.systems : [
                { value: 'Administration', label: 'Administration' },
                { value: 'OPD', label: 'OPD' },
                { value: 'Dental', label: 'Dental' },
                { value: 'Palliative', label: 'Palliative' },
                { value: 'Pharmacy', label: 'Pharmacy' },
                { value: 'Warehouse', label: 'Warehouse' },
                { value: 'Borrow-Return', label: 'Borrow-Return' },
              ]).map((s) => (
                <label key={s.value} className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-blue-700"
                    checked={form.system_id.includes(Number(s.value))}
                    onChange={() => toggleArrayField('system_id', s.value)}
                  />
                  <span className="text-xs font-bold text-slate-600 uppercase">{s.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* สังกัดแผนก */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-700" />
              <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">สังกัดและบทบาท</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">แผนก</label>
                <p className="text-[10px] text-slate-400">เลือกได้หลายแผนก ({form.department_id.length} รายการ)</p>
                <div className="max-h-64 overflow-y-auto border border-slate-200 rounded p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {lookups.departments.map((item) => (
                    <label key={item.value} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 rounded px-2 py-1.5 hover:bg-slate-100">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-blue-700"
                        checked={form.department_id.includes(Number(item.value))}
                        onChange={() => toggleArrayField('department_id', item.value)}
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">บทบาทบุคลากร</label>
                <Select
                  options={roleOptions}
                  value={roleOptions.find((item) => item.value === form.role_id) ?? null}
                  onChange={(selected: SingleValue<SelectOption>) => updateField('role_id', selected?.value || '')}
                  placeholder="เลือกบทบาท"
                  isClearable
                  menuPlacement="bottom"
                  menuPosition="fixed"
                  maxMenuHeight={220}
                  styles={controlledDropdownStyles}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">สถานะบัญชี</label>
                <Select
                  options={statusOptions}
                  value={statusOptions.find((item) => item.value === form.status) ?? statusOptions[0]}
                  onChange={(selected: SingleValue<SelectOption>) => {
                    setForm((prev) => ({
                      ...prev,
                      status: (selected?.value || 'Active') as 'Active' | 'Disabled' | 'Banned',
                    }));
                  }}
                  menuPlacement="bottom"
                  menuPosition="fixed"
                  maxMenuHeight={220}
                  styles={controlledDropdownStyles}
                />
              </div>
            </div>
          </section>
        </div>

        {/* --- คอลัมน์ขวา: ข้อมูลส่วนตัว (8/12) --- */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* ข้อมูลส่วนตัวบุคคล */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-700" />
              <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">ข้อมูลเจ้าหน้าที่</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">คำนำหน้า</label>
                <select
                  className="w-full p-2 border border-slate-200 rounded text-sm outline-none"
                  value={form.title_code}
                  onChange={(e) => updateField('title_code', e.target.value)}
                >
                  <option value="">เลือกคำนำหน้า</option>
                  {lookups.titles.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">ชื่อ TH</label>
                <input type="text" className="w-full p-2 border border-slate-200 rounded text-sm outline-none" value={form.firstname_th} onChange={(e) => updateField('firstname_th', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">นามสกุล TH</label>
                <input type="text" className="w-full p-2 border border-slate-200 rounded text-sm outline-none" value={form.lastname_th} onChange={(e) => updateField('lastname_th', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">ชื่อภาษาอังกฤษ</label>
                <input type="text" className="w-full p-2 border border-slate-200 rounded text-sm outline-none" value={form.firstname_en} onChange={(e) => updateField('firstname_en', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">นามสกุลภาษาอังกฤษ</label>
                <input type="text" className="w-full p-2 border border-slate-200 rounded text-sm outline-none" value={form.lastname_en} onChange={(e) => updateField('lastname_en', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">เลขบัตรประชาชน</label>
                <input type="text" className="w-full p-2 border border-slate-200 rounded text-sm font-mono outline-none" value={form.cid} onChange={(e) => updateField('cid', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">วันเดือนปีเกิด</label>
                <input type="date" className="w-full p-2 border border-slate-200 rounded text-sm outline-none" value={form.birth_date} onChange={(e) => updateField('birth_date', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">เพศ</label>
                <select className="w-full p-2 border border-slate-200 rounded text-sm outline-none" value={form.sex_id} onChange={(e) => updateField('sex_id', e.target.value)}>
                  <option value="">เลือกเพศ</option>
                  {lookups.sexes.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">สถานภาพสมรส</label>
                <select className="w-full p-2 border border-slate-200 rounded text-sm outline-none" value={form.mstatus} onChange={(e) => updateField('mstatus', e.target.value)}>
                  <option value="">เลือกสถานภาพ</option>
                  {lookups.mstatuses.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {errorMessage && (
            <p className="text-xs text-red-500">{errorMessage}</p>
          )}

          {/* ที่อยู่และการติดต่อ */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-700" />
              <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">ข้อมูลติดต่อและที่อยู่</span>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">เบอร์โทรศัพท์</label>
                  <input type="text" className="w-full p-2 border border-slate-200 rounded text-sm outline-none" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">ที่อยู่โดยละเอียด</label>
                <textarea className="w-full p-3 border border-slate-200 rounded text-sm min-h-[80px] outline-none" value={form.address_detail} onChange={(e) => updateField('address_detail', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">จังหวัด</label>
                  <Select
                    options={provinceOptions}
                    value={provinceOptions.find((item) => item.value === form.province_code) ?? null}
                    onChange={(selected: SingleValue<SelectOption>) => {
                      const nextProvince = selected?.value || '';
                      setForm((prev) => ({
                        ...prev,
                        province_code: nextProvince,
                        district_code: '',
                        subdistrict_code: '',
                      }));
                    }}
                    placeholder="เลือกจังหวัด"
                    isClearable
                    menuPlacement="bottom"
                    menuPosition="fixed"
                    maxMenuHeight={220}
                    styles={controlledDropdownStyles}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">อำเภอ</label>
                  <Select
                    options={districtOptions}
                    value={districtOptions.find((item) => item.value === form.district_code) ?? null}
                    onChange={(selected: SingleValue<SelectOption>) => {
                      const nextDistrict = selected?.value || '';
                      setForm((prev) => ({ ...prev, district_code: nextDistrict, subdistrict_code: '' }));
                    }}
                    placeholder="เลือกอำเภอ"
                    isClearable
                    isDisabled={!form.province_code}
                    menuPlacement="bottom"
                    menuPosition="fixed"
                    maxMenuHeight={220}
                    styles={controlledDropdownStyles}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">ตำบล</label>
                  <Select
                    options={subdistrictOptions}
                    value={subdistrictOptions.find((item) => item.value === form.subdistrict_code) ?? null}
                    onChange={(selected: SingleValue<SelectOption>) => updateField('subdistrict_code', selected?.value || '')}
                    placeholder="เลือกตำบล"
                    isClearable
                    isDisabled={!form.district_code}
                    menuPlacement="bottom"
                    menuPosition="fixed"
                    maxMenuHeight={220}
                    styles={controlledDropdownStyles}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">รหัสไปรษณีย์</label>
                  <input type="number" className="w-full p-2 border border-slate-200 rounded text-sm" value={form.zip_code} onChange={(e) => updateField('zip_code', e.target.value)} />
                  <p className="text-[10px] text-slate-400">กรอกเองชั่วคราว (lookup ปัจจุบันยังไม่มีข้อมูลไปรษณีย์)</p>
                </div>
              </div>
            </div>
          </section>

          {/* วิชาชีพและสิทธิรักษา */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
              <Heart className="h-4 w-4 text-blue-700" />
              <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">ข้อมูลวิชาชีพและสิทธิการรักษา</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">เลขใบประกอบวิชาชีพ</label>
                <input type="text" className="w-full p-2 border border-slate-200 rounded text-sm outline-none" value={form.profession_id} onChange={(e) => updateField('profession_id', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">สิทธิการรักษาหลัก</label>
                <input type="number" className="w-full p-2 border border-slate-200 rounded text-sm outline-none" value={form.current_maininscl} onChange={(e) => updateField('current_maininscl', e.target.value)} />
              </div>
            </div>
          </section>

          {/* 🚩 โซนปุ่มสั่งการ: วางบนพื้นหลังเฉยๆ ต่อท้ายข้อมูลวิชาชีพ ไม่ใส่ Card */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-end gap-3">
            <button
              onClick={handleDeleteUser}
              className="w-full md:w-auto px-6 py-2.5 rounded border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" /> ระงับการใช้งานบัญชีนี้
            </button>
            <div className="flex-1 hidden md:block"></div>
            <button 
              onClick={() => router.back()}
              className="w-full md:w-auto px-8 py-2.5 rounded border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" /> ยกเลิก
            </button>
            <button
              className="w-full md:w-auto px-12 py-2.5 rounded bg-blue-700 text-white font-bold text-sm hover:bg-blue-800 shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={saving || loadingProfile}
            >
              <Save className="h-4 w-4" /> {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}