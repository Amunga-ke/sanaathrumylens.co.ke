//src/app/seo/meta.js

import { SITE_NAME, SITE_URL, TWITTER_HANDLE, DEFAULT_OG_IMAGE, DEFAULT_DESCRIPTION } from './constants';

/**
 * Generates SEO metadata for blog listing pages
 */
export function generateBlogListingMetadata(filters = {}) {
    const { page = 1, search = '', category = '' } = filters;
    const baseTitle = `${SITE_NAME} - Blog & Articles`;
    let pageTitle = baseTitle;
    let description = DEFAULT_DESCRIPTION;
    let canonicalUrl = `${SITE_URL}/blogs`;

    // Build dynamic titles and descriptions
    if (search) {
        pageTitle = `Search: "${search}" - ${SITE_NAME}`;
        description = `Search results for "${search}" in our articles collection.`;
    } else if (category) {
        pageTitle = `${category} Articles - ${SITE_NAME}`;
        description = `Browse ${category} articles, insights, and stories on ${SITE_NAME}.`;
    } else if (page > 1) {
        pageTitle = `Page ${page} - ${baseTitle}`;
        description = `Browse page ${page} of articles and blog posts on ${SITE_NAME}.`;
    }

    // Build canonical URL with filters
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page);
    if (search) params.set('q', search);
    if (category) params.set('category', category);

    if (params.toString()) {
        canonicalUrl = `${canonicalUrl}?${params.toString()}`;
    }

    const metadata = {
        title: pageTitle,
        description: description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            type: 'website',
            title: pageTitle,
            description: description,
            url: canonicalUrl,
            siteName: SITE_NAME,
            images: [
                {
                    url: DEFAULT_OG_IMAGE,
                    width: 1200,
                    height: 630,
                    alt: pageTitle,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: description,
            images: [DEFAULT_OG_IMAGE],
            creator: TWITTER_HANDLE,
        },
        robots: {
            index: page === 1, // Only index first page
            follow: true,
            googleBot: {
                index: page === 1,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        other: {
            'script:ld+json': JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                'name': pageTitle,
                'description': description,
                'url': canonicalUrl,
                'breadcrumb': {
                    '@type': 'BreadcrumbList',
                    'itemListElement': [
                        {
                            '@type': 'ListItem',
                            'position': 1,
                            'name': 'Home',
                            'item': SITE_URL
                        },
                        {
                            '@type': 'ListItem',
                            'position': 2,
                            'name': 'Blog',
                            'item': `${SITE_URL}/blogs`
                        }
                    ]
                }
            })
        }
    };

    return metadata;
}

/**
 * Generates SEO metadata for popular articles page
 */
export function generatePopularArticlesMetadata() {
    const title = `Most Popular Articles - ${SITE_NAME}`;
    const description = `Discover trending and most popular articles on ${SITE_NAME}. See what our readers love most.`;
    const canonicalUrl = `${SITE_URL}/blogs/popular`;

    return {
        title: title,
        description: description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            type: 'website',
            title: title,
            description: description,
            url: canonicalUrl,
            siteName: SITE_NAME,
            images: [
                {
                    url: DEFAULT_OG_IMAGE,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
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
        // JSON-LD Structured Data
        other: {
            'script:ld+json': JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                'name': title,
                'description': description,
                'url': canonicalUrl,
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
                            'name': 'Blog',
                            'item': `${SITE_URL}/blogs`
                        },
                        {
                            '@type': 'ListItem',
                            'position': 3,
                            'name': 'Popular Articles',
                            'item': canonicalUrl
                        }
                    ]
                }
            })
        }
    };
}

/**
 * Generate blog post metadata
 */
