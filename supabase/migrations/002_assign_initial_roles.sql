-- fairflow — Initial Role Assignments
-- Migration 002: Assign roles to founding team members

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

-- Note: Run this migration after users have registered via Supabase Auth
-- If users don't exist yet, this will silently skip (due to ON CONFLICT)

