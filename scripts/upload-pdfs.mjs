#!/usr/bin/env node
/**
 * GrowthVault — Upload PDFs to Vercel Blob
 *
 * Run ONCE after setting up Vercel Blob storage:
 *   npm run upload-pdfs
 *
 * What it does:
 *   1. Reads all PDFs from ../pdfs/ (relative to this script)
 *   2. Uploads them to Vercel Blob storage
 *   3. Prints the BLOB_URL_* env vars to add in Vercel dashboard
 *
 * Requirements:
 *   - BLOB_READ_WRITE_TOKEN set in .env.local or environment
 *   - PDFs present in the pdfs/ directory
 */

import { put } from '@vercel/blob';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PDF_DIR = join(__dirname, '..', 'pdfs');

// Map of PDF filename → product slug
const PDF_MAP = {
  '01-ai-playbook.pdf':               'ai-playbook',
  '02-freelancer-money-system.pdf':   'freelancer-finance',
  '03-small-business-ai-toolkit.pdf': 'small-biz-ai',
  '04-local-marketing-playbook.pdf':  'local-marketing',
  '05-remote-job-blueprint.pdf':      'remote-jobs',
  '06-wellness-50-plus.pdf':          'wellness-50',
  '07-solopreneur-notion-os.pdf':     'notion-os',
  '08-etsy-launch-kit.pdf':           'etsy-guide',
  '09-homeowner-survival-guide.pdf':  'homeowner-guide',
  '10-career-pivot-blueprint.pdf':    'career-pivot',
};

async function uploadPdfs() {
  console.log('\n🚀 GrowthVault PDF Uploader\n');

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN is not set!');
    console.error('   Add it to .env.local from your Vercel Blob storage dashboard.');
    process.exit(1);
  }

  let files;
  try {
    files = readdirSync(PDF_DIR).filter((f) => f.endsWith('.pdf'));
  } catch {
    console.error(`❌ pdfs/ directory not found at: ${PDF_DIR}`);
    console.error('   Make sure your PDFs are in the pdfs/ folder.');
    process.exit(1);
  }

  if (files.length === 0) {
    console.error('❌ No PDFs found in pdfs/ directory!');
    process.exit(1);
  }

  console.log(`Found ${files.length} PDF(s). Uploading...\n`);

  const results = [];

  for (const filename of files) {
    const slug = PDF_MAP[filename];
    if (!slug) {
      console.log(`⚠️  Skipping ${filename} — not in PDF_MAP`);
      continue;
    }

    const filePath = join(PDF_DIR, filename);
    const fileBuffer = readFileSync(filePath);
    const blobKey = `pdfs/${slug}.pdf`;

    process.stdout.write(`  Uploading ${filename}... `);

    try {
      const blob = await put(blobKey, fileBuffer, {
        access: 'public',
        contentType: 'application/pdf',
        addRandomSuffix: false,
      });

      console.log(`✅ Done`);
      results.push({ slug, url: blob.url, envKey: `BLOB_URL_${slug.toUpperCase().replace(/-/g, '_')}` });
    } catch (err) {
      console.log(`❌ Failed`);
      console.error(`   Error: ${err.message}`);
    }
  }

  if (results.length === 0) {
    console.error('\n❌ No PDFs were uploaded successfully.');
    process.exit(1);
  }

  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ Upload complete! Add these env vars in Vercel:               ║');
  console.log('║  Project → Settings → Environment Variables                     ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  for (const { envKey, url } of results) {
    console.log(`${envKey}=${url}`);
  }

  console.log('\n📋 Copy all of the above and add them in Vercel dashboard.');
  console.log('   Then redeploy: git commit --allow-empty -m "Add blob URLs" && git push\n');
}

uploadPdfs().catch(console.error);
