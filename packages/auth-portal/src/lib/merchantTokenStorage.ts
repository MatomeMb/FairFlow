const KEY = 'merchantToken';

export const getMerchantToken = (): string | null =>
  sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY);

export const setMerchantToken = (token: string): void => {
  sessionStorage.setItem(KEY, token);
};

export const clearMerchantToken = (): void => {
  sessionStorage.removeItem(KEY);
  localStorage.removeItem(KEY);
};
