# eSIM Next - Project Structure

This document provides an overview of the project's folder structure and organization.

## 📁 Folder Structure

```
esim-next/
├── app/                          # Next.js App Router
│   ├── about/                    # About page route
│   │   └── page.tsx             # /about - Company information and values
│   ├── login/                    # Authentication route
│   │   └── page.tsx             # /login - User login with social auth
│   ├── marketplace/              # Marketplace route
│   │   └── page.tsx             # /marketplace - Browse and purchase eSIM plans
│   ├── profile/                  # User profile route
│   │   └── page.tsx             # /profile - User dashboard and eSIM management
│   ├── favicon.ico              # Site favicon
│   ├── globals.css              # Global styles and Tailwind directives
│   ├── layout.tsx               # Root layout with Header & Footer
│   └── page.tsx                 # Home page - Landing page with hero and features
│
├── components/                   # Reusable React components
│   ├── layout/                  # Layout components
│   │   ├── Header.tsx           # Site header with branding
│   │   ├── Navigation.tsx       # Main navigation menu
│   │   └── Footer.tsx           # Site footer with links
│   └── ui/                      # UI component library
│       ├── Button.tsx           # Reusable button with variants
│       ├── Card.tsx             # Card container component
│       └── Input.tsx            # Form input with label and error handling
│
├── types/                        # TypeScript type definitions
│   └── index.ts                 # Shared interfaces and types
│
├── public/                       # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── eslint.config.mjs            # ESLint configuration
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies and scripts
├── postcss.config.mjs           # PostCSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Project documentation
```

## 🎨 Design Patterns

### Component Organization

- **Layout Components** (`components/layout/`): Components that define the overall page structure (Header, Footer, Navigation)
- **UI Components** (`components/ui/`): Reusable, atomic components (Button, Card, Input)
- **Page Components** (`app/*/page.tsx`): Route-specific components that compose layouts and UI components

### Routing Structure

All routes use Next.js App Router:

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Landing page with hero, features, and CTAs |
| `/about` | `app/about/page.tsx` | Company information, mission, and statistics |
| `/marketplace` | `app/marketplace/page.tsx` | Browse eSIM plans with filtering |
| `/profile` | `app/profile/page.tsx` | User dashboard with active eSIMs and orders |
| `/login` | `app/login/page.tsx` | Authentication with email and social login |

## 🧩 Component Library

### Button Component
```tsx
<Button variant="primary" size="md">Click Me</Button>
```
- Variants: `primary`, `secondary`, `outline`
- Sizes: `sm`, `md`, `lg`

### Card Component
```tsx
<Card hover>Content</Card>
```
- Optional hover effect
- Consistent styling with dark mode support

### Input Component
```tsx
<Input label="Email" type="email" error="Error message" />
```
- Built-in label support
- Error state handling
- Full dark mode support

## 🎯 TypeScript Types

All shared types are defined in `types/index.ts`:

- **User**: User account information
- **EsimPlan**: eSIM plan details for marketplace
- **ActiveEsim**: Active eSIM with usage data
- **Order**: Purchase order history
- **Region**: Geographic regions for filtering
- **Form Types**: LoginFormData, RegisterFormData
- **API Types**: ApiResponse wrapper

## 🎨 Styling

- **Framework**: Tailwind CSS v4
- **Dark Mode**: Fully supported across all components
- **Responsive**: Mobile-first design approach
- **Color Scheme**: Blue/Cyan gradient for branding

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Start production server:**
   ```bash
   npm start
   ```

## 📝 Best Practices

1. **Component Naming**: Use PascalCase for component files
2. **Client Components**: Add `'use client'` directive when using hooks or browser APIs
3. **Type Safety**: Import types from `types/index.ts` for consistency
4. **Styling**: Use Tailwind utility classes, avoid inline styles
5. **Navigation**: Use Next.js `Link` component for client-side navigation

## 🔄 State Management

Currently using React's built-in state management:
- `useState` for local component state
- `usePathname` for active route detection

For future scaling, consider:
- Context API for global state
- React Query for server state
- Zustand or Redux for complex state management

## 📦 Key Dependencies

- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript 5**: Type safety
- **Tailwind CSS 4**: Utility-first CSS framework
- **ESLint**: Code quality and consistency

## 🎯 Future Enhancements

Potential additions for production:
- [ ] Authentication system (NextAuth.js)
- [ ] Database integration (Prisma + PostgreSQL)
- [ ] Payment processing (Stripe)
- [ ] Email service (SendGrid/Resend)
- [ ] State management (Zustand/Redux)
- [ ] Form validation (Zod + React Hook Form)
- [ ] API routes for backend logic
- [ ] Unit tests (Jest + React Testing Library)
- [ ] E2E tests (Playwright)

## 📧 Support

For questions or issues, refer to the [Next.js documentation](https://nextjs.org/docs).

