import PortalHeader from "@/components/headers/PortalHeader";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* <PortalHeader />  */}
      <main>{children}</main>
    </div>
  );
}