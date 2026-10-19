# NFC & QR Card Management System

A production-ready Next.js 14 web application for managing dynamic QR and NFC business cards. Physical cards feature permanent QR codes pointing to `https://DOMAIN/c/CODE`. Administrators can dynamically reassign each card to any shop link, disable lost cards, or set custom destination links—all without reprinting physical cards.

## Features

- **Dynamic QR Redirects**: Lightning-fast 307 redirects to assigned shop URLs or custom links with automated scan logging.
- **Admin Dashboard**: Real-time statistics including total cards, assigned vs unassigned cards, disabled count, and scan analytics.
- **Card Management**: Filterable and searchable cards list by card number, code, batch name, shop, or status.
- **Quick Assign (Mobile First)**: 3-step assignment flow with built-in camera QR scanner, live shop search, instant save, and 5-second undo toast.
- **Shop Directory**: Manage partner/client shops with name, target URL, and operational notes.
- **Batch Generator**: Generate up to 500 unique 6-character alphanumeric QR card codes per batch.
- **QR Export & Printing**: Download full batches as a compressed ZIP of 300px QR code PNGs or view a printable sheet grid.
- **Supabase Authentication & Row-Level Security**: Magic link authentication with email verification against the `admins` table.
- **Dark Mode**: Seamless class-based dark mode toggle with zero-flicker inline script.

## Tech Stack

- **Framework**: Next.js 14 (App Router, JavaScript)
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL, Row-Level Security, Auth)
- **QR Generation**: `qrcode`, `jszip`, `file-saver`
- **QR Scanning**: `html5-qrcode` (client camera integration)

## Getting Started

### 1. Database Setup
Execute the SQL commands in `schema.sql` in your Supabase project's SQL editor.

Add your administrator email to the `admins` table:
```sql
insert into admins (email) values ('your-email@example.com');
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your project credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.
