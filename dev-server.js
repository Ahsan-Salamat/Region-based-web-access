import http from 'node:http';
import { createServer as createViteServer, loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const PORT = 5173;
const env = loadEnv('development', process.cwd(), '');

// Normalize country helper
function normalizeCountry(c, code) {
  const str = (c || '').trim().toLowerCase();
  const cd = (code || '').trim().toUpperCase();
  if (cd === 'PK' || str === 'pakistan') return 'Pakistan';
  if (cd === 'SA' || str === 'saudi arabia' || str === 'saudi') return 'Saudi Arabia';
  if (cd === 'AE' || cd === 'UAE' || str === 'united arab emirates' || str === 'uae') return 'United Arab Emirates';
  if (cd === 'AU' || str === 'australia') return 'Australia';
  if (cd === 'CA' || str === 'canada') return 'Canada';
  if (cd === 'GB' || cd === 'UK' || str === 'united kingdom' || str === 'uk' || str === 'great britain') return 'United Kingdom';
  if (cd === 'US' || cd === 'USA' || str === 'united states' || str === 'usa') return 'United States';
  if (c && c.trim().length > 0) return c.trim();
  return 'Unknown';
}

function detectDevice(userAgent) {
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;
  return mobileRegex.test(userAgent) ? 'mobile' : 'desktop';
}

function determineAccess(normalizedCountry, deviceType) {
  if (normalizedCountry === 'Australia') {
    return {
      allowed: false,
      language: null,
      reason: 'Access from Australia is restricted regardless of device type.',
    };
  }

  if (normalizedCountry === 'Canada') {
    return {
      allowed: false,
      language: null,
      reason: 'Access from Canada is restricted regardless of device type.',
    };
  }

  if (normalizedCountry === 'Pakistan') {
    if (deviceType === 'mobile') {
      return {
        allowed: true,
        language: 'ur',
        reason: null,
      };
    } else {
      return {
        allowed: false,
        language: null,
        reason: 'Pakistan access is permitted on mobile devices only. Desktop devices are restricted.',
      };
    }
  }

  if (normalizedCountry === 'Saudi Arabia' || normalizedCountry === 'United Arab Emirates') {
    return {
      allowed: true,
      language: 'ar',
      reason: null,
    };
  }

  return {
    allowed: true,
    language: 'en',
    reason: null,
  };
}

const devLogs = [];

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  const server = http.createServer(async (req, res) => {
    const url = req.url || '';

    // Handle Server-Side Access Control API
    if (url.startsWith('/api/check-access') && req.method === 'POST') {
      try {
        const headers = req.headers;
        const userAgent = headers['user-agent'] || 'Unknown';

        let clientIp = headers['x-forwarded-for']?.split(',')[0].trim() ||
                       headers['x-real-ip'] ||
                       req.socket.remoteAddress ||
                       '127.0.0.1';

        if (clientIp === '::1' || clientIp === '::ffff:127.0.0.1') {
          clientIp = '127.0.0.1';
        }

        // Dev simulation headers
        const devCountry = headers['x-dev-country'];
        const devDevice = headers['x-dev-device'];
        const devCity = headers['x-dev-city'];
        const devIp = headers['x-dev-ip'];

        let country = 'Unknown';
        let countryCode = '';
        let city = 'Unknown';
        let deviceType = detectDevice(userAgent);

        if (devCountry) {
          country = devCountry;
          city = devCity || 'Simulated City';
          if (devDevice === 'mobile' || devDevice === 'desktop') {
            deviceType = devDevice;
          }
          if (devIp) {
            clientIp = devIp;
          }
        } else if (clientIp !== '127.0.0.1' && clientIp !== 'localhost' && !clientIp.startsWith('192.168.')) {
          try {
            const geoRes = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,message,country,countryCode,city,query`);
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              if (geoData.status === 'success') {
                country = geoData.country || 'Unknown';
                countryCode = geoData.countryCode || '';
                city = geoData.city || 'Unknown';
              }
            }
          } catch (e) {
            console.warn('[Server-Side Access] Geolocation API lookup error:', e);
          }
        }

        const normalizedCountry = normalizeCountry(country, countryCode);
        const decision = determineAccess(normalizedCountry, deviceType);
        const targetPage = decision.allowed ? `/${decision.language}` : '/blocked';

        // Attempt Supabase database logging
        const supabaseUrl = env.VITE_SUPABASE_URL;
        const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

        let loggedToDb = false;
        if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder-project')) {
          try {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const { error } = await supabase.from('access_logs').insert([
              {
                ip_address: clientIp,
                country: normalizedCountry,
                city: city,
                device_type: deviceType,
                access_status: decision.allowed ? 'allowed' : 'blocked',
                page: targetPage,
                language: decision.language,
                block_reason: decision.reason,
                user_agent: userAgent.substring(0, 500),
              },
            ]);
            if (!error) loggedToDb = true;
          } catch (dbErr) {
            console.warn('[Server-Side Access] DB logging error:', dbErr);
          }
        }

        if (!loggedToDb) {
          devLogs.unshift({
            id: `dev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            created_at: new Date().toISOString(),
            ip_address: clientIp,
            country: normalizedCountry,
            city: city,
            device_type: deviceType,
            access_status: decision.allowed ? 'allowed' : 'blocked',
            page: targetPage,
            language: decision.language,
            block_reason: decision.reason,
            user_agent: userAgent.substring(0, 500),
          });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          allowed: decision.allowed,
          language: decision.language,
          reason: decision.reason,
          country: normalizedCountry,
          countryCode,
          city,
          deviceType,
          ip: clientIp,
          targetPage,
        }));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err?.message || 'Server error' }));
        return;
      }
    }

    // Dev API to fetch dev logs
    if (url.startsWith('/api/dev-logs') && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ logs: devLogs }));
      return;
    }

    // All other requests -> Vite middleware
    vite.middlewares(req, res);
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  🚀 Full-Stack Access Control Server running on http://localhost:${PORT}/\n`);
  });
}

startServer();
