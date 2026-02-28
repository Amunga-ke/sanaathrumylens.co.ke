// utils/seo.js

export function buildDefaultMetadata(options = {}) {
    const {
        title = process.env.SITE_NAME || 'Sanaathrumylens',
        description = 'Default description',
        image = `${process.env.SITE_URL || 'https://sanaathrumylens.co.ke'}/og-default.png`,
        url = process.env.SITE_URL || 'https://sanaathrumylens.co.ke',
        type = 'website'
    } = options;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type,
            url,
            images: [
                {
                    url: image,
                },
            ],
            siteName: process.env.SITE_NAME || 'Sanaathrumylens',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
        alternates: {
            canonical: url,
        },
    };
}

export function jsonLdForArticle({ post }) {
    if (!post) return null;
    const SITE_NAME = process.env.SITE_NAME || 'Sanaathrumylens';
    const SITE_URL = process.env.SITE_URL || 'https://sanaathrumylens.co.ke';

    // normalize author object
    let authorObj = { "@type": "Person", "name": SITE_NAME };
    if (post.author) {
        if (typeof post.author === 'string') {
            authorObj = { "@type": "Person", "name": post.author };
        } else if (post.author.name) {
            authorObj = { "@type": "Person", "name": post.author.name };
            if (post.author.url) authorObj.url = post.author.url;
        }
    }

    const image = post.coverImage || post.featuredImage || `${SITE_URL}/og-default.png`;

    const article = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": post.excerpt || '',
        "image": [image],
        "author": authorObj,
        "publisher": {
            "@type": "Organization",
            "name": SITE_NAME,
            "logo": {
                "@type": "ImageObject",
                "url": `${SITE_URL}/logo.png`
            }
        },
        "articleSection": post.category || post.categories || post.categoryIds || undefined,
        "datePublished": post.publishedAt || undefined,
        "dateModified": post.updatedAt || post.publishedAt || undefined,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": post.canonical || `${SITE_URL}/blogs/${post.slug}`
        }
    };
    const items = [
        { name: 'Home', item: SITE_URL },
        { name: 'Blogs', item: `${SITE_URL.replace(/\/$/, '')}/blogs` },
        { name: post.title, item: post.canonical || `${SITE_URL.replace(/\/$/, '')}/blogs/${post.slug}` }
    ];

    const breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((it, idx) => ({ "@type": "ListItem", "position": idx + 1, "name": it.name, "item": it.item }))
    };

    // Return a graph containing both Article and BreadcrumbList
    return {
        "@context": "https://schema.org",
        "@graph": [article, breadcrumb]
    };
}