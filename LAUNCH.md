# GrowthVault Shop — Launch Guide

> **Time to live: ~45 minutes**
> **Cost: $0** (Vercel free, Stripe only charges on sales)

---

## What's Built

- ✅ Next.js 14 app with App Router
- ✅ Homepage with 10 product cards
- ✅ 10 tailored product pages (each with unique accent color)
- ✅ Stripe Checkout (PWYW: user picks price)
- ✅ Free download ($0) bypasses Stripe
- ✅ Vercel Blob PDF storage
- ✅ On-page download after payment
- ✅ Email delivery via Resend (optional)
- ✅ All 10 PDFs included

---

## Step 1 — GitHub (5 min)

```bash
# 1. Navigate to the growthvault-shop folder
cd /path/to/growthvault-shop

# 2. Initialize git
git init
git add .
git commit -m "🚀 GrowthVault Shop — initial commit"

# 3. Create repo at github.com/new
#    Name: growthvault-shop | Public | No README

# 4. Push
git remote add origin https://github.com/YOUR_USERNAME/growthvault-shop.git
git push -u origin main
```

> **Password prompt:** Use a Personal Access Token (not your password)
> Create at: github.com/settings/tokens/new → scope: `repo`

---

## Step 2 — Vercel Deploy (5 min)

1. Go to **vercel.com/new**
2. "Continue with GitHub" → authorize
3. Find `growthvault-shop` → **Import**
4. Framework: **Next.js** (auto-detected)
5. **Deploy** → live in ~60 seconds

Your URL: `https://growthvault-shop.vercel.app` (or similar)

---

## Step 3 — Vercel Blob Storage (5 min)

1. In Vercel dashboard → your project → **Storage** tab
2. **Create Database** → **Blob** → Connect to project
3. Copy `BLOB_READ_WRITE_TOKEN` — you'll need it next

---

## Step 4 — Upload PDFs to Blob (5 min)

```bash
# In the growthvault-shop directory:
echo "BLOB_READ_WRITE_TOKEN=vercel_blob_rw_..." > .env.local
npm install
npm run upload-pdfs
```

This prints 10 `BLOB_URL_*` env vars. Copy them all.

---

## Step 5 — Stripe Setup (10 min)

1. Create account at **stripe.com** (free)
2. **Dashboard → API Keys** → copy both keys
3. **Dashboard → Webhooks → Add endpoint**:
   - URL: `https://YOUR-APP.vercel.app/api/webhook`
   - Events: `checkout.session.completed`
   - Copy the **signing secret** (`whsec_...`)

---

## Step 6 — Add Environment Variables in Vercel (5 min)

Vercel dashboard → Project → **Settings → Environment Variables**

Add all of these:

| Variable | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_rw_...` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `BLOB_URL_AI_PLAYBOOK` | (from upload-pdfs output) |
| `BLOB_URL_FREELANCER_FINANCE` | (from upload-pdfs output) |
| `BLOB_URL_SMALL_BIZ_AI` | (from upload-pdfs output) |
| `BLOB_URL_LOCAL_MARKETING` | (from upload-pdfs output) |
| `BLOB_URL_REMOTE_JOBS` | (from upload-pdfs output) |
| `BLOB_URL_WELLNESS_50` | (from upload-pdfs output) |
| `BLOB_URL_NOTION_OS` | (from upload-pdfs output) |
| `BLOB_URL_ETSY_GUIDE` | (from upload-pdfs output) |
| `BLOB_URL_HOMEOWNER_GUIDE` | (from upload-pdfs output) |
| `BLOB_URL_CAREER_PIVOT` | (from upload-pdfs output) |
| `RESEND_API_KEY` | `re_...` (optional) |
| `FROM_EMAIL` | `onboarding@resend.dev` (for free tier) |
| `FROM_NAME` | `GrowthVault` |

---

## Step 7 — Redeploy (1 min)

After adding env vars:
```bash
git commit --allow-empty -m "Trigger redeploy with env vars"
git push
```

Vercel auto-deploys in ~30 seconds.

---

## Step 8 — Test Full Flow (5 min)

1. Open your Vercel URL
2. Click any product → Get This Guide
3. Enter $1 → Pay → complete with Stripe test card `4242 4242 4242 4242`
4. Should land on `/success` → see download button
5. Also test $0 (free download)

> **Stripe test mode:** Use `sk_test_...` keys for testing, then switch to `sk_live_...` for real payments.

---

## Optional: Email Delivery via Resend

1. Create free account at **resend.com**
2. Dashboard → API Keys → Create key
3. Add `RESEND_API_KEY` in Vercel env vars
4. For custom domain email: verify your domain in Resend
   - Free tier: use `onboarding@resend.dev` as from address

---

## Optional: Beehiiv Newsletter

The homepage has a newsletter signup form. To connect to Beehiiv:

1. Get your Beehiiv subscribe URL from Settings → Subscribe Form
2. Edit `app/page.tsx`, find the `<form>` in the newsletter section
3. Add a `handleSubscribe` function:
```tsx
const handleSubscribe = (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  window.open(`https://YOUR-PUB.beehiiv.com/subscribe?email=${encodeURIComponent(email)}`, '_blank');
};
```

---

## Useful Commands

```bash
# Local development
npm run dev          # → http://localhost:3000

# Build check
npm run build        # Verify everything compiles before pushing

# Re-upload PDFs (e.g. after updating PDF files)
npm run upload-pdfs

# Deploy (just push to GitHub — Vercel auto-deploys)
git add . && git commit -m "update" && git push
```

---

## File Structure

```
growthvault-shop/
├── app/
│   ├── page.tsx              ← Homepage (10 product grid)
│   ├── [slug]/
│   │   ├── page.tsx          ← Product page (tailored per product)
│   │   └── CheckoutButton.tsx← PWYW checkout UI (client component)
│   ├── success/page.tsx      ← Download page (on-page + email)
│   ├── api/
│   │   ├── checkout/route.ts ← POST: create Stripe session
│   │   ├── webhook/route.ts  ← POST: Stripe webhook → send email
│   │   └── download/route.ts ← GET: verify payment → return PDF URL
│   ├── layout.tsx            ← Root layout + fonts
│   └── globals.css           ← Design system (dark/gold)
├── lib/
│   └── products.ts           ← All 10 product data
├── pdfs/                     ← PDF files (uploaded to Vercel Blob)
├── scripts/
│   └── upload-pdfs.mjs       ← Upload PDFs to Vercel Blob
├── .env.example              ← All required env vars
├── vercel.json               ← Vercel config
└── LAUNCH.md                 ← This file
```

---

*GrowthVault v2.0 — Next.js + Stripe + Vercel Blob*
*Built March 2026*
