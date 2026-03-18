import type { FormState, FormErrors } from '../types/productCreation';

export function validateProductForm(form: FormState): FormErrors {
  const nextErrors: FormErrors = {};

  const trimmedTitle = form.title.trim();
  if (!trimmedTitle) {
    nextErrors.title = 'Title is required';
  } else if (trimmedTitle.length > 255) {
    nextErrors.title = 'Title must be 255 characters or less';
  }

  if (form.price_cents === null || !Number.isInteger(form.price_cents) || form.price_cents <= 0) {
    nextErrors.price_cents = 'Price must be greater than 0';
  }

  if (!form.category) {
    nextErrors.category = 'Category is required';
  }

  const stockCountParsed = Number(form.stock_count);
  if (!Number.isInteger(stockCountParsed) || stockCountParsed < 0) {
    nextErrors.stock_count = 'Stock count must be 0 or greater';
  }

  const trimmedImageUrl = form.image_url.trim();
  if (!trimmedImageUrl) {
    nextErrors.image_url = 'Product image is required';
  } else {
    try {
      const parsed = new URL(trimmedImageUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        nextErrors.image_url = 'Image URL must start with http:// or https://';
      }
    } catch {
      nextErrors.image_url = 'Enter a valid image URL';
    }
  }

  return nextErrors;
}
