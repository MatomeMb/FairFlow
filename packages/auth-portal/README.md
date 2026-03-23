# @thingsthatmatter/auth-portal

> Role-based authentication portal for fairflow. Merchant onboarding, admin operations, consumer checkout, and analytics.

## Overview

Auth Portal is the React frontend for the fairflow commerce platform. It provides five specialized portal views for different user roles, complete authentication flows, merchant product management, admin KYC approval, consumer checkout, and analytics dashboards.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS 3 |
| Routing | React Router DOM 7 |
| Database Auth | Supabase Auth |
| Merchant Auth | JWT (shadow-index tokens) |
| Icons | Lucide React |
| Charts | Recharts |

## Features

### Authentication
- **Email/password** registration and login (via shadow-index API)
- **Google OAuth** (redirect to shadow-index, callback returns JWT)
- **Supabase Auth** for admin and consumer portal users
- **Dual authentication** systems: Supabase (portal users) + JWT (API merchants)
- **Session management** with automatic token refresh

### Portals & Roles

| Portal | Role | Features |
|--------|------|----------|
| **Login Page** | Unauthenticated | Email/password login, Google OAuth, merchant registration |
| **Merchant Portal** | Merchant | Product CRUD, order management, KYC submission, payout history, analytics |
| **Admin Portal** | CEO/CTO | KYC approvals, merchant management, user roles, health dashboards, financials |
| **Admin (CEO & CTO)** | CEO / CTO | Same `AdminPortal` at `/dashboard/admin` (legacy `/dashboard/ceo`, `/dashboard/cto` redirect here) |
| **Consumer Shop** | Consumer | Product browsing, search, checkout (Paystack), order history |
| **Investor Portal** | Investor | Financial overview, platform metrics, roadmap, team info |

### Key Pages

- **LoginPage** — Email/password and Google OAuth entry point
- **MerchantRegister** — Self-service merchant signup
- **MerchantLogin** — Merchant email/password login
- **MerchantPortal** — Dashboard with product, order, analytics, KYC, payouts
- **AdminPortal** — Admin dashboard with KYC approvals, user management, health
- **AuthDiagnosticsPage** — CTO/CEO-only auth diagnostics (`/dashboard/cto/auth-diagnostics`)
- **ConsumerShop** — Product catalog with search and checkout
- **InvestorMode** — Investor-facing KPIs and business overview
- **ProductPage** — Product detail page (public, supports checkout)
- **OrderConfirmation** — Order receipt and status
- **LandingPage** — Public landing page

## Design System

### Colors
- **Primary navy:** `#0D1B2A` — Background
- **Secondary navy:** `#1A2D42` — Panels, cards
- **Accent green:** `#1a9e4a` — CTAs, highlights
- **Text:** White on dark backgrounds, `#8A99AA` for muted text
- **Semantic:** Green (success), Red (error), Amber (warning)

### Typography
- **Brand font:** Fraunces (headings)
- **Body font:** DM Sans (text, UI)

### Component Library
- **Badge** — Status indicators (approved, pending, rejected)
- **Card** — Content containers
- **StatusDot** — Visual status indicator
- **MetricCard** — Data display
- **Modal** — Dialogs and overlays

## Project Structure

