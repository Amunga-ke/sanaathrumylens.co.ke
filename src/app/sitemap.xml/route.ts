import { NextResponse } from 'next/server';
import { getPosts, getEvents, EventStatus } from '@/lib/db';
import { SITE_URL } from '../seo/constants';

const MAX_URLS_PER_SITEMAP = 50000;

// In-memory cache for performance
let sitemapCache = {
    xml: null as string | null,
    timestamp: 0,
    ttl: 1000 * 60 * 10, // 10 minutes
};

// Escape XML special characters
const escapeXml = (unsafe: string): string => {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

// Helper: ensure valid URLs
const sanitizeUrl = (url: string): string | null => {
    if (!url) return null;
    try {
        return encodeURI(url);
    } catch {
        return null;
    }
};

// Determine changefreq and priority based on date
const heuristicsForDate = (isoDate: string | Date): { changefreq: string; priority: number } => {
    if (!isoDate) return { changefreq: 'monthly', priority: 0.6 };
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return { changefreq: 'monthly', priority: 0.6 };

    const ageDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays <= 7) return { changefreq: 'daily', priority: 0.9 };
    if (ageDays <= 30) return { changefreq: 'weekly', priority: 0.8 };
    return { changefreq: 'monthly', priority: 0.6 };
};

// Generate XML entry for a URL
const generateUrlEntry = (loc: string, lastmod: string | null = null, changefreq = 'weekly', priority = 0.7, images: string[] = []): string => {
    const imgBlock = images
        .map((img) => `\n    <image:image>\n      <image:loc>${escapeXml(img)}</image:loc>\n    </image:image>`)
        .join('');
    return `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${imgBlock}\n  </url>`;
};

// Build sitemap XML
const buildSitemapXml = (urlEntries: string[]): string => {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urlEntries.join(
        '\n'
    )}\n</urlset>`;
};

export async function GET() {
    try {
        // Return cached sitemap if valid
        if (sitemapCache.xml && Date.now() - sitemapCache.timestamp < sitemapCache.ttl) {
            return new NextResponse(sitemapCache.xml, { headers: { 'Content-Type': 'application/xml' } });
        }

        let posts: any[] = [];
        let events: any[] = [];

        try {
            // Fetch published posts from Prisma
            posts = await getPosts({ limit: MAX_URLS_PER_SITEMAP });
            if (!Array.isArray(posts)) posts = [];

            // Fetch published events from Prisma
            events = await getEvents({ limit: MAX_URLS_PER_SITEMAP, status: EventStatus.PUBLISHED });
            if (!Array.isArray(events)) events = [];
        } catch (dbError: any) {
            console.error('Database fetch error, using empty arrays:', dbError?.message);
            posts = [];
            events = [];
        }

        // Sort posts newest first
        posts.sort((a, b) => new Date(b.updatedAt || b.publishedAt).getTime() - new Date(a.updatedAt || a.publishedAt).getTime());

        // Sort events by start date (upcoming first)
        events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        // Dynamic URLs for posts
        const dynamicUrls = posts
            .map((post) => {
                if (!post.slug) return null;

                const loc = sanitizeUrl(`${SITE_URL}/blogs/${post.slug}`);
                if (!loc) return null;

                const lastmodDate = new Date(post.updatedAt || post.publishedAt || Date.now());
                const lastmod = isNaN(lastmodDate.getTime()) ? new Date().toISOString() : lastmodDate.toISOString();

                const { changefreq, priority } = heuristicsForDate(lastmod);

                // Support optional images
                const images = [post.coverImage, post.featuredImage].filter((img): img is string => typeof img === 'string');

                return generateUrlEntry(loc, lastmod, changefreq, priority, images);
            })
            .filter(Boolean) as string[];

        // Dynamic URLs for events
        const eventUrls = events
            .map((event) => {
                if (!event.slug && !event.id) return null;

                const loc = sanitizeUrl(`${SITE_URL}/events/${event.slug || event.id}`);
                if (!loc) return null;

                const lastmodDate = event.updatedAt ? new Date(event.updatedAt) : (event.startDate ? new Date(event.startDate) : new Date());
                const lastmod = isNaN(lastmodDate.getTime()) ? new Date().toISOString() : lastmodDate.toISOString();

                const { changefreq, priority } = heuristicsForDate(lastmod);

                // Support optional images for events
                const images = [event.coverImage].filter((img): img is string => typeof img === 'string');

                return generateUrlEntry(loc, lastmod, changefreq, 0.8, images);
            })
            .filter(Boolean) as string[];

        // Static URLs
        const staticPages = [
            '/',
            '/blogs',
            '/events',
            '/about',
            '/author',
            '/categories',
            '/tags'
        ];

        const staticUrls = staticPages
            .map((path) => {
                const loc = sanitizeUrl(`${SITE_URL}${path}`);
                if (!loc) return null;

                // Set priority for important pages
                let priority = 0.8;
                if (path === '/') priority = 1.0;
                if (path === '/events') priority = 0.9;
                if (path === '/blogs') priority = 0.9;

                return generateUrlEntry(loc, null, 'weekly', priority);
            })
            .filter(Boolean) as string[];

        // Combine all URLs
        const allUrls = [...staticUrls, ...dynamicUrls, ...eventUrls];

        // Handle sitemap splitting if needed
        const sitemapXml = buildSitemapXml(allUrls.slice(0, MAX_URLS_PER_SITEMAP));

        // Cache
        sitemapCache.xml = sitemapXml;
        sitemapCache.timestamp = Date.now();

        return new NextResponse(sitemapXml, { headers: { 'Content-Type': 'application/xml' } });
    } catch (err) {
        console.error('Sitemap generation error:', err);

        // If everything fails, return at least a basic valid sitemap
        const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL || 'https://yoursite.com'}</loc>
    <priority>1.0</priority>
  </url>
</urlset>`;

        return new NextResponse(fallbackXml, {
            headers: { 'Content-Type': 'application/xml' },
            status: 200 // Still return 200 even on error to avoid SEO issues
        });
    }
}
