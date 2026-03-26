# Smart Invoice Generator

A professional SaaS-style invoice generator with premium UI, PDF export, dark/light theme, and full invoice management.

![Smart Invoice](https://img.shields.io/badge/Smart-Invoice-6366f1?style=for-the-badge)

## Features

- 🎨 **Premium UI** — Modern glassmorphism design with dark/light theme
- 🔐 **Authentication** — Email/password + Google OAuth via Supabase
- 💾 **Cloud Storage** — Invoices saved to Supabase PostgreSQL database
- 📄 **PDF Export** — Generate and download professional PDF invoices
- ☁️ **PDF Cloud Backup** — Auto-upload PDFs to Supabase Storage
- 🖼️ **Logo Upload** — Company logos stored in Supabase Storage
- 🔍 **Search & History** — Browse, search, edit, and delete past invoices
- 📱 **Responsive** — Works on desktop, tablet, and mobile
- 🇮🇳 **Multi-currency** — INR (₹), USD ($), EUR (€)

## Tech Stack

- **Frontend**: React 18 + htm (no build step needed)
- **Styling**: Tailwind CSS (CDN)
- **Backend**: Supabase (Auth, Database, Storage)
- **PDF**: html2canvas + jsPDF
- **Deployment**: Vercel (static site)

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vipul0904/smart-invoice)

1. Click the button above or import the repo in [Vercel Dashboard](https://vercel.com/new)
2. No build configuration needed — it's a static site
3. Deploy!

## Local Development

```bash
# Clone the repo
git clone https://github.com/vipul0904/smart-invoice.git
cd smart-invoice

# Serve locally (Python)
python server.py
# App runs at http://localhost:8889
```

## Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Update `js/supabase.js` with your project URL and anon key
3. Run the database migrations (tables: `invoices`, `invoice_items`)
4. Create storage buckets: `logos`, `pdfs`
5. Enable Google OAuth in Supabase Auth settings

## License

MIT
