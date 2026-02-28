/**
 * Generates JSON-LD (CollectionPage schema) for the blogs listing page.
 * @returns {Object} JSON-LD for CollectionPage
 */
export function getBlogCollectionJsonLd() {
    const SITE_NAME = process.env.SITE_NAME || 'Sanaathrumylens';
    const SITE_URL = process.env.SITE_URL || 'https://sanaathrumylens.co.ke';
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${SITE_NAME} Blogs`,
        url: `${SITE_URL.replace(/\/$/, '')}/blogs`,
        isPartOf: {
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
        },
    };
}
// utils/blogJsonLd.js

/**
 * Generates JSON-LD (Article schema) for a blog post.
 * @param {Object} post - Blog post data (title, excerpt, author, coverImage, publishedAt, updatedAt, slug, canonical, category, etc.)
 * @returns {Object} JSON-LD graph for Article and BreadcrumbList
 */
export function getBlogArticleJsonLd(post) {
    if (!post) return null;
    const SITE_NAME = process.env.SITE_NAME || 'Sanaathrumylens';
    const SITE_URL = process.env.SITE_URL || 'https://sanaathrumylens.co.ke';

    // Normalize author object
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
