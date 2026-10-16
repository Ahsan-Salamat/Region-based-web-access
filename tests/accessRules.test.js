import { describe, it, expect } from 'vitest';
import { determineAccess, normalizeCountry, normalizeDeviceType } from '../src/lib/accessRules.js';

describe('Access Control Engine (determineAccess)', () => {
  // Acceptance Matrix Tests
  describe('Pakistan Rule: Mobile Allowed (Urdu), Desktop Blocked', () => {
    it('allows Pakistan on mobile with Urdu language', () => {
      const result = determineAccess({ country: 'Pakistan', deviceType: 'mobile' });
      expect(result.allowed).toBe(true);
      expect(result.language).toBe('ur');
      expect(result.reason).toBeNull();
    });

    it('blocks Pakistan on desktop', () => {
      const result = determineAccess({ country: 'Pakistan', deviceType: 'desktop' });
      expect(result.allowed).toBe(false);
      expect(result.language).toBeNull();
      expect(result.reason).toContain('mobile devices only');
    });

    it('handles ISO country code PK on mobile and desktop', () => {
      const mobileResult = determineAccess({ countryCode: 'PK', deviceType: 'mobile' });
      expect(mobileResult.allowed).toBe(true);
      expect(mobileResult.language).toBe('ur');

      const desktopResult = determineAccess({ countryCode: 'PK', deviceType: 'desktop' });
      expect(desktopResult.allowed).toBe(false);
    });
  });

  describe('Saudi Arabia Rule: Arabic for Mobile & Desktop', () => {
    it('allows Saudi Arabia on mobile with Arabic language', () => {
      const result = determineAccess({ country: 'Saudi Arabia', deviceType: 'mobile' });
      expect(result.allowed).toBe(true);
      expect(result.language).toBe('ar');
    });

    it('allows Saudi Arabia on desktop with Arabic language', () => {
      const result = determineAccess({ country: 'Saudi Arabia', deviceType: 'desktop' });
      expect(result.allowed).toBe(true);
      expect(result.language).toBe('ar');
    });

    it('handles country code SA', () => {
      const result = determineAccess({ countryCode: 'SA', deviceType: 'mobile' });
      expect(result.allowed).toBe(true);
      expect(result.language).toBe('ar');
    });
  });

  describe('UAE Rule: Arabic for Mobile & Desktop', () => {
    it('allows UAE on mobile with Arabic language', () => {
      const result = determineAccess({ country: 'United Arab Emirates', deviceType: 'mobile' });
      expect(result.allowed).toBe(true);
      expect(result.language).toBe('ar');
    });

    it('allows UAE on desktop with Arabic language', () => {
      const result = determineAccess({ country: 'United Arab Emirates', deviceType: 'desktop' });
      expect(result.allowed).toBe(true);
      expect(result.language).toBe('ar');
    });

    it('handles country code AE / UAE', () => {
      const result1 = determineAccess({ countryCode: 'AE', deviceType: 'desktop' });
      expect(result1.allowed).toBe(true);
      expect(result1.language).toBe('ar');

      const result2 = determineAccess({ country: 'UAE', deviceType: 'mobile' });
      expect(result2.allowed).toBe(true);
      expect(result2.language).toBe('ar');
    });
  });

  describe('Australia Rule: Blocked on all devices', () => {
    it('blocks Australia on mobile', () => {
      const result = determineAccess({ country: 'Australia', deviceType: 'mobile' });
      expect(result.allowed).toBe(false);
      expect(result.language).toBeNull();
      expect(result.reason).toContain('Australia is restricted');
    });

    it('blocks Australia on desktop', () => {
      const result = determineAccess({ country: 'Australia', deviceType: 'desktop' });
      expect(result.allowed).toBe(false);
      expect(result.language).toBeNull();
    });

    it('handles country code AU', () => {
      const result = determineAccess({ countryCode: 'AU', deviceType: 'desktop' });
      expect(result.allowed).toBe(false);
    });
  });

  describe('Canada Rule: Blocked on all devices', () => {
    it('blocks Canada on mobile', () => {
      const result = determineAccess({ country: 'Canada', deviceType: 'mobile' });
      expect(result.allowed).toBe(false);
      expect(result.language).toBeNull();
      expect(result.reason).toContain('Canada is restricted');
    });

    it('blocks Canada on desktop', () => {
      const result = determineAccess({ country: 'Canada', deviceType: 'desktop' });
      expect(result.allowed).toBe(false);
      expect(result.language).toBeNull();
    });

    it('handles country code CA', () => {
      const result = determineAccess({ countryCode: 'CA', deviceType: 'mobile' });
      expect(result.allowed).toBe(false);
    });
  });

  describe('UK Rule: English on Mobile & Desktop', () => {
    it('allows UK on mobile with English language', () => {
      const result = determineAccess({ country: 'United Kingdom', deviceType: 'mobile' });
      expect(result.allowed).toBe(true);
      expect(result.language).toBe('en');
    });

    it('allows UK on desktop with English language', () => {
      const result = determineAccess({ country: 'United Kingdom', deviceType: 'desktop' });
      expect(result.allowed).toBe(true);
      expect(result.language).toBe('en');
    });

    it('handles country code GB / UK', () => {
      const result = determineAccess({ countryCode: 'GB', deviceType: 'desktop' });
      expect(result.allowed).toBe(true);
      expect(result.language).toBe('en');
    });
  });

  describe('All Other Countries: English on Mobile & Desktop', () => {
    it('allows USA on mobile with English language', () => {
      const result = determineAccess({ country: 'United States', deviceType: 'mobile' });
      expect(result.allowed).toBe(true);
      expect(result.language).toBe('en');
    });

    it('allows USA on desktop with English language', () => {
      const result = determineAccess({ country: 'United States', deviceType: 'desktop' });
      expect(result.allowed).toBe(true);
      expect(result.language).toBe('en');
    });

    it('allows Germany on mobile with English language', () => {
      const result = determineAccess({ country: 'Germany', deviceType: 'mobile' });
      expect(result.allowed).toBe(true);
      expect(result.language).toBe('en');
    });

    it('allows Japan on desktop with English language', () => {
      const result = determineAccess({ country: 'Japan', deviceType: 'desktop' });
      expect(result.allowed).toBe(true);
      expect(result.language).toBe('en');
    });
  });

  describe('Edge cases and malformed inputs', () => {
    it('handles null / undefined country safely with default English fallback', () => {
      const result = determineAccess({ country: null, countryCode: null, deviceType: 'desktop' });
      expect(result.allowed).toBe(true);
      expect(result.language).toBe('en');
    });

    it('handles null / undefined deviceType defaulting to desktop', () => {
      const pkResult = determineAccess({ country: 'Pakistan', deviceType: null });
      // Default to desktop -> blocked
      expect(pkResult.allowed).toBe(false);

      const ukResult = determineAccess({ country: 'United Kingdom', deviceType: null });
      expect(ukResult.allowed).toBe(true);
      expect(ukResult.language).toBe('en');
    });

    it('normalizes device type strings', () => {
      expect(normalizeDeviceType('phone')).toBe('mobile');
      expect(normalizeDeviceType('mobile')).toBe('mobile');
      expect(normalizeDeviceType('desktop')).toBe('desktop');
      expect(normalizeDeviceType('DESKTOP')).toBe('desktop');
      expect(normalizeDeviceType(undefined)).toBe('desktop');
    });

    it('normalizes country names case-insensitively', () => {
      expect(normalizeCountry('pakistan')).toBe('Pakistan');
      expect(normalizeCountry('SAUDI ARABIA')).toBe('Saudi Arabia');
      expect(normalizeCountry('united arab emirates')).toBe('United Arab Emirates');
      expect(normalizeCountry('AUSTRALIA')).toBe('Australia');
      expect(normalizeCountry('canada')).toBe('Canada');
      expect(normalizeCountry('uk')).toBe('United Kingdom');
    });
  });
});
