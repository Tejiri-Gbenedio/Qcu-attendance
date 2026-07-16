---
name: google-sheets-structure
description: Google Sheets tab structure and column layout
metadata:
  type: reference
---

## Google Sheets Structure

### Config tab (A:B)
- A1: churchLat, B1: (value)
- A2: churchLng, B2: (value)
- A3: allowedRadius, B3: (value in meters)
- A4: isOpen, B4: "true" or "false"
- Passwords are read from env vars, not from sheets.

### Whitelist tab
- A1: Name, A2+: member names (column A)
- B column is also read (Whitelist!B:B)

### Attendance tab (A:L)
Header: Date | Service | Member Name | Time | Latitude | Longitude | Distance | Status | Reason | Browser | Device | Device ID

**How to apply:** If modifying sheet structure, update the `range` args in `lib/google-sheets.ts` accordingly.
