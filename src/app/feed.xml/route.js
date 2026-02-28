import { NextResponse } from 'next/server';
import { fetchPublishedPosts, fetchPublishedEvents } from '@/lib/serverFirestore';
import { SITE_NAME, SITE_URL } from '../seo/constants';

// In-memory cache
let cachedRSS = null;
let lastGenerated = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

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
  // DEBUG - Comment this out to allow Firebase execution
  // return new NextResponse('Feed Route reached!', { status: 200 });

  const now = Date.now();

  // Return cached feed if it's still valid
  if (cachedRSS && now - lastGenerated < CACHE_DURATION) {
    return new NextResponse(cachedRSS, { headers: { 'Content-Type': 'application/rss+xml' } });
  }

  try {
    // Add fallback for Firebase errors
    let posts = [];
    let events = [];

    try {
      // Fetch latest published content
      posts = await fetchPublishedPosts(30);
      events = await fetchPublishedEvents(20);
    } catch (firebaseError) {
      console.error('Firebase fetch error in feed:', firebaseError.message);
      // Continue with empty arrays if Firebase fails
      posts = [];
      events = [];
    }

    // Combine and sort all content by date
    const allContent = [
      ...posts.map(post => ({
        type: 'post',
        ...post,
        pubDate: post.publishedAt || post.createdAt,
        link: `${SITE_URL}/blogs/${post.slug}`,
        description: post.excerpt || post.description || ''
      })),
      ...events.map(event => ({
        type: 'event',
        ...event,
        pubDate: event.startDate || event.createdAt,
        link: `${SITE_URL}/events/${event.slug || event.id}`,
        description: event.description || event.excerpt || `Event happening on ${new Date(event.startDate).toLocaleDateString()}`
      }))
    ].filter(item => {
      if (item.type === 'event' && !item.startDate) return false;
      const date = new Date(item.pubDate);
      return !isNaN(date.getTime());
    }).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 50); // Limit to 50 items

    // Map content to RSS <item> format
    const items = allContent.map((item) => {
      const pubDate = item.pubDate
        ? new Date(item.pubDate).toUTCString()
        : new Date().toUTCString();

      let categoryTag = '';
      if (item.type === 'post' && item.category) {
        categoryTag = `<category>${item.category}</category>`;
      } else if (item.type === 'event') {
        categoryTag = `<category>Event</category>`;
        if (item.category) {
          categoryTag += `<category>${item.category}</category>`;
        }
      }

      // Add image if available
      let imageTag = '';
      if (item.coverImage || item.featuredImage) {
        let imageUrl = '';
        if (typeof item.coverImage === 'string') imageUrl = item.coverImage;
        else if (item.coverImage?.url) imageUrl = item.coverImage.url;
        else if (typeof item.featuredImage === 'string') imageUrl = item.featuredImage;
        else if (item.featuredImage?.url) imageUrl = item.featuredImage.url;

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