export function generateBlogMetadata(post) {
    const cleanSlug = post.slug.replace(/^\/|\/$/g, '');
    const canonicalUrl = `${SITE_URL}/blogs/${cleanSlug}`;
    const ogImage = post.ogImage ? post.ogImage : (post.coverImage?.url || post.coverImage || DEFAULT_OG_IMAGE);

    const publishDate = post.publishedAt || post.createdAt;
    const updateDate = post.updatedAt || publishDate;

    return {
        title: post.title,
        description: post.excerpt,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            type: 'article',
            title: post.title,
            description: post.excerpt,
            url: canonicalUrl,
            siteName: SITE_NAME,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
            article: {
                publishedTime: publishDate,
                modifiedTime: updateDate,
                authors: [post.author?.name || SITE_NAME],
                tags: post.tags || [],
            }
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            images: [ogImage],
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
        other: {
            'script:ld+json': JSON.stringify([
                {
                    '@context': 'https://schema.org',
                    '@type': 'Article',
                    'headline': post.title,
                    'description': post.excerpt,
                    'image': ogImage,
                    'datePublished': publishDate,
                    'dateModified': updateDate,
                    'author': {
                        '@type': 'Person',
                        'name': post.author?.name || SITE_NAME,
                        'url': post.author?.slug ? `${SITE_URL}/author/${post.author.slug}` : SITE_URL
                    },
                    'publisher': {
                        '@type': 'Organization',
                        'name': SITE_NAME,
                        'logo': {
                            '@type': 'ImageObject',
                            'url': `${SITE_URL}/favicon.ico`
                        }
                    },
                    'mainEntityOfPage': {
                        '@type': 'WebPage',
                        '@id': canonicalUrl
                    }
                },
                {
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    'itemListElement': [
                        {
                            '@type': 'ListItem',
                            'position': 1,
                            'name': 'Home',
                            'item': SITE_URL
                        },
                        {
                            '@type': 'ListItem',
                            'position': 2,
                            'name': 'Blog',
                            'item': `${SITE_URL}/blogs`
                        },
                        {
                            '@type': 'ListItem',
                            'position': 3,
                            'name': post.title,
                            'item': canonicalUrl
                        }
                    ]
                }
            ])
        }
    };
}

/**
 * Generates SEO metadata for events listing pages
 */
