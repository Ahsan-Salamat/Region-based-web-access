/**
 * Normalize country name or code to a standardized country identifier.
 * @param {string} [country]
 * @param {string} [countryCode]
 * @returns {string}
 */
export function normalizeCountry(country, countryCode) {
  const c = (country || '').trim().toLowerCase();
  const code = (countryCode || '').trim().toUpperCase();

  if (code === 'PK' || c === 'pakistan') return 'Pakistan';
  if (code === 'SA' || c === 'saudi arabia' || c === 'saudi') return 'Saudi Arabia';
  if (code === 'AE' || code === 'UAE' || c === 'united arab emirates' || c === 'uae') return 'United Arab Emirates';
  if (code === 'AU' || c === 'australia') return 'Australia';
  if (code === 'CA' || c === 'canada') return 'Canada';
  if (code === 'GB' || code === 'UK' || c === 'united kingdom' || c === 'uk' || c === 'great britain') return 'United Kingdom';
  if (code === 'US' || code === 'USA' || c === 'united states' || c === 'usa' || c === 'united states of america') return 'United States';
  
  if (country && country.trim().length > 0) {
    return country.trim();
  }
  if (code && code.trim().length > 0) {
    return code;
  }
  return 'Unknown';
}

/**
 * Determine device category ('mobile' | 'desktop').
 * @param {string} [deviceType]
 * @returns {'mobile' | 'desktop'}
 */
export function normalizeDeviceType(deviceType) {
  if (!deviceType) return 'desktop';
  const d = deviceType.toLowerCase().trim();
  if (d === 'mobile' || d === 'phone' || d === 'tablet') {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Centralized access-control engine according to requirements:
 * 
 * - Pakistan -> Urdu version (Allowed only on Mobile; Desktop is blocked)
 * - Saudi Arabia -> Arabic version (Mobile and Desktop allowed)
 * - UAE -> Arabic version (Mobile and Desktop allowed)
 * - Australia -> Access Block (All devices)
 * - Canada -> Access Block (All devices)
 * - UK -> English version (Mobile and Desktop allowed)
 * - All other countries -> English version (Mobile and Desktop allowed)
 * 
 * @param {Object} params
 * @param {string} [params.country]
 * @param {string} [params.countryCode]
 * @param {string} [params.deviceType]
 * @returns {{ allowed: boolean, language: 'ur'|'ar'|'en'|null, reason: string|null, normalizedCountry: string }}
 */
export function determineAccess(params = {}) {
  const normalizedCountry = normalizeCountry(params.country, params.countryCode);
  const deviceType = normalizeDeviceType(params.deviceType);

  // Step 1: Check whether country is globally blocked
  if (normalizedCountry === 'Australia') {
    return {
      allowed: false,
      language: null,
      reason: 'Access from Australia is restricted regardless of device type.',
      normalizedCountry,
    };
  }

  if (normalizedCountry === 'Canada') {
    return {
      allowed: false,
      language: null,
      reason: 'Access from Canada is restricted regardless of device type.',
      normalizedCountry,
    };
  }

  // Step 2: Check country-specific device restrictions
  if (normalizedCountry === 'Pakistan') {
    if (deviceType === 'mobile') {
      return {
        allowed: true,
        language: 'ur',
        reason: null,
        normalizedCountry,
      };
    } else {
      return {
        allowed: false,
        language: null,
        reason: 'Pakistan access is permitted on mobile devices only. Desktop devices are restricted.',
        normalizedCountry,
      };
    }
  }

  // Step 3: Arabic language countries (Saudi Arabia & UAE)
  if (normalizedCountry === 'Saudi Arabia' || normalizedCountry === 'United Arab Emirates') {
    return {
      allowed: true,
      language: 'ar',
      reason: null,
      normalizedCountry,
    };
  }

  // Step 4: UK & all other countries -> English version
  return {
    allowed: true,
    language: 'en',
    reason: null,
    normalizedCountry,
  };
}
