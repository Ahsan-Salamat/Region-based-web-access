import { createClient } from '@supabase/supabase-js';
import { determineAccess, normalizeCountry, normalizeDeviceType } from '../../src/lib/accessRules.js';

export default async (req, context) => {
  // Only accept POST or OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const headers = Object.fromEntries(req.headers.entries());
    const userAgent = headers['user-agent'] || 'Unknown';

    // 1. Extract client IP
    let clientIp =
      headers['x-forwarded-for']?.split(',')[0].trim() ||
      headers['x-nf-client-connection-ip'] ||
      headers['client-ip'] ||
      '127.0.0.1';

    // 2. Netlify Geolocation headers (Provided natively at the edge if available)
    let country = context?.geo?.country?.name || headers['x-country-name'] || 'Unknown';
    let countryCode = context?.geo?.country?.code || headers['x-country-code'] || '';
    let city = context?.geo?.city || headers['x-city-name'] || 'Unknown';

    // 3. Fallback Geo-lookup if Netlify Geo is unavailable or loopback
    const isLocalOrPrivate =
      clientIp === '127.0.0.1' ||
      clientIp === 'localhost' ||
      clientIp.startsWith('192.168.') ||
      clientIp.startsWith('10.') ||
      clientIp.startsWith('172.');

    if (country === 'Unknown' || isLocalOrPrivate) {
      try {
        const queryUrl = isLocalOrPrivate
          ? 'http://ip-api.com/json/?fields=status,message,country,countryCode,city,query'
          : `http://ip-api.com/json/${clientIp}?fields=status,message,country,countryCode,city,query`;

        const geoRes = await fetch(queryUrl);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.status === 'success') {
            country = geoData.country || country;
            countryCode = geoData.countryCode || countryCode;
            city = geoData.city || city;
            if (isLocalOrPrivate && geoData.query) {
              clientIp = geoData.query;
            }
          }
        }
      } catch (e) {
        console.warn('Geo IP lookup error in Netlify function:', e);
      }
    }

    // 4. Server-Side Device Detection
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;
    const deviceType = mobileRegex.test(userAgent) ? 'mobile' : 'desktop';

    // 5. Centralized Access Rules Decision
    const decision = determineAccess({ country, countryCode, deviceType });
    const normalizedCountry = decision.normalizedCountry;
    const { allowed, language, reason } = decision;
    const targetPage = allowed ? `/${language}` : '/blocked';

    // 6. Log to Supabase PostgreSQL
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder-project')) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('access_logs').insert([
          {
            ip_address: clientIp,
            country: normalizedCountry,
            city,
            device_type: deviceType,
            access_status: allowed ? 'allowed' : 'blocked',
            page: targetPage,
            language,
            block_reason: reason,
            user_agent: userAgent.substring(0, 500),
          },
        ]);
      } catch (dbErr) {
        console.warn('Database access logging failed in Netlify function:', dbErr);
      }
    }

    return new Response(
      JSON.stringify({
        allowed,
        language,
        reason,
        country: normalizedCountry,
        countryCode,
        city,
        deviceType,
        ip: clientIp,
        targetPage,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