export function generateEventsListingMetadata(filters = {}) {
    const { page = 1, search = '', category = '', type = '', showPast = false } = filters;
    const baseTitle = `Events & Gatherings - ${SITE_NAME}`;
    let pageTitle = baseTitle;
    let description = DEFAULT_DESCRIPTION;
    let canonicalUrl = `${SITE_URL}/events`;

    // Build dynamic titles and descriptions
    if (search) {
        pageTitle = `Events matching "${search}" - ${SITE_NAME}`;
        description = `Search results for "${search}" in our events collection.`;
    } else if (category && category !== 'all') {
        pageTitle = `${category} Events - ${SITE_NAME}`;
        description = `Browse ${category.toLowerCase()} events, workshops, and gatherings on ${SITE_NAME}.`;
    } else if (type && type !== 'all') {
        const typeName = type === 'online' ? 'Online' : 'In-Person';
        pageTitle = `${typeName} Events - ${SITE_NAME}`;
        description = `Browse ${typeName.toLowerCase()} events on ${SITE_NAME}.`;
    } else if (page > 1) {
        pageTitle = `Page ${page} - ${baseTitle}`;
        description = `Browse page ${page} of events and gatherings on ${SITE_NAME}.`;
    }

    // Build canonical URL with filters
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page);
    if (search) params.set('q', search);
    if (category && category !== 'all') params.set('category', category);
    if (type && type !== 'all') params.set('type', type);
    if (showPast) params.set('past', 'true');

    if (params.toString()) {
        canonicalUrl = `${canonicalUrl}?${params.toString()}`;
    }

    return {
        title: pageTitle,
        description: description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            type: 'website',
            title: pageTitle,
            description: description,
            url: canonicalUrl,
            siteName: SITE_NAME,
            images: [
                {
                    url: DEFAULT_OG_IMAGE,
                    width: 1200,
                    height: 630,
                    alt: pageTitle,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: description,
            images: [DEFAULT_OG_IMAGE],
            creator: TWITTER_HANDLE,
        },
        robots: {
            index: page === 1,
            follow: true,
            googleBot: {
                index: page === 1,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        other: {
            'script:ld+json': JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                'name': pageTitle,
                'description': description,
                'url': canonicalUrl,
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
}

/**
 * Generate metadata for individual event pages
 */
export function generateEventMetadata(event) {
    const cleanSlug = event.slug.replace(/^\/|\/$/g, '');
    const canonicalUrl = `${SITE_URL}/events/${cleanSlug}`;
    const ogImage = event.coverImage ? event.coverImage : DEFAULT_OG_IMAGE;

    // Format event dates
    const startDate = new Date(event.startDate).toISOString();
    const endDate = event.endDate ? new Date(event.endDate).toISOString() : null;

    return {
        title: `${event.title} - ${SITE_NAME} Events`,
        description: event.description || event.excerpt,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            type: 'article',
            title: event.title,
            description: event.description || event.excerpt,
            url: canonicalUrl,
            siteName: SITE_NAME,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: event.title,
                },
            ],
            article: {
                publishedTime: startDate,
                authors: [SITE_NAME],
                tags: [event.category],
            },
        },
        twitter: {
            card: 'summary_large_image',
            title: event.title,
            description: event.description || event.excerpt,
            images: [ogImage],
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
        other: {
            'script:ld+json': JSON.stringify([
                {
                    '@context': 'https://schema.org',
                    '@type': 'Event',
                    'name': event.title,
                    'description': event.description || event.excerpt,
                    'startDate': startDate,
                    'endDate': endDate,
                    'eventAttendanceMode': event.isOnline ?
                        'https://schema.org/OnlineEventAttendanceMode' :
                        'https://schema.org/OfflineEventAttendanceMode',
                    'location': event.isOnline ? {
                        '@type': 'VirtualLocation',
                        'url': event.onlineUrl || canonicalUrl
                    } : {
                        '@type': 'Place',
                        'name': event.location?.venue || 'Location TBD',
                        'address': {
                            '@type': 'PostalAddress',
                            'addressLocality': event.location?.city,
                            'addressCountry': event.location?.country || 'KE'
                        }
                    },
                    'image': ogImage,
                    'url': canonicalUrl,
                    'offers': {
                        '@type': 'Offer',
                        'price': event.registration?.fee || 0,
                        'priceCurrency': 'KES',
                        'availability': 'https://schema.org/InStock',
                        'validFrom': new Date().toISOString()
                    },
                    'organizer': {
                        '@type': 'Organization',
                        'name': SITE_NAME,
                        'url': SITE_URL
                    }
                },
                {
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    'itemListElement': [
                        {
                            '@type': 'ListItem',
                            'position': 1,
                            'name': 'Home',
                            'item': SITE_URL
                        },
                        {
                            '@type': 'ListItem',
                            'position': 2,
                            'name': 'Events',
                            'item': `${SITE_URL}/events`
                        },
                        {
                            '@type': 'ListItem',
                            'position': 3,
                            'name': event.title,
                            'item': canonicalUrl
                        }
                    ]
                }
            ])
        }
    };
}

/**
 * Generate metadata for the homepage
 */
export function generateHomeMetadata() {
    const title = `${SITE_NAME} - Architecture, Design & Technology`;
    const description = DEFAULT_DESCRIPTION;
    const canonicalUrl = SITE_URL;

    return {
        title: title,
        description: description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            type: 'website',
            title: title,
            description: description,
            url: canonicalUrl,
            siteName: SITE_NAME,
            images: [
                {
                    url: DEFAULT_OG_IMAGE,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
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
    };
}

/**
 * Generates SEO metadata for the categories listing page
 */
export function generateCategoriesMetadata() {
    const title = `Browse Categories - ${SITE_NAME}`;
    const description = `Explore articles by category on ${SITE_NAME}. From architecture and design to technology and travel.`;
    const canonicalUrl = `${SITE_URL}/categories`;

    return {
        title: title,
        description: description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            type: 'website',
            title: title,
            description: description,
            url: canonicalUrl,
            siteName: SITE_NAME,
            images: [
                {
                    url: DEFAULT_OG_IMAGE,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
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
        other: {
            'script:ld+json': JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                'name': title,
                'description': description,
                'url': canonicalUrl,
                'breadcrumb': {
                    '@type': 'BreadcrumbList',
                    'itemListElement': [
                        {
                            '@type': 'ListItem',
                            'position': 1,
                            'name': 'Home',
                            'item': SITE_URL
                        },
                        {
                            '@type': 'ListItem',
                            'position': 2,
                            'name': 'Categories',
                            'item': canonicalUrl
                        }
                    ]
                }
            })
        }
    };
}

/**
 * Generates SEO metadata for the tags listing page
 */
export function generateTagsListingMetadata() {
    const title = `Popular Tags & Topics - ${SITE_NAME}`;
    const description = `Discover popular tags and topics on ${SITE_NAME}. Browse our collection of articles by keyword.`;
    const canonicalUrl = `${SITE_URL}/tags`;

    return {
        title: title,
        description: description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            type: 'website',
            title: title,
            description: description,
            url: canonicalUrl,
            siteName: SITE_NAME,
            images: [
                {
                    url: DEFAULT_OG_IMAGE,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
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
        other: {
            'script:ld+json': JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                'name': title,
                'description': description,
                'url': canonicalUrl,
                'breadcrumb': {
                    '@type': 'BreadcrumbList',
                    'itemListElement': [
                        {
                            '@type': 'ListItem',
                            'position': 1,
                            'name': 'Home',
                            'item': SITE_URL
                        },
                        {
                            '@type': 'ListItem',
                            'position': 2,
                            'name': 'Tags',
                            'item': canonicalUrl
                        }
                    ]
                }
            })
        }
    };
}

/**
 * Generates SEO metadata for individual tag pages
 */
export function generateTagMetadata(tag) {
    const title = `#${tag} - ${SITE_NAME}`;
    const description = `Browse all articles and stories tagged with ${tag} on ${SITE_NAME}.`;
    const canonicalUrl = `${SITE_URL}/tags/${tag}`;

    return {
        title: title,
        description: description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            type: 'website',
            title: title,
            description: description,
            url: canonicalUrl,
            siteName: SITE_NAME,
            images: [
                {
                    url: DEFAULT_OG_IMAGE,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [DEFAULT_OG_IMAGE],
            creator: TWITTER_HANDLE,
        },
        robots: {
            index: true,
            follow: true,
        },
        other: {
            'script:ld+json': JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                'name': title,
                'description': description,
                'url': canonicalUrl,
                'breadcrumb': {
                    '@type': 'BreadcrumbList',
                    'itemListElement': [
                        {
                            '@type': 'ListItem',
                            'position': 1,
                            'name': 'Home',
                            'item': SITE_URL
                        },
                        {
                            '@type': 'ListItem',
                            'position': 2,
                            'name': 'Tags',
                            'item': `${SITE_URL}/tags`
                        },
                        {
                            '@type': 'ListItem',
                            'position': 3,
                            'name': tag,
                            'item': canonicalUrl
                        }
                    ]
                }
            })
        }
    };
}

export function generateCanonicalUrl(path = '', queryParams = {}) {
    const baseUrl = SITE_URL;
    const cleanPath = path.replace(/^\/|\/$/g, '');
    const url = cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;

    if (Object.keys(queryParams).length > 0) {
        const params = new URLSearchParams(queryParams);
        return `${url}?${params.toString()}`;
    }

    return url;
}