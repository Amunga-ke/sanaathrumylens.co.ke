import React from 'react';

export const revalidate = 60;

const SITE_URL = process.env.SITE_URL || 'https://sanaathrumylens.co.ke';
const SITE_NAME = process.env.SITE_NAME || 'Sanaathrumylens';

export default async function Head({ params }) {
    const slug = params?.slug;
    const decodedTag = decodeURIComponent(slug || '');

    const title = `${decodedTag} — ${SITE_NAME}`;
    const description = `Articles tagged with "${decodedTag}" on ${SITE_NAME}.`;
    const canonical = `${SITE_URL.replace(/\/$/, '')}/tags/${slug}`;
    const ogImage = `${SITE_URL.replace(/\/$/, '')}/og/pages/tags/${slug}`;

    return (
        <>
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonical} />

            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonical} />
            <meta property="og:image" content={ogImage} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />
        </>
    );
}
