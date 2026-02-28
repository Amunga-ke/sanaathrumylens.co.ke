import { generateBlogMetadata } from "@/app/seo/meta";
import BlogPostClient from "./BlogPostClient";
import { fetchCompleteArticleData } from "@/lib/firestore";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const data = await fetchCompleteArticleData(slug);

    if (!data || !data.post) {
        return {
            title: "Article Not Found",
            description: "The requested article could not be found.",
        };
    }

    return generateBlogMetadata({
        title: data.post.title,
        excerpt: data.post.excerpt,
        slug,
        ogImage: data.post.coverImage || data.post.featuredImage,
        authorName: data.post.author?.name,
        publishedDate: data.post.publishedAt,
    });
}

// Helper function to deeply serialize all objects, including Firestore Timestamps
function serializeForClient(data) {
    if (data === null || data === undefined) {
        return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(item => serializeForClient(item));
    }

    // Handle objects (including Firestore Timestamps)
    if (typeof data === 'object') {
        // Check if it's a Firestore Timestamp
        if (data.seconds !== undefined && data.nanoseconds !== undefined) {
            return new Date(data.seconds * 1000 + data.nanoseconds / 1000000).toISOString();
        }

        // Check if it's a Date object
        if (data instanceof Date) {
            return data.toISOString();
        }

        // Handle regular objects
        const result = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                result[key] = serializeForClient(data[key]);
            }
        }
        return result;
    }

    // Return primitives as-is
    return data;
}

export default async function Page({ params }) {
    const { slug } = await params;

    // Fetch data on server
    const data = await fetchCompleteArticleData(slug);

    if (!data?.post) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-base-bg">
                <div className="text-center max-w-md p-10 bg-surface rounded-2xl border border-base-border shadow-xl">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileQuestion className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4 text-base-fg">Article not found</h1>
                    <p className="text-base-muted mb-8 leading-relaxed">The article you&apos;re looking for doesn&apos;t exist, has been removed, or moved to a new location.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-surface rounded-full font-bold uppercase tracking-widest text-sm hover:bg-secondary transition-all shadow-md"
                    >
                        <Home size={18} /> Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    // Serialize ALL data before passing to client component
    const serializedData = {
        post: serializeForClient(data.post),
        recentStories: serializeForClient(data.recentStories || []),
        categories: serializeForClient(data.categories || []),
        articlesByAuthor: serializeForClient(data.articlesByAuthor || []),
        relatedArticles: serializeForClient(data.relatedArticles || []),
        viewCount: data.viewCount || 0
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: data.post.title,
                        description: data.post.excerpt,
                        author: {
                            '@type': 'Person',
                            name: data.post.author?.name || 'Anonymous'
                        },
                        datePublished: data.post.publishedAt,
                        image: data.post.coverImage || data.post.featuredImage,
                    }),
                }}
            />

            <ErrorBoundary>
                <BlogPostClient
                    initialPostData={serializedData}
                    slug={slug}
                />
            </ErrorBoundary>
        </>
    );
}