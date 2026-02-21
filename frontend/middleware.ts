export { default } from 'next-auth/middleware';

export const config = {
  // Add protected route patterns here as needed.
  // Currently the landing page handles auth state itself;
  // use this matcher to enforce auth on additional routes.
  matcher: [],
};
