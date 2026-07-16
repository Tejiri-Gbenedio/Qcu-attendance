---
name: project-features
description: Key project features and recent additions
metadata:
  type: project
---

## QCU Attendance — Current Features

### Core
- Geofenced attendance with GPS verification (Haversine distance calculation)
- Google Sheets backend (Config, Whitelist, Attendance tabs)
- Shared password + whitelist-based member validation
- Admin session with timing-safe password comparison, HTTP-only cookies
- Config overrides: Google Sheets values take precedence over env vars for geofence

### Device Restriction (added July 2026)
- Each browser gets a persistent unique Device ID (UUID in localStorage)
- Devices can only sign in once per day
- Attempting a second sign-in shows an "Already Used" screen with an admin override form
- Admin must enter their admin password each time they override
- Device ID logged in Google Sheets column L

### PWA Support (added July 2026)
- Web app manifest at `/manifest.webmanifest` for Add to Home Screen
- Service worker for app shell caching (network-first for API, cache-first for static)
- PWA icons generated from SoJ logo (192×192, 512×512)
- Auto-registration via `PWARegister` component in root layout

### UI/UX
- Glassmorphic design system, dark mode, ambient gradient background
- Autocomplete name suggestions with keyboard navigation
- GPS phase indicators during location acquisition
- Animated counters, success states, ripple effects
- Admin dashboard: KPI cards, CSV export, sort/filter/search/pagination

**How to apply:** When adding new features, reference this to understand existing patterns and avoid feature conflicts. [[google-sheets-structure]] [[deployment]]

**Why:** Central record of what's been built so far.
