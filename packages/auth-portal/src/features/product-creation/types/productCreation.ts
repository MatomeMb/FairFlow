import type { MerchantProductApi } from '../../../types/merchant';

export interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (product: MerchantProductApi) => void;
}

export type FormState = {
  title: string;
  description: string;
  priceRands: string;
  price_cents: number | null;
  category: '' | 'coffee' | 'textiles' | 'food' | 'crafts' | 'beauty' | 'other';
  stock_count: string;
  image_url: string;
  shipping_available: boolean;
  certifications: string[];
};

export type FormErrors = {
  title?: string;
  price_cents?: string;
  category?: string;
  stock_count?: string;
  image_url?: string;
};

export type SuccessPayload = {
  title: string;
  price_cents: number;
  matter_uri: string;
  thing_url: string;
  hash: string;
};

export type ProductTemplate = {
  id: string;
  label: string;
  subtitle: string;
  title: string;
  description: string;
  category: FormState['category'];
  priceRands: string;
  stock_count: string;
  shipping_available: boolean;
  certifications: string[];
};
