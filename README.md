# Region-Based Web Access Control System

A full-stack university Web Engineering project that dynamically controls website access, localization, and device permissions based on visitor geolocation and device fingerprinting, backed by Supabase PostgreSQL logging and an authenticated Administrator Dashboard.

---

## 1. Project Overview & Business Rules

The system implements the exact university specification:

| Country | Allowed Devices | Target Language / Result |
| :--- | :--- | :--- |
| **Pakistan** | **Mobile only** | **Urdu (`/ur`)** — RTL layout |
| **Pakistan** | Desktop | **Blocked (`/blocked`)** |
| **Saudi Arabia** | Mobile & Desktop | **Arabic (`/ar`)** — RTL layout |
| **United Arab Emirates (UAE)** | Mobile & Desktop | **Arabic (`/ar`)** — RTL layout |
| **Australia** | All devices | **Blocked (`/blocked`)** |
| **Canada** | All devices | **Blocked (`/blocked`)** |
| **United Kingdom (UK)** | Mobile & Desktop | **English (`/en`)** |
| **All Other Countries** | Mobile & Desktop | **English (`/en`)** |

* Every visit (allowed or blocked) is logged with timestamp, IP address, country, city, device type, access status, requested page, language, and block reasons.
* Administrators can authenticate via Supabase Auth and filter access logs with database query-level filtering and pagination.

---

## 2. Technology Stack

* **Frontend**: React 19, JavaScript (ES2022 / JSX), React Router DOM v7, Tailwind CSS v4, Lucide Icons
* **Backend / Server-Side Security**: Node.js & Supabase Edge Functions (Deno) for server-side IP extraction, geolocation lookup, User-Agent device classification, and rule evaluation
* **Database & Auth**: Supabase PostgreSQL + Row Level Security (RLS) + Supabase Auth
* **Geolocation**: `ip-api.com` IP geolocation service (country, countryCode, city)
* **Testing**: Vitest automated test suite for centralized decision logic

---

## 3. Architecture & Security Model

```
[ Visitor Browser ]
        │
        ▼ (POST /api/check-access)
┌─────────────────────────────────────────────────────────┐
│ Server-Side / Trusted Environment (Node / Edge Function)│
│  1. Extract real client IP from headers                 │
│  2. Server-side User-Agent device detection             │
│  3. IP Geolocation Lookup (ip-api.com)                  │
│  4. Centralized Access Control Engine (determineAccess) │
│  5. Immutable Access Logging to Supabase PostgreSQL     │
│  6. Return structured decision to client                │
└─────────────────────────────────────────────────────────┘
        │
        ▼
[ Client Navigation: /ur, /ar, /en, or /blocked ]
```

### Security Principles
1. **Never trust client-supplied country or device type**: The access decision is executed server-side.
2. **Never expose `SUPABASE_SERVICE_ROLE_KEY` to client bundles**: Client only receives `VITE_SUPABASE_ANON_KEY`.
3. **Database RLS Policies**: Anonymous users cannot read audit logs; only authenticated administrators can query logs.

---

## 4. Environment Configuration

Copy `.env.example` to `.env` or configure your environment variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

# Server-Side / Edge Function Only (Do NOT prefix with VITE_)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Development Simulation Controls
VITE_DEV_SIMULATION_ENABLED=true
```

---

## 5. Database Schema & Migration

The PostgreSQL migration is located at [`supabase/migrations/001_access_logs.sql`](./supabase/migrations/001_access_logs.sql).

### Table Schema: `public.access_logs`
* `id` (UUID PRIMARY KEY DEFAULT `gen_random_uuid()`)
* `created_at` (TIMESTAMPTZ NOT NULL DEFAULT `now()`)
* `ip_address` (TEXT NOT NULL)
* `country` (TEXT NOT NULL)
* `city` (TEXT)
* `device_type` (TEXT CHECK `mobile` OR `desktop`)
* `access_status` (TEXT CHECK `allowed` OR `blocked`)
* `page` (TEXT NOT NULL)
* `language` (TEXT)
* `block_reason` (TEXT)
* `user_agent` (TEXT)

### RLS Policies
* `Authenticated users can read access logs`: Allows logged-in admins to `SELECT` logs.
* `Service role can insert access logs`: Allows Edge Functions / server-side logger to `INSERT` logs.

---

## 6. How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The server will start at `http://localhost:5173/`.

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## 7. Development Test Simulator

