// src/app/events/page.js
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE, DEFAULT_DESCRIPTION, TWITTER_HANDLE } from './../../seo/constants';
import EventsClientPage from './EventsClientPage';

export const metadata = {
    title: `Events & Gatherings - ${SITE_NAME}`,
    description: 'Discover workshops, meetups, concerts, and creative gatherings in Kenya. Find and join amazing events happening near you.',
    alternates: {
        canonical: `${SITE_URL}/events`,
    },
    openGraph: {
        type: 'website',
        title: `Events & Gatherings - ${SITE_NAME}`,
        description: 'Discover workshops, meetups, concerts, and creative gatherings in Kenya.',
        url: `${SITE_URL}/events`,
        siteName: SITE_NAME,
        images: [
            {
                url: DEFAULT_OG_IMAGE,
                width: 1200,
                height: 630,
                alt: 'Events & Gatherings',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: `Events & Gatherings - ${SITE_NAME}`,
        description: 'Discover workshops, meetups, concerts, and creative gatherings in Kenya.',
        images: [DEFAULT_OG_IMAGE],
        creator: TWITTER_HANDLE,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    // Structured data for events page
    other: {
        'script:ld+json': JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            'name': 'Events & Gatherings',
            'description': 'Discover workshops, meetups, concerts, and creative gatherings in Kenya.',
            'url': `${SITE_URL}/events`,
            'inLanguage': 'en-US',
            'breadcrumb': {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                    {
                        '@type': 'ListItem',
                        'position': 1,
                        'name': SITE_NAME,
                        'item': SITE_URL
                    },
                    {
                        '@type': 'ListItem',
                        'position': 2,
                        'name': 'Events',
                        'item': `${SITE_URL}/events`
                    }
                ]
            }
        })
    }
};

export default function EventsPage() {
    return <EventsClientPage siteUrl={SITE_URL} />;
}