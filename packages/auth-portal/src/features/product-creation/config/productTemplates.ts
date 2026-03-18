import type { ProductTemplate, FormState } from '../types/productCreation';

export const CATEGORY_OPTIONS = ['coffee', 'textiles', 'food', 'crafts', 'beauty', 'other'] as const;
export const CERTIFICATION_OPTIONS = ['fair-trade', 'organic', 'b-corp', 'handmade'] as const;

export const PRODUCT_TEMPLATES: ProductTemplate[] = [
  {
    id: 'coffee-kit',
    label: 'Coffee Starter Kit',
    subtitle: 'Coffee',
    title: 'Single-Origin Starter Kit',
    description: 'Freshly roasted single-origin beans with brew guide and reusable filter.',
    category: 'coffee',
    priceRands: '299.00',
    stock_count: '25',
    shipping_available: true,
    certifications: ['fair-trade', 'organic'],
  },
  {
    id: 'artisan-textile',
    label: 'Artisan Textile',
    subtitle: 'Textiles',
    title: 'Handwoven Table Runner',
    description: 'Locally handwoven textile with natural dyes and premium finishing.',
    category: 'textiles',
    priceRands: '420.00',
    stock_count: '14',
    shipping_available: true,
    certifications: ['handmade'],
  },
  {
    id: 'beauty-bundle',
    label: 'Beauty Bundle',
    subtitle: 'Beauty',
    title: 'Botanical Skin Bundle',
    description: 'Daily cleanser, hydration mist, and moisturizer made with plant-based ingredients.',
    category: 'beauty',
    priceRands: '365.00',
    stock_count: '18',
    shipping_available: true,
    certifications: ['organic'],
  },
];

export const INITIAL_STATE: FormState = {
  title: '',
  description: '',
  priceRands: '',
  price_cents: null,
  category: '',
  stock_count: '0',
  image_url: '',
  shipping_available: false,
  certifications: [],
};
