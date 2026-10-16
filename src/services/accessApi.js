/**
 * Call the server-side access control endpoint.
 * In development, calls the server-side Vite middleware at /api/check-access.
 * In production, calls the deployed Supabase Edge Function endpoint.
 * 
 * @param {Object} [simulation]
 * @param {boolean} [simulation.enabled]
 * @param {string} [simulation.country]
 * @param {string} [simulation.city]
 * @param {'mobile'|'desktop'} [simulation.deviceType]
 * @param {string} [simulation.ip]
 * @returns {Promise<{
 *   allowed: boolean,
 *   language: 'ur'|'ar'|'en'|null,
 *   reason: string|null,
 *   country: string,
 *   countryCode: string,
 *   city: string,
 *   deviceType: 'mobile'|'desktop',
 *   ip: string,
 *   targetPage: string
 * }>}
 */
export async function checkAccess(simulation) {
  const headers = {
    'Content-Type': 'application/json',
  };

  // If simulation is active in dev mode, attach dev simulation headers
  if (simulation?.enabled) {
    if (simulation.country) headers['x-dev-country'] = simulation.country;
    if (simulation.deviceType) headers['x-dev-device'] = simulation.deviceType;
    if (simulation.city) headers['x-dev-city'] = simulation.city;
    if (simulation.ip) headers['x-dev-ip'] = simulation.ip;
  }

  const endpoint = '/api/check-access';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Server access check failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data;
}
