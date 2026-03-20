import { getAuthorBySlug } from '@/lib/db';
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from '@/app/seo/constants';
import { generateCanonicalUrl } from '@/app/seo/meta';
import AuthorProfileClient from './AuthorProfileClient';

// SEO: generateMetadata for author profile (Server Component)
export async function generateMetadata({ params }) {
    const { slug } = await params;

    // Fetch author data (minimal, for SEO)
    let authorName = slug;
    let authorBio = '';
    let authorImage = DEFAULT_OG_IMAGE;

    try {
        const author = await getAuthorBySlug(slug);

        if (author) {
            authorName = author.name || slug;
            authorBio = author.bio || '';
            authorImage = author.photoURL || DEFAULT_OG_IMAGE;
        }
    } catch (e) {
        console.error('Error fetching author for SEO:', e);
    }

    const canonicalUrl = generateCanonicalUrl(`author/${slug}`);
    const title = `${authorName} - Author at ${SITE_NAME}`;
    const description = authorBio || `Read articles by ${authorName} on ${SITE_NAME}.`;

    return {
        title,
        description,
        alternates: { canonical: canonicalUrl },
        openGraph: {
            type: 'profile',
            title,
            description,
            url: canonicalUrl,
            siteName: SITE_NAME,
            images: [
                {
                    url: authorImage,
                    width: 400,
                    height: 400,
                    alt: authorName,
                },
            ],
            profile: {
                firstName: authorName.split(' ')[0],
                lastName: authorName.split(' ').slice(1).join(' '),
            },
        },
        twitter: {
            card: 'summary',
            title,
            description,
            images: [authorImage],
        },
        robots: {
            index: true,
            follow: true,
        }
    };
}

export default async function AuthorPage({ params }) {
    const { slug } = await params;

    return <AuthorProfileClient slug={slug} />;
}
