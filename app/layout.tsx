import type { Metadata } from "next"; // เพิ่ม import นี้
import { Prompt } from "next/font/google";
import "./globals.css";

// --- เพิ่ม Metadata ตรงนี้ ---
export const metadata: Metadata = {
  title: "ระบบบริหารจัดการโรงพยาบาล | HPK-HMS",
  description: "โรงพยาบาลวัดห้วยปลากั้งเพื่อสังคม",
  icons: {
    icon: "/logo/logoHPKnobg.png",
    shortcut: "/logo/logoHPKnobg.png",
    apple: "/logo/logoHPKnobg.png",
  },
};
// -------------------------

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={prompt.variable}>
      <body className={`h-screen flex flex-col bg-gray-200 font-prompt ${prompt.className}`}>
        <div className="flex flex-1 overflow-hidden">
            <main className="flex-1  overflow-y-auto">
              <div className="max-w-8xl mx-auto">{children}</div>
            </main>
        </div>
      </body>
    </html>
  );
}