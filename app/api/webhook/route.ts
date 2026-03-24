import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { head } from '@vercel/blob';
import { getProduct } from '@/lib/products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Send email via Resend (optional — skipped if RESEND_API_KEY not set)
async function sendDownloadEmail(
  toEmail: string,
  customerName: string,
  productTitle: string,
  downloadUrl: string,
  appUrl: string
) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log('RESEND_API_KEY not set — skipping email');
    return;
  }

  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  const fromName = process.env.FROM_NAME || 'GrowthVault';

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  body { font-family: 'DM Sans', Arial, sans-serif; background: #080808; color: #f0ece4; margin: 0; padding: 0; }
  .wrap { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
  .logo { font-size: 1.4rem; font-weight: 300; color: #fff; letter-spacing: 0.04em; margin-bottom: 32px; }
  .logo span { color: #E8A020; }
  h1 { font-size: 1.8rem; font-weight: 300; color: #fff; margin: 0 0 12px; }
  p { color: #888; line-height: 1.7; margin: 0 0 20px; font-size: 15px; }
  .btn { display: inline-block; background: #34C97A; color: #fff; font-weight: 600; padding: 16px 36px; border-radius: 100px; text-decoration: none; font-size: 16px; margin: 8px 0 24px; }
  .note { font-size: 12px; color: #555; }
  .divider { border: none; border-top: 1px solid #1e1e1e; margin: 32px 0; }
  .footer { font-size: 12px; color: #444; text-align: center; }
  .footer a { color: #555; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">Growth<span>Vault</span></div>
  <h1>Your download is ready 🎉</h1>
  <p>Hi ${customerName || 'there'},</p>
  <p>Thank you for supporting GrowthVault. Your copy of <strong style="color:#fff">${productTitle}</strong> is ready to download.</p>
  <a href="${downloadUrl}" class="btn">↓ Download Your Guide</a>
  <p class="note">⚠️ This link is personal to you. It expires in 24 hours.</p>
  <hr class="divider" />
  <p>Not sure where to start? Open the guide and jump straight to the last chapter — it has your 30-day action plan. Start there.</p>
  <p>If you have any questions or feedback, reply directly to this email.</p>
  <p style="color:#666; font-size:13px">— The GrowthVault Team</p>
  <hr class="divider" />
  <p class="footer">
    GrowthVault · <a href="${appUrl}">${appUrl.replace('https://', '')}</a><br />
    You received this because you purchased a guide. No further emails unless you subscribe.<br />
  </p>
</div>
</body>
</html>
  `.trim();

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [toEmail],
        subject: `Your download: ${productTitle}`,
        html: emailHtml,
        reply_to: fromEmail,
      }),
    });
    const data = await res.json();
    if (!res.ok) console.error('Resend error:', data);
    else console.log('Email sent:', data.id);
  } catch (err) {
    console.error('Email send error:', err);
    // Non-fatal: don't fail the webhook
  }
}

// Get signed download URL from Vercel Blob
async function getDownloadUrl(slug: string): Promise<string | null> {
  try {
    // PDF keys are set by upload-pdfs.mjs — stored as {slug}.pdf in Blob
    const blobUrl = process.env[`BLOB_URL_${slug.toUpperCase().replace(/-/g, '_')}`];
    if (blobUrl) return blobUrl;

    // Fallback: try to find via Vercel Blob
    const { url } = await head(`pdfs/${slug}.pdf`);
    return url;
  } catch {
    console.error(`Could not find blob for slug: ${slug}`);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== 'paid') return NextResponse.json({ ok: true });

    const slug = session.metadata?.slug;
    const product = slug ? getProduct(slug) : null;

    if (!slug || !product) {
      console.error('No slug in session metadata:', session.id);
      return NextResponse.json({ ok: true });
    }

    // Get customer email
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || 'there';

    if (customerEmail) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://growthvault.vercel.app';
      const downloadUrl = `${appUrl}/success?session_id=${session.id}&slug=${slug}`;

      await sendDownloadEmail(
        customerEmail,
        customerName,
        product.title,
        downloadUrl,
        appUrl
      );
    }

    console.log(`✅ Processed payment for ${product.title} — customer: ${customerEmail}`);
  }

  return NextResponse.json({ ok: true });
}
