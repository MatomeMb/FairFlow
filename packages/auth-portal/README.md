# fairflow — Auth & RBAC Portal

Complete authentication and role-based access control system for **fairflow**.

## Stack

- **Frontend:** React + TypeScript + Vite
- **Auth:** Supabase Auth + Custom JWT Claims
- **Routing:** React Router v6 with role guards
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (via Supabase)

## Roles

| Role | Access Level | Portal Route |
|------|-------------|--------------|
| CEO | Full platform access (financials, users, analytics) | `/dashboard/ceo` |
| CTO | Technical admin (users, analytics, products) | `/dashboard/cto` |
| Merchant | Product management & sales data | `/dashboard/merchant` |
| Investor | Read-only traction metrics | `/dashboard/investor` |
| Consumer | Browse and purchase | `/shop` |

## Setup

### 1. Install Dependencies

Already installed via npm. If needed:

```bash
npm install
```

### 2. Configure Environment

Create `.env.local` (copy from `.env.example`):

```bash
cp .env.example .env.local
```

Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Run Database Migrations

In Supabase SQL Editor, run migrations in order:

1. `supabase/migrations/001_auth_rbac_schema.sql` — Creates tables, enums, RLS
2. `supabase/migrations/002_assign_initial_roles.sql` — Assigns CEO/CTO roles
3. `supabase/migrations/003_rls_policies_example.sql` — Template for table-specific RLS

### 4. Deploy Edge Function

```bash
cd ../..
supabase functions deploy custom-access-token-hook --no-verify-jwt
```

Then register it in **Supabase Dashboard → Auth → Hooks**:
- Hook type: **Custom Access Token**
- Function: `custom-access-token-hook`

### 5. Start Dev Server

```bash
npm run dev
```

Portal will run on **http://localhost:5178**

## Usage

### Login Flow

1. User signs in via Google OAuth or email/password
2. Supabase Edge Function injects `user_role` claim into JWT
3. Frontend decodes JWT and extracts role
4. Router redirects to appropriate portal based on role
5. `RoleGuard` components protect routes from unauthorized access

### Testing Different Roles

Assign roles via Supabase SQL Editor:

```sql
-- Make a user a merchant
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@example.com'),
  'merchant'
)
ON CONFLICT (user_id, role) DO NOTHING;
```

Then log in as that user to see the merchant portal.

## File Structure

```
src/
├── context/
│   └── AuthContext.tsx          # Auth state & JWT decoding
├── types/
│   └── auth.ts                  # TypeScript interfaces
├── lib/
│   └── supabase.ts              # Supabase client
├── components/
│   └── RoleGuard.tsx            # Route protection
├── router/
│   └── PortalRouter.tsx         # Role-based routing
├── pages/
│   ├── LoginPage.tsx
│   ├── UnauthorizedPage.tsx
│   └── portals/
│       ├── CEODashboard.tsx
│       ├── CTOAdminPanel.tsx
│       ├── MerchantPortal.tsx
│       ├── InvestorMode.tsx
│       └── ConsumerShop.tsx
├── main.tsx                     # App entry point
└── index.css                    # Tailwind imports
```

## Security Features

✅ Row Level Security (RLS) on all tables  
✅ JWT-based role verification  
✅ Frontend route guards  
✅ Supabase Edge Function for custom claims  
✅ Granular permissions via `role_permissions` table  
✅ Helper function `authorize()` for RLS policies  

## Next Steps

1. Connect to real Supabase project (replace placeholder env vars)
2. Test Google OAuth flow (configure in Supabase Dashboard → Auth → Providers)
3. Create actual product/financial/analytics tables
4. Apply RLS policies from `003_rls_policies_example.sql`
5. Build out portal features (product upload, analytics charts, etc.)
6. Deploy to production (Vercel/Netlify/GitHub Pages)

## Deployment

```bash
npm run build
```

Output goes to `dist/` — deploy to any static host.

---

**Ref:** Monday Meeting Brief (Feb 16, 2026) — Ent-02/Ent-03/Ent-04  
**CTO Office:** Matome Mbowene
