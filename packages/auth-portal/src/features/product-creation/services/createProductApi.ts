import { apiBase } from '../../../lib/config';
import type { FormState, SuccessPayload } from '../types/productCreation';
import type { MerchantProductApi } from '../../../types/merchant';

export type SubmitProductResult = {
  success: boolean;
  product?: MerchantProductApi;
  payload?: SuccessPayload;
  error?: string;
};

export type UploadImageResult = {
  success: boolean;
  image_url?: string;
  error?: string;
};

export async function submitProductForm(form: FormState): Promise<SubmitProductResult> {
  try {
    const response = await fetch(`${apiBase}/v1/merchant/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-merchant-id': 'dev-merchant-001',
        // 'x-api-key': apiKey,
      },
      body: JSON.stringify({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        price_cents: form.price_cents,
        category: form.category,
        stock_count: Number(form.stock_count),
        image_url: form.image_url.trim(),
        shipping_available: form.shipping_available,
        certifications: form.certifications,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data?.message || 'Failed to create product' };
    }

    const thing = data?.thing_file;
    if (thing?.matter_uri && thing?.thing_url && thing?.hash) {
      const payload: SuccessPayload = {
        title: data.title,
        price_cents: data.price_cents,
        matter_uri: thing.matter_uri,
        thing_url: thing.thing_url,
        hash: thing.hash,
      };
      return { success: true, product: data as MerchantProductApi, payload };
    }

    return { success: true, product: data as MerchantProductApi };
  } catch {
    return { success: false, error: 'Network error while creating product' };
  }
}

export async function uploadProductImage(file: File, token?: string | null): Promise<UploadImageResult> {
  try {
    const headers: { [key: string]: string } = { 'x-merchant-id': 'dev-merchant-001' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = new FormData();
    payload.append('image', file);

    const response = await fetch(`${apiBase}/v1/merchant/uploads/image`, {
      method: 'POST',
      headers,
      body: payload,
    });
    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.image_url || typeof data.image_url !== 'string') {
      return { success: false, error: data?.message || 'Failed to upload image' };
    }

    return { success: true, image_url: data.image_url } as UploadImageResult;
  } catch {
    return { success: false, error: 'Network error while uploading image' };
  }
}
