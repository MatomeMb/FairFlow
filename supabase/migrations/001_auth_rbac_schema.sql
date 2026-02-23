-- fairflow — Auth & RBAC Schema
-- Migration 001: Create role enum, user_roles, permissions, and helper functions

-- ============================================================
-- STEP 1: Create Role Enum
-- ============================================================

CREATE TYPE public.app_role AS ENUM (
  'ceo',
  'cto',
  'merchant',
  'investor',
  'consumer'
);

-- ============================================================
-- STEP 2: User Roles Table
-- ============================================================

-- Links auth.users to app roles (one user can have one role for now)
CREATE TABLE public.user_roles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         public.app_role NOT NULL,
  assigned_at  timestamptz DEFAULT now(),
  assigned_by  uuid REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- Index for fast lookups
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 3: Role Permissions Table (Granular Access Control)
-- ============================================================

-- Defines what each role can do on each resource
CREATE TABLE public.role_permissions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role         public.app_role NOT NULL,
  resource     text NOT NULL,  -- e.g. 'products', 'financials', 'users', 'analytics'
  can_select   boolean DEFAULT false,
  can_insert   boolean DEFAULT false,
  can_update   boolean DEFAULT false,
  can_delete   boolean DEFAULT false,
  UNIQUE (role, resource)
);

-- Seed default permissions
INSERT INTO public.role_permissions (role, resource, can_select, can_insert, can_update, can_delete) VALUES
  -- CEO: full access
  ('ceo', 'products',   true, true, true, true),
  ('ceo', 'financials', true, true, true, true),
  ('ceo', 'users',      true, true, true, true),
  ('ceo', 'analytics',  true, true, true, true),
  ('ceo', 'merchants',  true, true, true, true),
  -- CTO: full technical access
  ('cto', 'products',   true, true, true, true),
  ('cto', 'users',      true, true, true, true),
  ('cto', 'analytics',  true, true, true, true),
  ('cto', 'merchants',  true, true, true, true),
  ('cto', 'financials', true, false, false, false),
  -- Merchant: own data only
  ('merchant', 'products',  true, true, true, true),
  ('merchant', 'analytics', true, false, false, false),
  ('merchant', 'financials',false, false, false, false),
  -- Investor: read-only traction metrics
  ('investor', 'analytics', true, false, false, false),
  ('investor', 'products',  true, false, false, false),
  ('investor', 'financials',false, false, false, false),
  -- Consumer: browse and purchase
  ('consumer', 'products',  true, false, false, false);

-- ============================================================
-- STEP 4: Authorize Helper Function (used in RLS)
-- ============================================================

-- Reusable function to check role from JWT in RLS policies
CREATE OR REPLACE FUNCTION public.authorize(
  requested_permission text,
  user_role text DEFAULT (auth.jwt() ->> 'user_role')
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.app_role;
  v_resource text;
  v_action text;
  v_result boolean;
BEGIN
  -- Parse 'resource.action' format e.g. 'products.select'
  v_resource := split_part(requested_permission, '.', 1);
  v_action   := split_part(requested_permission, '.', 2);
  v_role     := user_role::public.app_role;

  SELECT
    CASE v_action
      WHEN 'select' THEN can_select
      WHEN 'insert' THEN can_insert
      WHEN 'update' THEN can_update
      WHEN 'delete' THEN can_delete
      ELSE false
    END
  INTO v_result
  FROM public.role_permissions
  WHERE role = v_role AND resource = v_resource;

  RETURN COALESCE(v_result, false);
END;
$$;

-- ============================================================
-- STEP 5: RLS Policies for user_roles table
-- ============================================================

-- Allow users to read their own role
CREATE POLICY "user_roles_select_own"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Allow CEO and CTO to view all roles
CREATE POLICY "user_roles_select_admin"
ON public.user_roles FOR SELECT
USING (
  (auth.jwt() ->> 'user_role') IN ('ceo', 'cto')
);

-- Only CEO can insert/update/delete roles
CREATE POLICY "user_roles_insert_ceo"
ON public.user_roles FOR INSERT
WITH CHECK (
  (auth.jwt() ->> 'user_role') = 'ceo'
);

CREATE POLICY "user_roles_update_ceo"
ON public.user_roles FOR UPDATE
USING (
  (auth.jwt() ->> 'user_role') = 'ceo'
);

CREATE POLICY "user_roles_delete_ceo"
ON public.user_roles FOR DELETE
USING (
  (auth.jwt() ->> 'user_role') = 'ceo'
);

-- ============================================================
-- STEP 6: Role Permissions Table RLS
-- ============================================================

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Anyone can read permissions (needed for frontend role checks)
CREATE POLICY "role_permissions_select_all"
ON public.role_permissions FOR SELECT
USING (true);

-- Only CEO can modify permissions
CREATE POLICY "role_permissions_modify_ceo"
ON public.role_permissions FOR ALL
USING (
  (auth.jwt() ->> 'user_role') = 'ceo'
);

