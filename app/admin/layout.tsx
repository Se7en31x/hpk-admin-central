'use client';

import AdminNavbar from "@/components/ui/AdminNavbar";
import AdminSidebar from "@/components/ui/AdminSidebar";

// Wrapper สำหรับหน้าเนื้อหาเพื่อให้ Scroll ได้อิสระ
function MainContentWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 overflow-y-auto bg-white p-3 md:p-4">
      <div className="w-full">
        {children}
      </div>
    </main>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* ส่วนหัว */}
      <AdminNavbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* เมนูข้าง */}
        <AdminSidebar />
        
        {/* เนื้อหาหน้าลูก */}
        <MainContentWrapper>{children}</MainContentWrapper>
      </div>
    </div>
  );
}