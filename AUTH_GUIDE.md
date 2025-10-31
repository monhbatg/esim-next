# Authentication Guide

## 🔐 Overview

The eSIM Next application now has a fully functional authentication system with protected routes.

## ✨ Features Implemented

### 1. **Authentication Context** (`contexts/AuthContext.tsx`)
- Manages global authentication state
- Handles login/logout functionality
- Persists user session in localStorage
- Provides `useAuth()` hook for easy access throughout the app

### 2. **Protected Profile Route**
- Profile page is now protected and requires authentication
- Clicking "Profile" in navigation when logged out redirects to login
- After successful login, user is redirected back to the intended page

### 3. **Smart Navigation** (`components/layout/Navigation.tsx`)
- Shows user's name when logged in
- "Sign In" button changes to "Sign Out" after authentication
- Profile link automatically handles authentication check
- Stores intended destination for post-login redirect

### 4. **Enhanced Login Page** (`app/login/page.tsx`)
- Integrates with AuthContext for actual authentication
- Shows error messages for failed login attempts
- Automatically redirects authenticated users
- Redirects to intended page after successful login

### 5. **Protected Route Wrapper** (`components/ProtectedRoute.tsx`)
- Reusable component for protecting any route
- Shows loading state while checking authentication
- Automatically redirects to login if not authenticated
- Stores current path for post-login redirect

## 🚀 How It Works

### User Flow - Not Logged In

1. User clicks "Profile" in navigation
2. System detects user is not authenticated
3. Current path (`/profile`) is stored in sessionStorage
4. User is redirected to `/login`
5. After successful login, user is redirected back to `/profile`

### User Flow - Already Logged In

1. Navigation shows user's name and "Sign Out" button
2. User can access Profile directly
3. Clicking "Sign Out" logs user out and redirects to home

## 🧪 Testing the Authentication

### Test Credentials
Currently using mock authentication - **any email/password combination will work**:

- Email: `test@example.com` (or any email)
- Password: `password` (or any password)

The system will accept any credentials and create a mock user session.

### Test Scenarios

**Scenario 1: Unauthenticated Profile Access**
1. Open the app (not logged in)
2. Click "Profile" in navigation
3. ✅ Should redirect to login page
4. Enter any email/password
5. Click "Sign In"
6. ✅ Should redirect to Profile page

**Scenario 2: Direct Profile URL Access**
1. While logged out, navigate directly to `/profile`
2. ✅ Should see loading spinner briefly
3. ✅ Should redirect to `/login`
4. After login, ✅ should return to `/profile`

**Scenario 3: Already Authenticated**
1. Log in with any credentials
2. ✅ Navigation shows your name and "Sign Out" button
3. Click "Profile" - ✅ Should access directly without redirect
4. Try visiting `/login` - ✅ Should redirect to profile

**Scenario 4: Logout**
1. While logged in, click "Sign Out"
2. ✅ Should log out and redirect to home page
3. ✅ Navigation should show "Sign In" button again

## 💾 Data Persistence

- **localStorage**: Stores user session (persists across page refreshes)
- **sessionStorage**: Stores redirect path (cleared after redirect)

To clear session and start fresh:
```javascript
// In browser console
localStorage.removeItem('user');
sessionStorage.removeItem('redirectAfterLogin');
```

## 🔧 Implementation Details

### Using the Auth Context

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Check if user is logged in
  if (isAuthenticated) {
    console.log('User:', user.name);
  }
  
  // Login
  await login(email, password);
  
  // Logout
  logout();
}
```

### Protecting a Route

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      {/* Your protected content here */}
    </ProtectedRoute>
  );
}
```

### Adding More Protected Routes

To protect additional routes, add them to the navigation items:

```tsx
// components/layout/Navigation.tsx
const navigationItems = [
  { name: 'Home', href: '/', protected: false },
  { name: 'My Orders', href: '/orders', protected: true }, // ← Protected
  // ...
];
```

## 🔮 Future Enhancements

For production, consider adding:

- [ ] Real backend API for authentication
- [ ] JWT token-based authentication
- [ ] Password validation and strength requirements
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Social authentication (OAuth)
- [ ] Multi-factor authentication (MFA)
- [ ] Session timeout handling
- [ ] Remember me functionality
- [ ] Rate limiting on login attempts

## 🔒 Security Notes

**Current Implementation:**
- ⚠️ Mock authentication (any credentials work)
- ⚠️ No password validation
- ⚠️ Client-side only (no backend)
- ⚠️ Data stored in localStorage (not encrypted)

**For Production:**
- ✅ Implement real backend authentication
- ✅ Use secure HTTP-only cookies for tokens
- ✅ Add CSRF protection
- ✅ Implement rate limiting
- ✅ Use HTTPS only
- ✅ Validate and sanitize all inputs
- ✅ Add password hashing (backend)
- ✅ Implement proper session management

## 📝 Files Modified/Created

**New Files:**
- `contexts/AuthContext.tsx` - Authentication context provider
- `components/ProtectedRoute.tsx` - Protected route wrapper
- `AUTH_GUIDE.md` - This documentation

**Modified Files:**
- `app/layout.tsx` - Added AuthProvider wrapper
- `components/layout/Navigation.tsx` - Added auth logic and protected route handling
- `app/login/page.tsx` - Integrated with auth context, added redirects
- `app/profile/page.tsx` - Wrapped with ProtectedRoute component

## 🎯 Usage Summary

1. **Login**: Use any email/password on `/login`
2. **Protected Access**: Profile page requires authentication
3. **Auto-redirect**: System remembers where you wanted to go
4. **Logout**: Click "Sign Out" to clear session
5. **Persistence**: Session survives page refresh

The authentication system is now fully functional and ready for backend integration!

