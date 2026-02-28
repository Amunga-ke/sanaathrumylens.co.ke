// src/app/robots.txt/route.js
import { NextResponse } from 'next/server';
import { SITE_URL } from '../seo/constants';

// const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.co.ke';

export async function GET() {
    const robots = `# https://${new URL(SITE_URL).hostname}/robots.txt
User-agent: *
Allow: /

# Disallow admin/dashboard areas
Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/private/
Disallow: /auth/

# Next.js specific paths
Disallow: /_next/static/
Disallow: /_next/data/

# Allow necessary Next.js assets
Allow: /_next/static/chunks/
Allow: /_next/static/css/
Allow: /_next/static/media/

# Scripts
Disallow: /scripts/

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl delay for all bots
Crawl-delay: 2

# For GPTBot (OpenAI)
User-agent: GPTBot
Disallow: /

# For CCBot (Common Crawl)
User-agent: CCBot
Allow: /
Crawl-delay: 5`;

    return new NextResponse(robots, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=86400', // 24 hours
        }
    });
}