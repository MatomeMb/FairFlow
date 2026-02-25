-- Products Table
-- Stores product catalog with ethical scoring
-- Created: Feb 16, 2026

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'inactive')),
  ethical_score INTEGER CHECK (ethical_score >= 1 AND ethical_score <= 5),
  badges TEXT[] DEFAULT ARRAY[]::TEXT[],
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT price_positive CHECK (price > 0),
  CONSTRAINT stock_non_negative CHECK (stock >= 0)
);

-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
-- Merchants can view all products (read-only for browse)
CREATE POLICY "View all products" ON public.products
  FOR SELECT
  USING (true);

-- Merchants can insert their own products
CREATE POLICY "Merchants can create own products" ON public.products
  FOR INSERT
  WITH CHECK (
    auth.uid() = merchant_id AND
    (SELECT role FROM public.user_roles WHERE id = auth.uid()) = 'merchant'
  );

-- Merchants can update their own products
CREATE POLICY "Merchants can update own products" ON public.products
  FOR UPDATE
  USING (auth.uid() = merchant_id)
  WITH CHECK (auth.uid() = merchant_id);

-- Merchants can delete their own products
CREATE POLICY "Merchants can delete own products" ON public.products
  FOR DELETE
  USING (auth.uid() = merchant_id);

-- CTO can manage all products
CREATE POLICY "CTO can manage all products" ON public.products
  USING (
    (SELECT role FROM public.user_roles WHERE id = auth.uid()) = 'cto'
  );

-- Create index for merchant_id queries
CREATE INDEX products_merchant_id_idx ON public.products(merchant_id);
CREATE INDEX products_category_idx ON public.products(category);
CREATE INDEX products_status_idx ON public.products(status);

-- Add comments for documentation
COMMENT ON TABLE public.products IS 'Product catalog with ethical scoring and merchant ownership';
COMMENT ON COLUMN public.products.ethical_score IS 'Rating from 1-5 measuring ethical practices (fair trade, organic, local, etc)';
COMMENT ON COLUMN public.products.badges IS 'Array of tags like Fair Trade, Organic, Local, Vegan for quick filtering';
COMMENT ON COLUMN public.products.status IS 'pending = awaiting approval, active = visible to consumers, inactive = delisted';
