# Supabase Setup Guide — Step-by-Step
**fairflow** Auth & RBAC System

**Your Project:** https://uxvmiyeulgenvxzaobdw.supabase.co

---

## Step 1: Run Database Migrations

### 1.1 Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: `uxvmiyeulgenvxzaobdw`
3. In the left sidebar, click **SQL Editor**
4. Click **+ New query** button

### 1.2 Run Migration 001 (Schema & Permissions)

1. Open file: `mcj/supabase/migrations/001_auth_rbac_schema.sql`
2. Copy the ENTIRE contents
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)
5. ✅ Wait for success message

**What this does:**
- Creates `app_role` enum (ceo, cto, merchant, investor, consumer)
- Creates `user_roles` table
- Creates `role_permissions` table with default permissions
- Creates `authorize()` helper function for RLS
- Sets up RLS policies on the tables

### 1.3 Run Migration 002 (Initial Role Assignments)

1. Open file: `mcj/supabase/migrations/002_assign_initial_roles.sql`
2. Copy the contents
3. Paste into a **new query** in SQL Editor
4. Click **Run**

**Note:** This will only work AFTER you've registered users via Supabase Auth with emails:
- `sobuhle@fairflow.co.za` (CEO)
- `matome@fairflow.co.za` (CTO)

If users don't exist yet, this migration will silently do nothing. You can run it again later after creating the accounts.

### 1.4 Verify Tables Were Created

1. In left sidebar, click **Table Editor**
2. You should see new tables:
   - `user_roles`
   - `role_permissions`
3. Click into `role_permissions` — you should see 16 rows of permissions

---

## Step 2: Deploy Edge Function (Custom Access Token Hook)

### Option A: Using Supabase CLI (Recommended)

**Prerequisites:** Install Supabase CLI if you haven't:
```bash
# Windows (PowerShell)
scoop install supabase

# Or download from: https://github.com/supabase/cli/releases
```

**Deploy the function:**

1. Open terminal in project root:
```bash
cd c:\Users\matom\.cursor\worktrees\.fairflow\mcj
```

2. Login to Supabase:
```bash
supabase login
```

3. Link to your project:
```bash
supabase link --project-ref uxvmiyeulgenvxzaobdw
```

4. Deploy the Edge Function:
```bash
supabase functions deploy custom-access-token-hook --no-verify-jwt
```

5. ✅ Wait for success message

### Option B: Using Supabase Dashboard (Manual Upload)

If you don't have CLI installed:

1. Go to **Edge Functions** in left sidebar
2. Click **Create a new function**
3. Function name: `custom-access-token-hook`
4. Copy code from `mcj/supabase/functions/custom-access-token-hook/index.ts`
5. Paste into the editor
6. Click **Deploy**

---

## Step 3: Register the Custom Access Token Hook

**This is the critical step that injects role into JWT!**

1. In Supabase Dashboard, go to **Authentication** (left sidebar)
2. Click **Hooks** tab
3. Find **Custom Access Token Hook** section
4. Toggle it to **Enabled**
5. In the dropdown, select: `custom-access-token-hook`
6. Click **Save**

✅ Now every login will inject the user's role into the JWT!

---

## Step 4: Enable Google OAuth (Optional but Recommended)

1. Still in **Authentication**, click **Providers** tab
2. Find **Google** in the list
3. Toggle **Enable Google Provider** to ON
4. You'll need Google OAuth credentials:

### Get Google OAuth Credentials:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create a new project (or use existing)
3. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
4. Application type: **Web application**
5. Name: `fairflow Auth`
6. Authorized redirect URIs, add:
   ```
   https://uxvmiyeulgenvxzaobdw.supabase.co/auth/v1/callback
   ```
7. Click **Create**
8. Copy **Client ID** and **Client Secret**

### Configure in Supabase:

1. Back in Supabase **Authentication → Providers → Google**
2. Paste **Client ID** (authorized)
3. Paste **Client Secret** (authorized)
4. Click **Save**

---

## Step 5: Create Test Users

### Option A: Via Email/Password

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Select **Create new user**
4. Email: `matome@fairflow.co.za`
5. Password: (choose a strong password)
6. Check **Auto Confirm User**
7. Click **Create User**
8. Repeat for `sobuhle@fairflow.co.za`

### Option B: Via Sign-Up Form (Better)

Just use the auth portal login page and sign up normally — users will be created automatically.

---

## Step 6: Assign Roles to Users

After users are created, run this in **SQL Editor**:

```sql
-- Assign CEO role to Sobuhle
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'sobuhle@fairflow.co.za'),
  'ceo'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Assign CTO role to Matome
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'matome@fairflow.co.za'),
  'cto'
)
ON CONFLICT (user_id, role) DO NOTHING;
```

✅ These users will now get redirected to CEO and CTO dashboards on login!

---

## Step 7: Test the Auth Flow

1. Start the auth portal:
```bash
cd packages/auth-portal
npm run dev
```

2. Open: http://localhost:5178

3. Click **Sign in with Google** (or use email/password)

4. After login, you should be redirected to the appropriate dashboard based on your role

5. **Verify JWT contains role:**
   - Open browser DevTools (F12)
   - Go to **Console** tab
   - Type:
   ```javascript
   const token = JSON.parse(localStorage.getItem('sb-uxvmiyeulgenvxzaobdw-auth-token')).access_token;
   console.log(jwt_decode(token));
   ```
   - You should see `user_role` in the claims!

---

## Troubleshooting

### "User not found" when assigning roles
**Fix:** Create the user first via Authentication → Users or sign them up via the app

### JWT doesn't contain user_role
**Fix:** Make sure Custom Access Token Hook is enabled and deployed. Try logging out and back in.

### Google OAuth redirect fails
**Fix:** Double-check the redirect URI matches exactly in Google Console and includes the `/auth/v1/callback` path

### Edge Function deploy fails
**Fix:** Make sure you're logged in (`supabase login`) and linked to the correct project (`supabase link`)

### RLS blocks everything
**Fix:** Check that you ran migration 001 completely and refresh your database connection

---

## Quick Verification Checklist

- [ ] Migration 001 ran successfully (tables created)
- [ ] Migration 002 ran (will assign roles when users exist)
- [ ] Edge Function deployed
- [ ] Custom Access Token Hook enabled and linked to function
- [ ] Test users created (Sobuhle & Matome)
- [ ] Roles assigned via SQL
- [ ] Auth portal running (npm run dev)
- [ ] Login redirects to correct portal
- [ ] JWT contains user_role claim

---

## Expected Results by Role

| User Email | Role | Redirects To | Can Access |
|------------|------|--------------|------------|
| sobuhle@... | CEO | `/dashboard/ceo` | Everything |
| matome@... | CTO | `/dashboard/cto` | Tech admin |
| merchant@... | Merchant | `/dashboard/merchant` | Own products |
| investor@... | Investor | `/dashboard/investor` | Read-only metrics |
| consumer@... | Consumer | `/shop` | Browse & purchase |

---

**Need Help?** Check:
- Supabase Dashboard → Logs (for Edge Function errors)
- Browser Console (for frontend errors)
- SQL Editor → Run `SELECT * FROM user_roles;` to verify role assignments

**Ready to demo once all steps complete!** ✅


