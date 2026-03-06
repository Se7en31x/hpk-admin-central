import AdminHeader from "@/components/headers/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AdminHeader />
      <main className="flex-grow">{children}</main>
    </div>
  );
}