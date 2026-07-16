---
name: deployment
description: Deploy setup on Vercel
metadata:
  type: reference
---

## Vercel Deployment

- Repo pushed to GitHub, imported in Vercel
- Environment variables set in Vercel Project Settings (see README.md for full list)
- Hosted at Vercel's default domain
- Africa/Lagos timezone manually handled with UTC+1 offset (Intl timezone was silently failing on Vercel)
- Geofence config from Google Sheets overrides env vars

**How to apply:** After any push to main, Vercel auto-deploys. Check Vercel dashboard for build logs if deployment fails.
