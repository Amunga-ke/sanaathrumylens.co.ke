import { generateBlogListingMetadata } from '@/app/seo/meta';
import {
    fetchBlogPosts, fetchFeaturedArticle, fetchRecentStories,
    fetchPopularArticles, fetchCategories
} from '@/lib/firestore';
import BlogClient from './BlogClient';
import Link from 'next/link';

export async function generateMetadata({ searchParams }) {
    const params = await searchParams;
    const page = parseInt(params.page) || 1;
    const search = params.q || '';
    const category = params.category || '';

    return generateBlogListingMetadata({
        page,
        search,
        category
    });
}

// Helper function to serialize Firestore data for client components
function serializeForClient(data) {
    if (Array.isArray(data)) {
        return data.map(item => serializeForClient(item));
    }

    if (data && typeof data === 'object' && !(data instanceof Date)) {
        if (data.seconds !== undefined && data.nanoseconds !== undefined) {
            return new Date(data.seconds * 1000 + data.nanoseconds / 1000000).toISOString();
        }

        const result = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                result[key] = serializeForClient(data[key]);
            }
        }
        return result;
    }

    return data;
}

// Helper function to remove duplicates by ID
function removeDuplicatesById(array) {
    const seen = new Set();
    return array.filter(item => {
        if (!item.id) return true;
        if (seen.has(item.id)) {
            console.warn(`Duplicate ID found: ${item.id}`);
            return false;
        }
        seen.add(item.id);
        return true;
    });
}

// Helper to fetch posts with filters
async function fetchPostsWithFilters(search = '', category = '', page = 1, limit = 12) {
    try {
        let posts = await fetchBlogPosts(100); // Fetch enough for filtering

        if (search) {
            posts = posts.filter(post =>
                post.title?.toLowerCase().includes(search.toLowerCase()) ||
                post.excerpt?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (category) {
            posts = posts.filter(post =>
                post.category === category ||
                post.categoryIds?.includes(category)
            );
        }

        // Remove duplicates
        posts = removeDuplicatesById(posts);

        // Sort by published date (newest first)
        posts.sort((a, b) => {
            const dateA = a.publishedAt?.seconds ? a.publishedAt.seconds * 1000 : new Date(a.publishedAt).getTime();
            const dateB = b.publishedAt?.seconds ? b.publishedAt.seconds * 1000 : new Date(b.publishedAt).getTime();
            return dateB - dateA;
        });

        // Paginate
        const offset = (page - 1) * limit;
        const paginatedPosts = posts.slice(offset, offset + limit);
        const hasMore = posts.length > offset + limit;
        const totalPosts = posts.length;

        console.log(`Server: Page ${page}, Total: ${totalPosts}, Showing: ${paginatedPosts.length}, HasMore: ${hasMore}`);

        return {
            posts: paginatedPosts,
            hasMore,
            totalPosts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit)
        };
    } catch (error) {
        console.error('Error fetching posts with filters:', error);
        throw error;
    }
}

// This function runs on the server
async function getServerSideData(searchParams) {
    const params = await searchParams;
    const page = parseInt(params.page) || 1;
    const search = params.q || '';
    const category = params.category || '';

    try {
        // Fetch all data in parallel
        const [
            postsData,
            featuredStory,
            recentStories,
            popularArticles,
            categories
        ] = await Promise.all([
            fetchPostsWithFilters(search, category, page, 12),
            fetchFeaturedArticle(),
            fetchRecentStories(4),
            fetchPopularArticles(4),
            fetchCategories()
        ]);

        // Remove duplicates from sidebar content
        const uniqueRecentStories = removeDuplicatesById(recentStories);
        const uniquePopularArticles = removeDuplicatesById(popularArticles);

        // Ensure popular articles don't overlap with recent stories
        const recentStoryIds = new Set(uniqueRecentStories.map(story => story.id));
        const filteredPopularArticles = uniquePopularArticles.filter(article =>
            !recentStoryIds.has(article.id)
        );

        // Serialize ALL data before passing to client
        return {
            posts: serializeForClient(postsData.posts),
            featuredStory: serializeForClient(featuredStory),
            recentStories: serializeForClient(uniqueRecentStories),
            popularArticles: serializeForClient(filteredPopularArticles),
            categories: serializeForClient(categories),
            hasMore: postsData.hasMore,
            totalPosts: postsData.totalPosts,
            currentPage: page,
            search,
            category,
            totalPages: postsData.totalPages
        };
    } catch (error) {
        console.error('Error fetching server data:', error);
        return {
            posts: [],
            featuredStory: null,
            recentStories: [],
            popularArticles: [],
            categories: [],
            hasMore: false,
            totalPosts: 0,
            currentPage: 1,
            search: '',
            category: '',
            totalPages: 1,
            error: 'Failed to load data'
        };
    }
}

export default async function BlogPage({ searchParams }) {
    const serverData = await getServerSideData(searchParams);

    // Generate canonical URL for current page
    const baseUrl = 'https://www.sanaathrumylens.com/blogs';
    const params = new URLSearchParams();
    if (serverData.currentPage > 1) params.set('page', serverData.currentPage.toString());
    if (serverData.search) params.set('q', serverData.search);
    if (serverData.category) params.set('category', serverData.category);
    const canonicalUrl = `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;

    // Generate structured data for SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `Blog Articles${serverData.currentPage > 1 ? ` - Page ${serverData.currentPage}` : ''}`,
        "description": "Browse our collection of articles on architecture, design, and technology",
        "url": canonicalUrl,
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://www.sanaathrumylens.com"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": `Blog${serverData.currentPage > 1 ? ` - Page ${serverData.currentPage}` : ''}`,
                    "item": canonicalUrl
                }
            ]
        }
    };

    return (
        <>
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData)
                }}
            />

            {/* Hidden pagination links for SEO (screen readers only) */}
            <div className="sr-only">
                <nav aria-label="Pagination">
                    <h2>Page Navigation</h2>
                    {serverData.currentPage > 1 && (
                        <Link
                            href={`/blogs?page=${serverData.currentPage - 1}`}
                            rel="prev"
                        >
                            Previous Page
                        </Link>
                    )}

                    {Array.from({ length: Math.min(serverData.totalPages, 5) }, (_, i) => {
                        const pageNum = i + 1;
                        if (pageNum === serverData.currentPage) return null;

                        return (
                            <Link
                                key={pageNum}
                                href={`/blogs?page=${pageNum}`}
                                aria-label={`Go to page ${pageNum}`}
                            >
                                Page {pageNum}
                            </Link>
                        );
                    }).filter(Boolean)}

                    {serverData.hasMore && (
                        <Link
                            href={`/blogs?page=${serverData.currentPage + 1}`}
                            rel="next"
                        >
                            Next Page
                        </Link>
                    )}
                </nav>
            </div>

            <BlogClient
                initialPosts={serverData.posts}
                initialFeaturedStory={serverData.featuredStory}
                initialRecentStories={serverData.recentStories}
                initialPopularArticles={serverData.popularArticles}
                initialCategories={serverData.categories}
                initialPage={serverData.currentPage}
                initialSearch={serverData.search}
                initialCategory={serverData.category}
                initialHasMore={serverData.hasMore}
                initialTotalPosts={serverData.totalPosts}
            />
        </>
    );
}