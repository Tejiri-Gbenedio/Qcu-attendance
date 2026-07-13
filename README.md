Quality Control Unit Church Attendance Platform

A premium, geofenced attendance platform built for church departments to prevent fraudulent check-ins.



Tech Stack

Next.js 15 (App Router)

TypeScript

Tailwind CSS

Framer Motion

Google Sheets API (acting as the database)

Prerequisites

Node.js (v18 or higher)

A Google Cloud account

A Vercel account (for deployment)

Google Sheets Setup

Create a Google Sheet

Name it QCU Attendance (or anything you prefer).

Create three tabs (sheets) at the bottom named exactly:

Config

Whitelist

Attendance

Configure the Config Tab

In cell A1 type: churchLat | In B1 type: 0.000 (Replace with actual church latitude later)

In cell A2 type: churchLng | In B2 type: 0.000 (Replace with actual church longitude later)

In cell A3 type: allowedRadius | In B3 type: 100 (Radius in meters)

In cell A4 type: sharedPassword | In B4 type: churchpass123

In cell A5 type: adminPassword | In B5 type: admin123

In cell A6 type: isOpen | In B6 type: false

Configure the Whitelist Tab

In cell A1 type: Name

Below A1, list all member names (one per row). e.g., "John Doe", "Jane Smith".

Configure the Attendance Tab

In row 1, add the following headers exactly:

A1: Date

B1: Service

C1: Member Name

D1: Time

E1: Latitude

F1: Longitude

G1: Distance

H1: Status

I1: Reason

J1: Browser

K1: Device

Google Cloud Credentials Setup

Go to the Google Cloud Console.

Create a new project.

Navigate to APIs \& Services > Library and enable the Google Sheets API.

Go to APIs \& Services > Credentials.

Click Create Credentials > Service Account.

Give it a name and create it.

Open the created service account, go to the Keys tab, click Add Key > Create new key, select JSON, and download it.

Open the JSON file. You will need the client\_email and private\_key from it.

Go to your Google Sheet, click Share, and share the spreadsheet with the client\_email address from the JSON file (give it Editor access).

Copy the Spreadsheet ID from the URL (e.g., https://docs.google.com/spreadsheets/d/SPREADSHEET\_ID/edit).

