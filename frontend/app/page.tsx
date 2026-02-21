import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Header from '@/components/Header';
import SystemCard from '@/components/SystemCard';

interface SystemDefinition {
  id: string;
  name: string;
  description: string;
  iconName: string;
  url: string;
  color: string;
}

const systems: SystemDefinition[] = [
  {
    id: 'warehouse',
    name: 'Warehouse System',
    description:
      'Manage medical supplies, inventory tracking, and procurement.',
    iconName: 'Warehouse',
    url: process.env.NEXT_PUBLIC_WAREHOUSE_URL || '#',
    color: 'blue',
  },
  {
    id: 'palliative',
    name: 'Palliative Care',
    description:
      'Patient comfort care, symptom management, and care planning.',
    iconName: 'HeartHandshake',
    url: process.env.NEXT_PUBLIC_PALLIATIVE_URL || '#',
    color: 'teal',
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy System',
    description: 'Medication dispensing, prescriptions, and drug inventory.',
    iconName: 'Pill',
    url: process.env.NEXT_PUBLIC_PHARMACY_URL || '#',
    color: 'indigo',
  },
  {
    id: 'admin',
    name: 'Admin Management',
    description:
      'User accounts, roles, permissions, and system configuration.',
    iconName: 'ShieldCheck',
    url: process.env.NEXT_PUBLIC_ADMIN_URL || '#',
    color: 'slate',
  },
];

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header session={session} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            HPK Hospital Management System
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Centralized portal for all hospital sub-systems.
            {!session && ' Please log in to access the systems.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {systems.map((system) => (
            <SystemCard
              key={system.id}
              system={system}
              isAuthenticated={!!session}
            />
          ))}
        </div>
      </main>

      <footer className="mt-16 py-6 border-t border-slate-200 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} HPK Hospital — Admin Central
      </footer>
    </div>
  );
}
