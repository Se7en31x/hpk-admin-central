'use client';

import { signIn } from 'next-auth/react';
import { Warehouse, HeartHandshake, Pill, ShieldCheck, ExternalLink, LogIn } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Warehouse,
  HeartHandshake,
  Pill,
  ShieldCheck,
};

interface System {
  id: string;
  name: string;
  description: string;
  iconName: string;
  url: string;
  color: string;
}

interface SystemCardProps {
  system: System;
  isAuthenticated: boolean;
}

const colorMap: Record<string, { bg: string; icon: string; border: string }> =
  {
    blue: {
      bg: 'bg-blue-100',
      icon: 'text-blue-600',
      border: 'border-blue-200',
    },
    teal: {
      bg: 'bg-teal-100',
      icon: 'text-teal-600',
      border: 'border-teal-200',
    },
    indigo: {
      bg: 'bg-indigo-100',
      icon: 'text-indigo-600',
      border: 'border-indigo-200',
    },
    slate: {
      bg: 'bg-slate-100',
      icon: 'text-slate-600',
      border: 'border-slate-200',
    },
  };

export default function SystemCard({
  system,
  isAuthenticated,
}: SystemCardProps) {
  const Icon = iconMap[system.iconName] ?? Warehouse;
  const colors = colorMap[system.color] ?? colorMap['blue'];

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border ${colors.border} p-6 flex flex-col gap-4 hover:shadow-md transition-shadow`}
    >
      <div
        className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center`}
      >
        <Icon className={`h-6 w-6 ${colors.icon}`} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-800">{system.name}</h2>
        <p className="text-sm text-slate-500 mt-1">{system.description}</p>
      </div>

      <div className="mt-auto">
        {isAuthenticated ? (
          <a
            href={system.url}
            className="inline-flex items-center gap-2 w-full justify-center bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Enter System
          </a>
        ) : (
          <button
            onClick={() => signIn('zitadel')}
            className="inline-flex items-center gap-2 w-full justify-center bg-slate-100 hover:bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Login
          </button>
        )}
      </div>
    </div>
  );
}