When running locally, a **Dev Test Simulator** banner is pinned to the top of the application. It includes 1-click test triggers for all matrix rules:
* 🇵🇰 **Pakistan (Mobile)** &rarr; Evaluates &rarr; Redirects to `/ur`
* 🇵🇰 **Pakistan (Desktop)** &rarr; Evaluates &rarr; Redirects to `/blocked`
* 🇸🇦 **Saudi Arabia (Mobile/Desktop)** &rarr; Evaluates &rarr; Redirects to `/ar`
* 🇦🇪 **UAE (Mobile/Desktop)** &rarr; Evaluates &rarr; Redirects to `/ar`
* 🇦🇺 **Australia (Mobile/Desktop)** &rarr; Evaluates &rarr; Redirects to `/blocked`
* 🇨🇦 **Canada (Mobile/Desktop)** &rarr; Evaluates &rarr; Redirects to `/blocked`
* 🇬🇧 **UK (Mobile/Desktop)** &rarr; Evaluates &rarr; Redirects to `/en`
* 🇺🇸 **USA (Desktop)** &rarr; Evaluates &rarr; Redirects to `/en`
* 🌐 **Live Real Detection** &rarr; Resets simulation to use visitor's actual IP & device

---

## 8. Admin Dashboard & Filtering

### Administrator Credentials
* **Email:** `admin@university.edu`
* **Password:** `AdminPassword123!`

1. Navigate to `/admin` or click **Admin** in the navigation bar.
2. Sign in using the credentials above.
3. Features:
   * **Summary KPI Cards**: Real-time counts for Total Visits, Allowed Visits, Blocked Visits, Mobile Traffic, and Desktop Traffic.
   * **Multi-Criteria Filtering**: Filter by Country, Device Type, Access Status, and Date Range at the database query level.
   * **Pagination**: Browse results with configurable page sizes (5, 10, 25, 50 rows).
   * **Sign Out**: Terminates admin session and clears credentials.

---

## 9. Project Structure

```
region-base web access/
├── src/
│   ├── components/
│   │   ├── DevSimulationBar.jsx   # Interactive rule simulator
│   │   ├── LoadingSpinner.jsx     # Evaluation spinner
│   │   ├── Navbar.jsx             # Navigation header & status strip
│   │   └── StatusBadge.jsx        # Status & device badge components
│   ├── context/
│   │   └── AccessContext.jsx      # Central visitor & simulation state
│   ├── lib/
│   │   └── accessRules.js         # Pure, centralized access-control engine
│   ├── pages/
│   │   ├── AdminPage.jsx          # Protected admin dashboard with filters
│   │   ├── ArabicPage.jsx         # Arabic RTL localized portal (/ar)
│   │   ├── BlockedPage.jsx        # Security restriction page (/blocked)
│   │   ├── EnglishPage.jsx        # English international portal (/en)
│   │   ├── GatewayPage.jsx        # Root evaluation entrypoint (/)
│   │   ├── LoginPage.jsx          # Admin authentication portal
│   │   └── UrduPage.jsx           # Urdu RTL localized portal (/ur)
│   ├── services/
│   │   ├── accessApi.js           # Server API client
│   │   └── supabase.js            # Supabase JS client
│   ├── App.jsx                    # Route configuration
│   ├── index.css                  # Tailwind styles & Google Fonts
│   └── main.jsx                   # React DOM entrypoint
├── supabase/
│   ├── functions/
│   │   └── check-access/
│   │       └── index.ts           # Supabase Edge Function implementation
│   └── migrations/
│       └── 001_access_logs.sql    # PostgreSQL schema & RLS policies
├── tests/
│   └── accessRules.test.js        # Vitest test suite for access matrix
├── dev-server.js                  # Full-stack dev server middleware
├── vite.config.js                 # Vite build configuration
├── .env.example                   # Environment template
└── README.md
```
