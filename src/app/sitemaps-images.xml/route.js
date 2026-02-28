// src/app/sitemaps-images.xml/route.js
import { NextResponse } from 'next/server';
import { fetchPublishedPosts, fetchPublishedEvents } from '@/lib/serverFirestore';

import { SITE_URL } from '../seo/constants';

// Escape XML special characters
const escapeXml = (unsafe) => {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

export async function GET() {
    try {
        const [posts, events] = await Promise.all([
            fetchPublishedPosts(500),
            fetchPublishedEvents(500)
        ]);

        // Process posts
        const postItems = posts
            .filter((post) => post.coverImage || post.featuredImage || (post.images && post.images.length > 0))
            .map((post) => {
                const loc = `${SITE_URL}/blogs/${post.slug}`;
                const title = escapeXml(post.title || '');

                // Collect all images
                const images = [
                    post.coverImage?.url || post.coverImage,
                    post.featuredImage?.url || post.featuredImage,
                    ...(Array.isArray(post.images) ? post.images.map(img => img.url || img) : []),
                ].filter(img => typeof img === 'string');

                const imageBlocks = images
                    .map((img) => `    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:caption>${title}</image:caption>
      <image:title>${title}</image:title>
    </image:image>`)
                    .join('\n');

                return `  <url>
    <loc>${escapeXml(loc)}</loc>
${imageBlocks}
  </url>`;
            });

        // Process events
        const eventItems = events
            .filter((event) => event.coverImage || event.featuredImage)
            .map((event) => {
                const loc = `${SITE_URL}/events/${event.slug || event.id}`;
                const title = escapeXml(event.title || '');

                // Collect all images
                const images = [
                    event.coverImage?.url || event.coverImage,
                    event.featuredImage?.url || event.featuredImage,
                ].filter(img => typeof img === 'string');

                const imageBlocks = images
                    .map((img) => `    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:caption>${title}</image:caption>
      <image:title>${title}</image:title>
    </image:image>`)
                    .join('\n');

                return `  <url>
    <loc>${escapeXml(loc)}</loc>
${imageBlocks}
  </url>`;
            });

        const allItems = [...postItems, ...eventItems];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allItems.join('\n')}
</urlset>`;

        return new NextResponse(xml, {
            headers: { 'Content-Type': 'application/xml' },
        });
    } catch (error) {
        console.error('Error generating image sitemap:', error);
        return new NextResponse(`Error generating image sitemap: ${error.message}`, { status: 500 });
    }
}