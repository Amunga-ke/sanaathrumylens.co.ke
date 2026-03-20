import { NextResponse } from 'next/server';
import { getPosts, getEvents, EventStatus } from '@/lib/db';
import { SITE_NAME, SITE_URL } from '../seo/constants';

// In-memory cache
let cachedRSS: string | null = null;
let lastGenerated = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

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

export async function GET() {
  const now = Date.now();

  // Return cached feed if it's still valid
  if (cachedRSS && now - lastGenerated < CACHE_DURATION) {
    return new NextResponse(cachedRSS, { headers: { 'Content-Type': 'application/rss+xml' } });
  }

  try {
    let posts: any[] = [];
    let events: any[] = [];

    try {
      // Fetch latest published content
      posts = await getPosts({ limit: 30 });
      events = await getEvents({ limit: 20, status: EventStatus.PUBLISHED });
    } catch (dbError: any) {
      console.error('Database fetch error in feed:', dbError?.message);
      posts = [];
      events = [];
    }

    // Combine and sort all content by date
    const allContent = [
      ...posts.map(post => ({
        type: 'post' as const,
        ...post,
        pubDate: post.publishedAt || post.createdAt,
        link: `${SITE_URL}/blogs/${post.slug}`,
        description: post.excerpt || ''
      })),
      ...events.map(event => ({
        type: 'event' as const,
        ...event,
        pubDate: event.startDate || event.createdAt,
        link: `${SITE_URL}/events/${event.slug || event.id}`,
        description: event.description || `Event happening on ${new Date(event.startDate).toLocaleDateString()}`
      }))
    ].filter(item => {
      if (item.type === 'event' && !item.startDate) return false;
      const date = new Date(item.pubDate);
      return !isNaN(date.getTime());
    }).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 50); // Limit to 50 items

    // Map content to RSS <item> format
    const items = allContent.map((item) => {
      const pubDate = item.pubDate
        ? new Date(item.pubDate).toUTCString()
        : new Date().toUTCString();

      let categoryTag = '';
      if (item.type === 'post' && item.category?.name) {
        categoryTag = `<category>${escapeXml(item.category.name)}</category>`;
      } else if (item.type === 'event') {
        categoryTag = `<category>Event</category>`;
      }

      // Add image if available
      let imageTag = '';
      if (item.coverImage || item.featuredImage) {
        const imageUrl = item.coverImage || item.featuredImage;
        if (imageUrl) {
          imageTag = `<enclosure url="${escapeXml(imageUrl)}" type="image/jpeg" />`;
        }
      }

      return `
    <item>
      <title><![CDATA[${item.type === 'event' ? '🎟️ ' : ''}${item.title}]]></title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.link)}</guid>
      <pubDate>${pubDate}</pubDate>
      ${categoryTag}
      ${imageTag}
      <description><![CDATA[${item.description || ''}]]></description>
    </item>`;
    });

    // Wrap items in RSS feed
    cachedRSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} - Latest Content</title>
    <link>${SITE_URL}</link>
    <description>Latest posts and events from ${SITE_NAME}</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${items.join('\n')}
  </channel>
</rss>`;

    // Update cache timestamp
    lastGenerated = now;

    return new NextResponse(cachedRSS, { headers: { 'Content-Type': 'application/rss+xml' } });
  } catch (err) {
    console.error('Feed generation error:', err);

    // Fallback: Return a minimal RSS feed even on error
    const fallbackRSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>Latest content from ${SITE_NAME}</description>
    <language>en-us</language>
  </channel>
</rss>`;

    return new NextResponse(fallbackRSS, {
      headers: { 'Content-Type': 'application/rss+xml' },
      status: 200
    });
  }
}
