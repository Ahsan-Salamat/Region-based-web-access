import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Load accessRules.js at config-time using dynamic import so the pure-JS
// module is available inside Vite plugin middleware hooks.
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic import wrapper – rules module uses ESM named exports
let _rulesModule = null;
async function getRulesModule() {
  if (!_rulesModule) {
    _rulesModule = await import(path.join(__dirname, 'src/lib/accessRules.js'));
  }
  return _rulesModule;
}

function createAccessControlMiddleware(env) {
  return (req, res, next) => {
    const url = req.url || '';

    // -------------------------------------------------------------------
    // POST /api/check-access  – main access-control endpoint
    // -------------------------------------------------------------------
    if (url.startsWith('/api/check-access') && req.method === 'POST') {
      const handleCheck = async () => {
        try {
          const { determineAccess } = await getRulesModule();

          const headers = req.headers;
          const userAgent = headers['user-agent'] || 'Unknown';

          // Server-side IP extraction
          let clientIp =
            headers['x-forwarded-for']?.split(',')[0].trim() ||
            headers['x-real-ip'] ||
            req.socket.remoteAddress ||
            '127.0.0.1';

          // Normalise IPv6 localhost
          if (clientIp === '::1' || clientIp === '::ffff:127.0.0.1') {
            clientIp = '127.0.0.1';
          }

          // Dev simulation override headers
          const devCountry = headers['x-dev-country'];
          const devDevice  = headers['x-dev-device'];
          const devCity    = headers['x-dev-city'];
          const devIp      = headers['x-dev-ip'];

          let country     = 'Unknown';
          let countryCode = '';
          let city        = 'Unknown';

          // Server-side device detection from User-Agent
          const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;
          let deviceType = mobileRegex.test(userAgent) ? 'mobile' : 'desktop';

          if (devCountry) {
            // ── Simulation mode ──────────────────────────────────────
            country = devCountry;
            city    = devCity || 'Simulated City';
            if (devDevice === 'mobile' || devDevice === 'desktop') {
              deviceType = devDevice;
            }
            if (devIp) clientIp = devIp;
          } else {
            // ── Live geo-lookup ─────────────────────────────────────────
            // When connecting over localhost/loopback/private IP in local testing,
            // query ip-api.com without an IP to automatically resolve the machine's public egress IP & actual country.
            const isLocalOrPrivate =
              clientIp === '127.0.0.1' ||
              clientIp === 'localhost' ||
              clientIp.startsWith('192.168.') ||
              clientIp.startsWith('10.') ||
              clientIp.startsWith('172.');

            const queryUrl = isLocalOrPrivate
              ? 'http://ip-api.com/json/?fields=status,message,country,countryCode,city,query'
              : `http://ip-api.com/json/${clientIp}?fields=status,message,country,countryCode,city,query`;

            try {
              const geoRes = await fetch(queryUrl);
              if (geoRes.ok) {
                const geoData = await geoRes.json();
                if (geoData.status === 'success') {
                  country     = geoData.country     || 'Unknown';
                  countryCode = geoData.countryCode || '';
                  city        = geoData.city        || 'Unknown';
                  if (isLocalOrPrivate && geoData.query) {
                    clientIp = geoData.query;
                  }
                }
              }
            } catch (e) {
              console.warn('[Access Control] Geo-lookup failed:', e.message);
            }
          }

          // ── Centralised Access Decision (single source of truth) ──
          const decision = determineAccess({ country, countryCode, deviceType });
          const normalizedCountry = decision.normalizedCountry;
          const { allowed, language, reason } = decision;
          const targetPage = allowed ? `/${language}` : '/blocked';

          // ── Database logging ─────────────────────────────────────
          const supabaseUrl = env.VITE_SUPABASE_URL;
          const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

          let loggedToDb = false;
          if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder-project')) {
            try {
              const supabase = createClient(supabaseUrl, supabaseKey);
              const { error } = await supabase.from('access_logs').insert([
                {
                  ip_address:    clientIp,
                  country:       normalizedCountry,
                  city,
                  device_type:   deviceType,
                  access_status: allowed ? 'allowed' : 'blocked',
                  page:          targetPage,
                  language,
                  block_reason:  reason,
                  user_agent:    userAgent.substring(0, 500),
                },
              ]);
              if (!error) {
                loggedToDb = true;
              } else {
                console.warn('[Access Control] Supabase insert error:', error.message);
              }
            } catch (dbErr) {
              console.warn('[Access Control] DB logging error:', dbErr.message);
            }
          }

          // ── Fallback: in-memory dev log ──────────────────────────
          if (!loggedToDb) {
            if (!globalThis.__DEV_ACCESS_LOGS__) globalThis.__DEV_ACCESS_LOGS__ = [];
            globalThis.__DEV_ACCESS_LOGS__.unshift({
              id:            `dev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              created_at:    new Date().toISOString(),
              ip_address:    clientIp,
              country:       normalizedCountry,
              city,
              device_type:   deviceType,
              access_status: allowed ? 'allowed' : 'blocked',
              page:          targetPage,
              language,
              block_reason:  reason,
              user_agent:    userAgent.substring(0, 500),
            });
          }

          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(
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
            })
          );
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Internal server error' }));
        }
      };
      handleCheck();
      return;
    }

    // -------------------------------------------------------------------
    // GET /api/dev-logs  – in-memory log viewer
    // -------------------------------------------------------------------
    if (url.startsWith('/api/dev-logs') && req.method === 'GET') {
      const logs = globalThis.__DEV_ACCESS_LOGS__ || [];
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ logs }));
      return;
    }

    next();
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const accessMiddleware = createAccessControlMiddleware(env);

  return {
    plugins: [
      {
        name: 'server-side-access-control-dev-middleware',
        enforce: 'pre',
        configureServer(server) {
          server.middlewares.use(accessMiddleware);
        },
        configurePreviewServer(server) {
          server.middlewares.use(accessMiddleware);
        },
      },
      react(),
      tailwindcss(),
    ],
  };
});
