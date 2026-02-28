# Sanaathrumylens — SEO & Content Configuration

## Overview

This project is a Next.js blog/event platform built with Firebase Firestore, featuring comprehensive SEO, metadata generation, dynamic Open Graph images, and full content discoverability.

## Getting Started

### Environment Setup

Create a `.env.local` file in the project root with the following variables:

```env
# Firebase (public)
NEXT_PUBLIC_FIREBASE_API_KEY=<your_api_key>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your_project_id>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your_auth_domain>
NEXT_PUBLIC_FIREBASE_DATABASE_URL=<your_database_url>

# Firebase Admin (private server-side only)
NEXT_PUBLIC_FIREBASE_PRIVATE_KEY=<your_private_key>
NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL=<your_client_email>

# Site info
SITE_URL=https://sanaathrumylens.co.ke
SITE_NAME=Sanaathrumylens
SITE_DESCRIPTION=Stories and insights on photography, travel, and culture.
```

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## SEO Features Implemented

### 1. **Server-Side Metadata & Head Files**

- `/app/(website)/blogs/head.js` — Blog list metadata with per-page canonical, OG, pagination rel=prev/next
- `/app/(website)/blogs/[slug]/head.js` — Individual post metadata with JSON-LD (Article + BreadcrumbList)
- `/app/(website)/events/head.js` — Events list metadata with pagination
- `/app/(website)/events/[slug]/head.js` — Individual event metadata with Event schema JSON-LD
- `/app/(website)/author/[slug]/head.js` — Author profile metadata with OG
- `/app/(website)/tags/[slug]/head.js` — Tag-filtered articles metadata
- `/app/(website)/head.js`, `categories/head.js`, `tags/head.js` — Homepage and collection pages
- ISR enabled (`revalidate=60`) for all metadata-generating head files

### 2. **Dynamic Open Graph Image Generation (Edge Routes)**

- `/app/og/[slug]/route.js` — Blog post social images (title + author overlay on cover image)
- `/app/og/events/[slug]/route.js` — Event social images (date + title)
- `/app/og/authors/[slug]/route.js` — Author profile images (avatar + name)
- `/app/og/pages/[slug]/route.js` — Generic page images (homepage, categories, tags)
- All routes use Vercel OG (`@vercel/og`) for Edge runtime rendering

### 3. **Structured Data (JSON-LD)**

- `Article` schema with BreadcrumbList for blog posts
- `Event` schema for events
- `CollectionPage` for blog/event lists
- `Person` schema for authors (implied via OpenGraph)
- Schema unified in `src/utils/seo.js`

### 4. **Sitemap & RSS**

- `/app/sitemaps.xml/route.js` — Dynamic XML sitemap including all published posts and static pages
- `/app/feed.xml/route.js` — RSS feed with recent articles
- Sitemap link embedded in `robots.txt`

### 5. **Robots & Crawl Control**

- `public/robots.txt` — Disallows `/dashboard`, `/api/private`, `/auth`, `/_next`, `/scripts`
- Dashboard pages have `<meta name="robots" content="noindex, nofollow">`
- Non-existent blog posts (drafts, unpublished) return `noindex` via metadata

### 6. **Image Standardization**

- All content uses `coverImage` (preferred) with fallback to `featuredImage` for compatibility
- Server helper (`src/lib/serverFirestore.js`) standardizes image field names
- Client components use `(coverImage || featuredImage)` pattern

### 7. **API Routes for Content Discovery**

- `/api/posts/by-author/[slug]` — Fetch all posts by an author
- `/api/posts/by-tag/[slug]` — Fetch all posts with a specific tag
- `/api/authors/[slug]` — Fetch author details (from 'authors' or 'users' collection)

## Content Paths

### Blog Posts

- **List:** `/blogs` (paginated with ?page=N)
- **Detail:** `/blogs/[slug]`
- **Author:** `/author/[slug]` (all posts by author)
- **Tag:** `/tags/[slug]` (all posts with tag)

### Events

- **List:** `/events` (paginated)
- **Detail:** `/events/[slug]`

