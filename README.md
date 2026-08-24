# 🏥 HPK Admin Central — Frontend

> ระบบ Portal กลาง และหน้า Admin Dashboard สำหรับบริหารจัดการผู้ใช้งานระบบโรงพยาบาลวัดห้วยปลากั้งเพื่อสังคม  
> เป็นส่วน Frontend ของโปรเจกต์ **HPK Hospital Management System (HPK-HMS)**

![Next.js](https://img.shields.io/badge/Next.js-16.x-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20SSR-3FCF8E?logo=supabase&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)

---

## 📋 สารบัญ

- [ภาพรวมโปรเจกต์](#-ภาพรวมโปรเจกต์)
- [ฟีเจอร์หลัก](#-ฟีเจอร์หลัก)
- [สถาปัตยกรรมระบบ](#-สถาปัตยกรรมระบบ)
- [Tech Stack](#-tech-stack)
- [โครงสร้างโปรเจกต์](#-โครงสร้างโปรเจกต์)
- [การติดตั้งและรัน](#-การติดตั้งและรัน)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Related Repositories](#-related-repositories)

---

## 🎯 ภาพรวมโปรเจกต์

**HPK-HMS (Hospital Management System)** คือระบบสารสนเทศแบบ Microservice สำหรับโรงพยาบาลวัดห้วยปลากั้ง ประกอบด้วยหลายโมดูลย่อย เช่น คลังยา, จ่ายยา, ชีวาภิบาล, ทันตกรรม, OPD และ ส่วนบริหาร

**Repository นี้** ทำหน้าที่เป็น **2 ระบบหลัก**:

### 1. 🌐 Unified Portal (หน้าหลัก)
หน้า Landing Page ที่ผู้ใช้ทุกคนเห็นหลัง Login — แสดงเมนูระบบทั้งหมดที่ได้รับสิทธิ์เข้าถึง (SSO Gateway)

### 2. 🛡️ Admin Dashboard
ระบบจัดการผู้ใช้งาน สิทธิ์การเข้าถึง โดยเฉพาะสำหรับ Admin

---

## ✨ ฟีเจอร์หลัก

| ฟีเจอร์ | รายละเอียด |
|---|---|
| 🌐 **SSO Portal** | หน้าหลักแสดงระบบทั้งหมด, ตรวจสอบสิทธิ์จาก `app_metadata` ก่อน redirect |
| 🔐 **Supabase Auth (SSR)** | Authentication ผ่าน middleware, แชร์ Cookie ข้าม subdomain (`.hpk-hms.site`) |
| 👤 **User Management** | ดูรายชื่อ, ค้นหา, กรอง, สร้างบัญชีใหม่, แก้ไข, รีเซ็ตรหัสผ่าน |
| 🎨 **Modern UI** | Tailwind CSS 4, Lucide Icons, SweetAlert2, Sonner Toast, Google Fonts (Prompt) |
| 📱 **Responsive** | รองรับ Desktop + Mobile, Sidebar/Navbar แยก layout |
| 🐳 **Docker Ready** | Multi-stage Dockerfile สำหรับ Next.js Standalone mode |
| 🔄 **Cross-domain SSO** | Cookie sharing ข้าม subdomain สำหรับ production |

---

## 🏗 สถาปัตยกรรมระบบ

```
┌─────────────────────────────────────────────────────┐
│                  HPK-HMS Platform                    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │        hpk-admin-central (◀ THIS ▶)         │    │
│  │                                             │    │
│  │  ┌─────────────┐    ┌──────────────────┐   │    │
│  │  │   Portal    │    │  Admin Dashboard │   │    │
│  │  │  (SSO Hub)  │    │ (User Mgmt UI)  │   │    │
│  │  └──────┬──────┘    └───────┬──────────┘   │    │
│  │         │                   │              │    │
│  │         ▼                   ▼              │    │
│  │   Redirect ไปยัง      hpk-admin-api       │    │
│  │   ระบบย่อยต่างๆ       (REST API)          │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │
│  │Warehouse │ │ Dispense │ │   Palliative     │    │
│  │   Web    │ │   Web    │ │      Web         │    │
│  └──────────┘ └──────────┘ └──────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │     Supabase (PostgreSQL + Auth + RLS)      │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### SSO Flow (Single Sign-On)

```
User Login → Supabase Auth → Cookie Set (.hpk-hms.site)
         → Portal Page → Check app_metadata.systems
         → Redirect ไปยังระบบย่อย (Cookie ถูกแชร์ข้าม subdomain)
```

### Page Architecture

```
app/
├── page.tsx              → Unified Portal (SSO Gateway)
├── login/                → Login page
├── admin/
│   ├── layout.tsx        → Admin shell (Navbar + Sidebar)
│   ├── page.tsx          → Admin Dashboard
│   └── users/
│       ├── page.tsx      → User list + search + filter
│       ├── create/       → Create new user form
│       └── [id]/         → User detail/edit
└── services/
    └── auth.service.ts   → Auth utility functions
```

---

## 🛠 Tech Stack

| ด้าน | เทคโนโลยี |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5.x |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 4.x |
| **Authentication** | Supabase SSR (`@supabase/ssr`) |
| **Icons** | Lucide React |
| **Notifications** | Sonner (Toast) + SweetAlert2 (Dialog) |
| **Form Select** | React Select |
| **Font** | Google Fonts — Prompt (Thai + Latin) |
| **Container** | Docker (Multi-stage, Standalone mode) |
| **Deployment** | Docker / Vercel / Self-hosted |

---

## 📁 โครงสร้างโปรเจกต์

```
hpk-admin-central/
├── app/
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout (Prompt font, metadata)
│   ├── loading.tsx               # Global loading skeleton
│   ├── page.tsx                  # 🌐 Unified Portal (SSO Gateway)
│   ├── login/                    # Login page
│   ├── admin/
│   │   ├── layout.tsx            # Admin shell (Navbar + Sidebar)
│   │   ├── page.tsx              # Admin Dashboard
│   │   └── users/
│   │       ├── page.tsx          # User management (list, search, filter)
│   │       ├── create/           # Create new user
│   │       └── [id]/             # User detail / edit
│   └── services/
│       └── auth.service.ts       # Auth utilities
├── components/
│   └── ui/
│       ├── AdminNavbar.tsx       # Top navigation bar
│       └── AdminSidebar.tsx      # Side navigation menu
├── utils/
│   └── supabase/
│       └── client.ts             # Supabase browser client (cookie config)
├── types/                        # TypeScript type definitions
├── middleware.ts                  # Auth middleware (cookie domain sharing)
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Docker Compose config
├── tailwind.config.ts            # Tailwind CSS configuration
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json
```

---

## 🚀 การติดตั้งและรัน

### Prerequisites

- Node.js ≥ 22.x
- npm ≥ 10.x

### Installation

```bash
# Clone repository
git clone https://github.com/Se7en31x/hpk-admin-central.git
cd hpk-admin-central

# Install dependencies
npm install

# Run development server
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`

### Available Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `next dev` | Development server (hot-reload) |
| `npm run build` | `next build` | Production build |
| `npm start` | `next start` | Start production server |
| `npm run lint` | `eslint` | Run ESLint |

---

## 🔐 Environment Variables

สร้างไฟล์ `.env.local` ที่ root ของโปรเจกต์:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# System URLs (SSO Redirect Targets)
NEXT_PUBLIC_URL_ADMIN=http://localhost:3000
NEXT_PUBLIC_URL_WAREHOUSE=http://localhost:3001
NEXT_PUBLIC_URL_DISPENSE=http://localhost:3002
NEXT_PUBLIC_URL_CHEEWABHIBALN=http://localhost:3005

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

> ⚠️ ไฟล์ `.env*` ทั้งหมดถูก gitignore แล้ว — ไม่มีข้อมูลลับหลุดใน repository

---

## 🐳 Deployment

### Docker

```bash
# Build
docker build -t hpk-admin-central .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... \
  hpk-admin-central
```

### Docker Compose

```bash
docker-compose up -d
```

### Production Notes

- ใช้ Next.js **Standalone output** mode สำหรับ Docker (image size เล็ก)
- Multi-stage build (3 stages: dependencies → builder → runner)
- รันด้วย non-root user เพื่อความปลอดภัย
- Cookie domain `.hpk-hms.site` สำหรับ cross-subdomain SSO

---

## 🔗 Related Repositories

| Repository | Description | Tech |
|---|---|---|
| [hpk-admin-api](https://github.com/Se7en31x/hpk-admin-api) | ⚙️ Admin Backend API — User CRUD, Auth management | Express 5, Prisma, Supabase |
| hpk-warehouse-api | 📦 Warehouse Backend API | Express, Prisma |
| hpk-warehouse-web | 📦 Warehouse Frontend | Next.js, TypeScript |

---

## 👤 ผู้พัฒนา

พัฒนาภายใต้โปรเจกต์ **Final Project** — ระบบสารสนเทศโรงพยาบาลวัดห้วยปลากั้งเพื่อสังคม

---

<p align="center">
  <sub>Built with ❤️ using Next.js + Supabase + Tailwind CSS</sub>
</p>
