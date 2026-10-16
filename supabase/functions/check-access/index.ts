// Supabase Edge Function: check-access
// Provides server-side geolocation, device detection, access decision, and database logging.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-dev-country, x-dev-device, x-dev-city, x-dev-ip',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function normalizeCountry(country?: string | null, countryCode?: string | null): string {
  const c = (country || '').trim().toLowerCase();
  const code = (countryCode || '').trim().toUpperCase();

  if (code === 'PK' || c === 'pakistan') return 'Pakistan';
  if (code === 'SA' || c === 'saudi arabia' || c === 'saudi') return 'Saudi Arabia';
  if (code === 'AE' || code === 'UAE' || c === 'united arab emirates' || c === 'uae') return 'United Arab Emirates';
  if (code === 'AU' || c === 'australia') return 'Australia';
  if (code === 'CA' || c === 'canada') return 'Canada';
  if (code === 'GB' || code === 'UK' || c === 'united kingdom' || c === 'uk' || c === 'great britain') return 'United Kingdom';
  if (code === 'US' || code === 'USA' || c === 'united states' || c === 'usa' || c === 'united states of america') return 'United States';
  
  if (country && country.trim().length > 0) return country.trim();
  if (code && code.trim().length > 0) return code;
  return 'Unknown';
}

function determineAccess(country: string, countryCode: string, deviceType: 'mobile' | 'desktop') {
  const normalizedCountry = normalizeCountry(country, countryCode);

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

  if (normalizedCountry === 'Pakistan') {
    if (deviceType === 'mobile') {
      return {
        allowed: true,
        language: 'ur' as const,
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

  if (normalizedCountry === 'Saudi Arabia' || normalizedCountry === 'United Arab Emirates') {
    return {
      allowed: true,
      language: 'ar' as const,
      reason: null,
      normalizedCountry,
    };
  }

  return {
    allowed: true,
    language: 'en' as const,
    reason: null,
    normalizedCountry,
  };
}

function detectDevice(userAgent: string): 'mobile' | 'desktop' {
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;
  return mobileRegex.test(userAgent) ? 'mobile' : 'desktop';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    let ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
             req.headers.get('cf-connecting-ip') ||
             req.headers.get('x-real-ip') ||
             '127.0.0.1';

    // Development simulation check via headers
    const devCountry = req.headers.get('x-dev-country');
    const devDevice = req.headers.get('x-dev-device') as 'mobile' | 'desktop' | null;
    const devCity = req.headers.get('x-dev-city');
    const devIp = req.headers.get('x-dev-ip');

    let country = 'Unknown';
    let countryCode = '';
    let city = 'Unknown';
    let deviceType: 'mobile' | 'desktop' = detectDevice(userAgent);

    if (devCountry) {
      country = devCountry;
      city = devCity || 'Simulated City';
      if (devDevice === 'mobile' || devDevice === 'desktop') {
        deviceType = devDevice;
      }
      if (devIp) {
        ip = devIp;
      }
    } else {
      // Real Geolocation lookup via ip-api.com
      if (ip && ip !== '127.0.0.1' && ip !== 'localhost' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
        try {
          const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,city,query`, {
            headers: { 'Accept': 'application/json' },
          });
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData.status === 'success') {
              country = geoData.country || 'Unknown';
              countryCode = geoData.countryCode || '';
              city = geoData.city || 'Unknown';
            }
          }
        } catch (geoErr) {
          console.error('Geolocation lookup failed:', geoErr);
        }
      }
    }

    const decision = determineAccess(country, countryCode, deviceType);
    const targetPage = decision.allowed ? `/${decision.language}` : '/blocked';

    // Log to Supabase database
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('access_logs').insert([
        {
          ip_address: ip,
          country: decision.normalizedCountry,
          city: city,
          device_type: deviceType,
          access_status: decision.allowed ? 'allowed' : 'blocked',
          page: targetPage,
          language: decision.language,
          block_reason: decision.reason,
          user_agent: userAgent.substring(0, 500),
        },
      ]);
    }

    const responsePayload = {
      allowed: decision.allowed,
      language: decision.language,
      reason: decision.reason,
      country: decision.normalizedCountry,
      countryCode,
      city,
      deviceType,
      ip,
      targetPage,
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Check access error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