### Authors

- **Profile:** `/author/[slug]`

### Tags

- **Browse:** `/tags` (all tags)
- **Filter:** `/tags/[slug]` (articles with tag)

## Firestore Document Structure

### Posts Collection

```javascript
{
  slug: String,
  title: String,
  excerpt: String,
  description: String,
  content: String,
  coverImage: String,  // NEW: preferred image field
  featuredImage: String, // LEGACY: kept for compatibility
  tags: String[],
  status: 'published' | 'draft',
  isDeleted: Boolean,
  publishedAt: Timestamp,
  updatedAt: Timestamp,
  author: { name: String, slug: String }, // or authorSnapshot
}
```

### Events Collection

```javascript
{
  slug: String,
  title: String,
  description: String,
  excerpt: String,
  coverImage: String,
  startDate: Timestamp,
  endDate: Timestamp,
  location: String,
  isOnline: Boolean,
  status: 'published' | 'draft',
  isDeleted: Boolean,
  createdBy: String,
}
```

### Authors Collection (Optional; defaults to users)

```javascript
{
  slug: String,
  name: String,
  displayName: String,
  bio: String,
  avatar: String,
  photoURL: String,
}
```

## Scripts

### Firestore Data Migration

Add `coverImage` field to posts and events where `featuredImage` exists:

```bash
node --experimental-specifier-resolution=node scripts/migrate-add-coverImage.mjs
```

**Requirements:** `.env.local` with Firebase admin credentials.

## Google Search Console Setup

### 1. Submit Sitemap

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Navigate to **Sitemaps** (under Index section)
4. Add: `https://sanaathrumylens.co.ke/sitemaps.xml`
5. Click "Submit"

### 2. Verify JSON-LD

1. Use [Google's Rich Results Test](https://search.google.com/test/rich-results)
2. Paste any blog post URL (e.g., `https://sanaathrumylens.co.ke/blogs/sample-post`)
3. Verify Article and BreadcrumbList schemas render

### 3. Monitor Performance

- Queries → See which keywords drive traffic
- Coverage → Monitor any crawl/index issues
- Core Web Vitals → Check LCP, CLS, FID metrics

## Build & Deployment

### Local Build

```bash
npm run build
npm run start
```

### Vercel Deployment

1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel project settings
4. Deploy

**Note:** Edge Functions (OG image routes) require Vercel or compatible edge runtime.

## Performance Tuning (Optional)

### Image Optimization

- Use Next.js `<Image>` component with `priority` for above-fold images
- Set explicit `width` and `height` to prevent layout shift
- Use `unoptimized` for external image URLs (temporary workaround)

### Caching

- ISR set to 60 seconds (`revalidate=60`) for all metadata and OG routes
- Adjust revalidate interval based on content update frequency

### Core Web Vitals

- Monitor via [PageSpeed Insights](https://pagespeed.web.dev/)
- Focus on LCP (Largest Contentful Paint) and CLS (Cumulative Layout Shift)

## Troubleshooting

### Sitemap Not Updating

- Verify Firestore has posts with `status: 'published'` and `isDeleted: false`
- Check `/sitemaps.xml` endpoint in browser (should return XML)
- Resubmit to Google Search Console

### OG Images Not Rendering

- Ensure `@vercel/og` is installed: `npm list @vercel/og`
- Visit OG route directly (e.g., `/og/blogs/sample-post`) to debug
- Check Edge runtime errors in Vercel Logs

### Metadata Not Appearing

- Verify head files export `generateMetadata()` for Next.js to recognize them
- Check browser DevTools → Elements → `<head>` for meta tags
- Ensure `revalidate` is set for ISR

### Author/Tag Pages Empty

- Verify Firestore documents have `author.slug` or `tags` fields
- Check API routes (`/api/posts/by-author/[slug]`, `/api/posts/by-tag/[slug]`) in browser
- Ensure author slugs are URL-safe (lowercase, hyphens for spaces)

## Additional Resources

- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org Vocabulary](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