```
src/
├── pages/                  — Full-screen page components
│   ├── LoginPage.tsx
│   ├── MerchantLogin.tsx
│   ├── MerchantRegister.tsx
│   ├── ProductPage.tsx
│   ├── OrderConfirmation.tsx
│   ├── OrderStatusPage.tsx
│   ├── LandingPage.tsx
│   ├── UnauthorizedPage.tsx
│   ├── ConfirmReceipt.tsx
│   └── portals/            — Role-based portal pages
│       ├── AdminPortal.tsx          — Admin dashboard
│       ├── CEODashboard.tsx         — CEO metrics
│       ├── CTOAdminPanel.tsx        — CTO technical dashboard
│       ├── ConsumerShop.tsx         — Consumer product catalog
│       ├── InvestorMode.tsx         — Investor KPI view
│       ├── MerchantPortal.tsx       — Merchant dashboard
│       └── merchant/                — Merchant features
│           └── (merchant-specific components)
│
├── components/             — Reusable UI components
│   ├── FairflowLogo.tsx
│   ├── layout/             — Layout components
│   └── shared/             — Shared utility components
│
├── features/               — Feature modules
│   ├── admin-portal/       — Admin KYC queue, payouts, hooks
│   ├── merchant-portal/    — Merchant hooks (`useMerchantProducts`, orders, analytics)
│   ├── analytics/          — Shared analytics helpers
│   └── kyc/                — KYC form and workflows (where present)
│
├── router/                 — Route configuration
│   ├── PortalRouter.tsx    — Main router
│   ├── AuthPages.tsx       — Auth route definitions
│   ├── RouteGuard.tsx      — Protected route wrapper
│   └── MerchantPortalGuard.tsx  — Merchant route protection
│
├── context/                — React context
│   ├── AuthContext.tsx     — Authentication state
│   ├── ThemeContext.tsx    — Dark/light theme toggle
│   └── RoleContext.tsx     — User role and permissions
│
├── hooks/                  — Custom React hooks
│   ├── useAuth.ts          — Authentication hook
│   ├── usePortalRole.ts    — Portal role determination
│   ├── useAnalytics.ts     — Analytics data fetching
│   └── useApi.ts           — API communication wrapper
│
├── lib/                    — Utility functions
│   ├── config.ts           — Configuration constants
│   ├── format.ts           — Data formatting (currency, dates)
│   ├── supabase.ts         — Supabase client initialization
│   └── fetch-wrappers.ts   — API request helpers
│
├── design-system/          — Design tokens and primitives
│   ├── colors.ts           — Color palette
│   ├── typography.ts       — Font configuration
│   └── components.ts       — Primitive components
│
├── types/                  — TypeScript definitions
│   ├── api.ts
│   ├── auth.ts
│   └── portal.ts
│
├── test.tsx               — Vitest configuration
├── index.css              — Global styles
├── main.tsx               — Application entry point
└── vite-env.d.ts          — Vite type definitions
```

## Build and Scripts

```bash
# Development
npm run dev              # Start Vite dev server (http://localhost:5178)
npm run preview         # Preview production build locally

# Building
npm run build           # TypeScript check + Vite build (output: dist/)

# Code Quality
npm run type-check     # TypeScript type checking
npm run lint           # ESLint on all TS/TSX files
npm run lint:fix       # Auto-fix lint issues

# Testing
npm test               # Run Vitest suite once
npm test:watch         # Watch mode
npm test:coverage      # Coverage report
```

## Environment Variables

Create a `.env` file with these variables:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API
VITE_API_BASE_URL=http://localhost:3000          # Dev
# VITE_API_BASE_URL=https://api.fairflow.co.za  # Production

# API Key (optional for local dev)
VITE_API_KEY=your-shadow-index-api-key
```

## Authentication Flow

### Supabase Auth (Admin, Consumer, Investor)
1. User enters email + password
2. Supabase Auth API validates credentials
3. Session token stored in Auth Context
4. User is assigned `role` via `user_role` claim or AuthContext
5. `RoleGuard` redirects to appropriate portal

### Merchant JWT Auth (via shadow-index)
1. Merchant clicks "Sign in with Google" or registers with email/password
2. Frontend redirects to `https://api.fairflow.co.za/v1/auth/google` or calls `POST /v1/auth/merchant/login`
3. shadow-index API returns JWT token
4. Frontend stores token in sessionStorage: `merchantToken`
5. All merchant API calls include `Authorization: Bearer <token>`
6. `MerchantPortalGuard` checks for token before rendering MerchantPortal

### Token-Based Redirect
After OAuth or merchant login, the API redirects with a token in the URL:
```
http://localhost:5178/dashboard/merchant?token=eyJhbGc...
```

MerchantPortal component:
1. Extracts token from query params
2. Stores in sessionStorage
3. Uses token for all subsequent API calls via `merchantFetch()`

## Role-Based Access

Routes are defined in `src/router/PortalRouter.tsx`:

- **`/login`**, **`/merchant/login`**, **`/merchant/register`** — Public auth entry
- **`/product/:hash`**, **`/order/*`** — Public product and order pages
- **`/`** — `LandingPage`
- **`/dashboard`** — Redirects by Supabase role (`ceo`/`cto` → `/dashboard/admin`, `merchant` → `/dashboard/merchant`, etc.)
- **`/dashboard/admin`** — `AdminPortal` (CEO & CTO via `RoleGuard`)
- **`/dashboard/ceo`**, **`/dashboard/cto`** — Legacy paths; same `AdminPortal` with role-specific guard
- **`/dashboard/cto/auth-diagnostics`** — `AuthDiagnosticsPage` (CEO/CTO)
- **`/dashboard/merchant`** — `MerchantPortal` behind `MerchantPortalGuard` (merchant JWT or `?token=`)
- **`/dashboard/investor`** — `InvestorMode`
- **`/shop`** — `ConsumerShop`
- **`/auth/callback`** — OAuth return; role redirect

