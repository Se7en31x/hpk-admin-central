'use client';

import { Session } from 'next-auth';
import { signIn, signOut } from 'next-auth/react';
import { LogIn, LogOut, Hospital } from 'lucide-react';

interface HeaderProps {
  session: Session | null;
}

export default function Header({ session }: HeaderProps) {
  return (
    <header className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Hospital className="h-7 w-7 text-blue-300" />
          <span className="text-xl font-bold tracking-tight">
            HPK Admin Central
          </span>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <span className="text-blue-200 text-sm hidden sm:block">
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn('zitadel')}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
