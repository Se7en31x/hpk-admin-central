'use server';

import { signIn, signOut } from '@logto/next/server-actions';
import { logtoConfig } from '../lib/logto';

export const handleSignIn = async () => {
  await signIn(logtoConfig, { redirectUri: 'http://localhost:3000/api/auth/callback' });
};

export const handleSignOut = async () => {
  await signOut(logtoConfig);
};