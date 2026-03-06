'use client'
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="p-8">
        <p>ยินดีต้อนรับคุณ {session.user?.name}</p>
        <p>แผนกของคุณคือ: {session.user?.dept_code || "ยังไม่ได้ระบุ"}</p>
        <button 
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">ระบบ HPK Hospital</h1>
      <button 
        onClick={() => signIn("zitadel")}
        className="bg-[#355872] text-white px-6 py-2 rounded-lg hover:bg-[#2a455a]"
      >
        เข้าสู่ระบบด้วย ZITADEL
      </button>
    </div>
  );
}