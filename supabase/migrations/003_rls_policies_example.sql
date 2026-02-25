-- fairflow — RLS Policies Example
-- Migration 003: Row Level Security for products table

-- This is a template/example - adapt for your actual products table structure
-- Run this AFTER creating your products table

-- ============================================================
-- Example: Products Table RLS
-- ============================================================

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- SELECT: consumers, investors, merchants, ceo, cto can view
CREATE POLICY "products_select_policy"
ON public.products FOR SELECT
USING (
  public.authorize('products.select')
);

-- INSERT: only merchants, cto, ceo
CREATE POLICY "products_insert_policy"
ON public.products FOR INSERT
WITH CHECK (
  public.authorize('products.insert')
);

-- UPDATE: merchants (own products only), cto, ceo
-- Assumes products table has a merchant_id column
CREATE POLICY "products_update_policy"
ON public.products FOR UPDATE
USING (
  public.authorize('products.update') AND
  (
    (auth.jwt() ->> 'user_role') IN ('ceo', 'cto') OR
    merchant_id = auth.uid()
  )
);

-- DELETE: cto, ceo only
CREATE POLICY "products_delete_policy"
ON public.products FOR DELETE
USING (
  public.authorize('products.delete')
);

-- ============================================================
-- Example: Financials Table RLS (CEO-only sensitive data)
-- ============================================================

-- Assuming you have a financials table
-- ALTER TABLE public.financials ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "financials_select_ceo"
-- ON public.financials FOR SELECT
-- USING (
--   public.authorize('financials.select')
-- );

-- CREATE POLICY "financials_modify_ceo"
-- ON public.financials FOR ALL
-- USING (
--   (auth.jwt() ->> 'user_role') = 'ceo'
-- );

-- ============================================================
-- Example: Analytics Table RLS
-- ============================================================

-- Investors and management can view analytics
-- ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "analytics_select_policy"
-- ON public.analytics_events FOR SELECT
-- USING (
--   public.authorize('analytics.select')
-- );

-- Only system/admin can insert analytics
-- CREATE POLICY "analytics_insert_policy"
-- ON public.analytics_events FOR INSERT
-- WITH CHECK (
--   (auth.jwt() ->> 'user_role') IN ('ceo', 'cto')
-- );

-- ============================================================
-- NOTES
-- ============================================================
-- 1. Create these policies AFTER your tables exist
-- 2. Adjust merchant_id column references to match your schema
-- 3. Test policies in Supabase Studio → SQL Editor with different roles
-- 4. Use `SELECT auth.jwt()` to debug the JWT claims in SQL queries

