-- fairflow — Initial Role Assignments
-- Migration 002: Assign roles to founding / bootstrap admin accounts
--
-- IMPORTANT: Replace the placeholder emails below with the accounts you
-- created in Supabase Auth before running this migration in a real project.
-- Do not commit production personal emails to a public repository.

-- Assign CEO role (replace with your CEO auth user email)
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'ceo@example.com'),
  'ceo'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Assign CTO role (replace with your CTO auth user email)
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'cto@example.com'),
  'cto'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Note: Run this migration after users have registered via Supabase Auth.
-- If users don't exist yet, the SELECT returns NULL and the insert is skipped
-- only when you wrap it; otherwise ensure users exist first.