## API Communication

The portal communicates with shadow-index via:

- **Merchant routes:** `merchantFetch()` wrapper (includes JWT token)
- **Admin routes:** Standard `fetch()` to `/v1/admin-proxy/*` with `Authorization: Bearer <Supabase access_token>` (CEO/CTO validated server-side; no client-side admin secret)
- **Public routes:** Standard `fetch()` without auth

Example:

```typescript
// Merchant API call
const products = await merchantFetch('/v1/merchant/products', {
  headers: { 'Content-Type': 'application/json' }
});

// Admin API call (KYC approval) — Supabase session token only; shadow-index uses /v1/admin-proxy
const { data: { session } } = await supabase.auth.getSession();
const accessToken = session?.access_token ?? '';
const result = await fetch(`${API_BASE}/v1/admin-proxy/kyc/approve/${merchantId}`, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ notes: 'Optional approval notes' }),
});
```

## Testing

Vitest tests live next to features, for example:

- `src/features/merchant-portal/hooks/__tests__/useMerchantProducts.test.ts`
- `src/features/merchant-portal/hooks/__tests__/useMerchantAnalytics.test.ts`
- `src/lib/__tests__/merchantTokenStorage.test.ts`

```bash
npm test                  # All tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

## Styling & Design

Global styles are in `index.css`. Component-specific styles use:

- **Tailwind CSS** for utility-first styling
- **CSS Variables** for theme colors
- **Dark mode default** (no light mode toggle currently)

### Adding New Pages

1. Create page component in `src/pages/New.tsx`
2. Add route to `router/PortalRouter.tsx`
3. Optionally wrap with `RoleGuard` or `MerchantPortalGuard` if protected
4. Style with Tailwind classes

### Adding New Components

1. Create component in `src/components/shared/MyComponent.tsx`
2. Add TypeScript interface for props
3. Style with Tailwind + CSS variables
4. Export from `src/components/index.ts`

## Deployment

Frontend is deployed to Vercel as a static site.

**Build:**
```bash
npm run build    # Outputs to dist/
```

**Deployment:**
- Branch `main` auto-deploys to production
- Environment variables set in Vercel dashboard
- Custom domain: `portal.fairflow.co.za`

See [docs/DEPLOYMENT.md](../../docs/DEPLOYMENT.md) for full deployment guide.

## Performance Optimization

- **Code splitting** via Vite (automatic route-based chunks)
- **Lazy loading** for portals and heavy features
- **React.memo** on expensive components
- **useCallback** and **useMemo** to prevent unnecessary re-renders
- **Image optimization** via Cloudflare URL parameters

## Security

- **No secrets in code** — All API keys via environment variables
- **HTTPS only** in production
- **JWT validation** of merchant tokens
- **CORS policy** configured on shadow-index
- **XSS protection** via React's built-in DOM escaping

## Troubleshooting

**Blank page after login?**
- Check browser console for errors
- Verify API_BASE_URL is correct
- Check network tab for failed API calls

**RoleGuard redirecting to /unauthorized?**
- Ensure Supabase auth is configured
- Admin emails must be in AuthContext
- Check user's `user_role` claim in Supabase

**Merchant routes not loading?**
- Verify merchantToken is in sessionStorage
- Check token in URL query params (?token=...)
- Ensure token is valid (not expired)

**Styling looks wrong?**
- Clear browser cache (Cmd+Shift+Delete)
- Rebuild Tailwind CSS (`npm run build`)
- Check dark mode CSS variables are loaded

## Contributing

Please follow [DEVELOPMENT-STANDARDS.md](../../docs/DEVELOPMENT-STANDARDS.md) for:
- Code quality (TypeScript strict mode, ESLint)
- Testing expectations (80%+ coverage on critical paths)
- Git workflow (feature branches, conventional commits)
- PR review checklist

## License

MIT
