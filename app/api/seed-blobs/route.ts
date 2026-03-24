import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

const REPO = 'https://raw.githubusercontent.com/fr4eddy-hash/growthvault-shop/main/pdfs/';
const PDF_MAP = [
    { file: '01-ai-playbook.pdf', slug: 'ai-playbook' },
    { file: '02-freelancer-money-system.pdf', slug: 'freelancer-finance' },
    { file: '03-small-business-ai-toolkit.pdf', slug: 'small-biz-ai' },
    { file: '04-local-marketing-playbook.pdf', slug: 'local-marketing' },
    { file: '05-remote-job-blueprint.pdf', slug: 'remote-jobs' },
    { file: '06-wellness-50-plus.pdf', slug: 'wellness-50' },
    { file: '07-solopreneur-notion-os.pdf', slug: 'notion-os' },
    { file: '08-etsy-launch-kit.pdf', slug: 'etsy-guide' },
    { file: '09-homeowner-survival-guide.pdf', slug: 'homeowner-guide' },
    { file: '10-career-pivot-blueprint.pdf', slug: 'career-pivot' },
  ];

export async function GET() {
    const results: { slug: string; url: string; envKey: string }[] = [];
    for (const { file, slug } of PDF_MAP) {
          const res = await fetch(REPO + file);
          if (!res.ok) return NextResponse.json({ error: file + ': ' + res.status }, { status: 500 });
          const buffer = await res.arrayBuffer();
          const blob = await put('pdfs/' + slug + '.pdf', buffer, {
                  access: 'public',
                  contentType: 'application/pdf',
                  addRandomSuffix: false,
                });
          results.push({ slug, url: blob.url, envKey: 'BLOB_URL_' + slug.toUpperCase().replace(/-/g, '_') });
        }
    return NextResponse.json({ success: true, results });
  }
