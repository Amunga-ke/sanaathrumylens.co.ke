import { generateBlogMetadata } from "@/app/seo/meta";
import BlogPostClient from "./BlogPostClient";
import { getPostBySlug, getRecentPosts, getCategories, getPostsByAuthor, getRelatedPosts } from "@/lib/db";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: "Article Not Found",
            description: "The requested article could not be found.",
        };
    }

    return generateBlogMetadata({
        title: post.title,
        excerpt: post.excerpt,
        slug,
        ogImage: post.coverImage || post.featuredImage,
        authorName: post.author?.name,
        publishedDate: post.publishedAt,
    });
}

// Helper function to serialize data for client
function serializeForClient(data) {
    if (data === null || data === undefined) {
        return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(item => serializeForClient(item));
    }

    // Handle Date objects
    if (data instanceof Date) {
        return data.toISOString();
    }

    // Handle objects
    if (typeof data === 'object') {
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
    const post = await getPostBySlug(slug);

    if (!post) {
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

    // Fetch related data in parallel
    const [recentStories, categories, articlesByAuthor, relatedArticles] = await Promise.all([
        getRecentPosts(5),
        getCategories(),
        getPostsByAuthor(post.authorId, post.id, 4),
        getRelatedPosts(post.categoryId, post.id, 4),
    ]);

    // Serialize ALL data before passing to client component
    const serializedData = {
        post: serializeForClient(post),
        recentStories: serializeForClient(recentStories || []),
        categories: serializeForClient(categories || []),
        articlesByAuthor: serializeForClient(articlesByAuthor || []),
        relatedArticles: serializeForClient(relatedArticles || []),
        viewCount: post.viewCount || 0
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: post.title,
                        description: post.excerpt,
                        author: {
                            '@type': 'Person',
                            name: post.author?.name || 'Anonymous'
                        },
                        datePublished: post.publishedAt?.toISOString(),
                        image: post.coverImage || post.featuredImage,
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
