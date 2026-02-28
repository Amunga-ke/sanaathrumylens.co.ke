// src/app/(website)/page.js (Server Component)

// Option 1: If your seo folder is at app/seo/

import { generateHomeMetadata } from '../seo/meta';
import { SITE_NAME, SITE_URL } from '../seo/constants';
import HomeClientPage from './HomeClientPage';

// Option 2: If your seo folder is at src/app/seo/ (relative to this file)
// import { SITE_NAME, SITE_URL } from '../seo/constants';
// import { generateHomeMetadata } from '../seo/meta';

// Option 3: If you're having path issues, define the metadata directly:
// export const metadata = {
//   title: `${SITE_NAME} - Architecture, Design & Technology`,
//   description: 'High-quality articles, insights, and updates on architecture, design, and technology.',
//   alternates: {
//     canonical: SITE_URL,
//   },
//   openGraph: {
//     type: 'website',
//     title: `${SITE_NAME} - Architecture, Design & Technology`,
//     description: 'High-quality articles, insights, and updates on architecture, design, and technology.',
//     url: SITE_URL,
//     siteName: SITE_NAME,
//     images: [
//       {
//         url: '/og/default-og.png',
//         width: 1200,
//         height: 630,
//         alt: `${SITE_NAME} - Architecture, Design & Technology`,
//       },
//     ],
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: `${SITE_NAME} - Architecture, Design & Technology`,
//     description: 'High-quality articles, insights, and updates on architecture, design, and technology.',
//     images: ['/og/default-og.png'],
//     creator: '@yoursite',
//   },
//   robots: {
//     index: true,
//     follow: true,
//     googleBot: {
//       index: true,
//       follow: true,
//       'max-video-preview': -1,
//       'max-image-preview': 'large',
//       'max-snippet': -1,
//     },
//   },
// };

export const metadata = generateHomeMetadata();

// Helper to serialize dates for client
function serializeData(data) {
    const serialized = { ...data };

    // Serialize articles
    if (serialized.articles) {
        serialized.articles = serialized.articles.map(article => ({
            ...article,
            publishedAt: article.publishedAt?.toISOString?.(),
            createdAt: article.createdAt?.toISOString?.(),
        }));
    }

    // Serialize popular articles
    if (serialized.popularArticles) {
        serialized.popularArticles = serialized.popularArticles.map(article => ({
            ...article,
            publishedAt: article.publishedAt?.toISOString?.(),
        }));
    }

    // Serialize upcoming events
    if (serialized.upcomingEvents) {
        serialized.upcomingEvents = serialized.upcomingEvents.map(event => ({
            ...event,
            startDate: event.startDate?.toISOString?.(),
            endDate: event.endDate?.toISOString?.(),
        }));
    }

    // Serialize recent stories
    if (serialized.recentStories) {
        serialized.recentStories = serialized.recentStories.map(story => ({
            ...story,
            createdAt: story.createdAt?.toISOString?.(),
        }));
    }

    // Serialize featured article
    if (serialized.featuredArticle) {
        serialized.featuredArticle = {
            ...serialized.featuredArticle,
            publishedAt: serialized.featuredArticle.publishedAt?.toISOString?.(),
            createdAt: serialized.featuredArticle.createdAt?.toISOString?.(),
        };
    }

    return serialized;
}

export default async function HomePage() {
    // Server-side only structured data
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': SITE_NAME,
        'url': SITE_URL,
        'description': 'High-quality articles, insights, and updates on architecture, design, and technology.',
        'potentialAction': {
            '@type': 'SearchAction',
            'target': `${SITE_URL}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData)
                }}
            />
            <HomeClientPage
                siteUrl={SITE_URL}
                siteName={SITE_NAME}
            />
        </>
    );
}