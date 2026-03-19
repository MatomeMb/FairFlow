import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getMerchantToken, setMerchantToken, clearMerchantToken } from '../merchantTokenStorage';

describe('merchantTokenStorage', () => {
  const STORAGE_KEY = 'merchantToken';

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  describe('getMerchantToken', () => {
    it('should return null when no token exists in storage', () => {
      const token = getMerchantToken();
      expect(token).toBeNull();
    });

    it('should return token from sessionStorage when present', () => {
      sessionStorage.setItem(STORAGE_KEY, 'session-token-123');
      const token = getMerchantToken();
      expect(token).toBe('session-token-123');
    });

    it('should fall back to localStorage when sessionStorage is empty', () => {
      localStorage.setItem(STORAGE_KEY, 'local-token-456');
      const token = getMerchantToken();
      expect(token).toBe('local-token-456');
    });

    it('should prefer sessionStorage over localStorage', () => {
      sessionStorage.setItem(STORAGE_KEY, 'session-token');
      localStorage.setItem(STORAGE_KEY, 'local-token');
      const token = getMerchantToken();
      expect(token).toBe('session-token');
    });
  });

  describe('setMerchantToken', () => {
    it('should store token in sessionStorage', () => {
      const setSpy = vi.spyOn(window.sessionStorage.__proto__, 'setItem');
      setMerchantToken('new-token-789');
      expect(setSpy).toHaveBeenCalledWith(STORAGE_KEY, 'new-token-789');
      expect(sessionStorage.getItem(STORAGE_KEY)).toBe('new-token-789');
    });

    it('should overwrite existing token', () => {
      sessionStorage.setItem(STORAGE_KEY, 'old-token');
      setMerchantToken('new-token');
      expect(sessionStorage.getItem(STORAGE_KEY)).toBe('new-token');
    });
  });

  describe('clearMerchantToken', () => {
    it('should remove token from both storages', () => {
      const sessionRemoveSpy = vi.spyOn(window.sessionStorage.__proto__, 'removeItem');
      const localRemoveSpy = vi.spyOn(window.localStorage.__proto__, 'removeItem');
      sessionStorage.setItem(STORAGE_KEY, 'session-token');
      localStorage.setItem(STORAGE_KEY, 'local-token');

      clearMerchantToken();

      expect(sessionRemoveSpy).toHaveBeenCalledWith(STORAGE_KEY);
      expect(localRemoveSpy).toHaveBeenCalledWith(STORAGE_KEY);
      expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should not throw when storages are already empty', () => {
      expect(() => clearMerchantToken()).not.toThrow();
    });
  });
});
