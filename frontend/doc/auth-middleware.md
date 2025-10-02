# Authentication Middleware

Simple route protection for AssetsUp. Redirects unauthenticated users to `/signin` and preserves their intended destination.

## Quick Start

The middleware checks for an `auth-token` cookie and protects routes listed in the `PROTECTED` array.

```typescript
const PROTECTED = ['/dashboard', '/assets', '/departments', '/users'];
const AUTH_PAGES = ['/signin', '/signup'];
```

## How It Works

1. Protected route + no token → Redirect to `/signin?redirect={pathname}`
2. Auth page + has token → Redirect to `/dashboard`
3. Everything else → Allow

## Adding Routes

**New protected route:**

```typescript
const PROTECTED = ['/dashboard', '/assets', '/reports']; // Add here

export const config = {
  matcher: ['/dashboard/:path*', '/assets/:path*', '/reports/:path*'], // Add here
};
```

**New auth page:**

```typescript
const AUTH_PAGES = ['/signin', '/signup', '/forgot-password']; // Add here

export const config = {
  matcher: [..., '/forgot-password'], // Add here
};
```

## Using Redirect in Login Page

```typescript
'use client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const redirectUrl = useSearchParams().get('redirect') || '/dashboard';

  const handleLogin = async () => {
    // ... login logic
    router.push(redirectUrl);
    router.refresh(); // Important: refresh to update middleware state
  };
}
```

## Setting the Auth Token

```typescript
// app/api/auth/login/route.ts
import { cookies } from 'next/headers';

cookies().set('auth-token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
});
```

## Logout

```typescript
// app/api/auth/logout/route.ts
import { cookies } from 'next/headers';

cookies().delete('auth-token');
```

## Testing Checklist

- [ ] `/dashboard` without token → redirects to `/signin?redirect=/dashboard`
- [ ] `/dashboard` with token → loads successfully
- [ ] `/signin` with token → redirects to `/dashboard`
- [ ] Login → redirects to original destination
