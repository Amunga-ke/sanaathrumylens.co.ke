// src/app/blogs/recent/page.js
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, Eye, MessageCircle, Heart, ArrowRight, Clock } from 'lucide-react';
import { fetchRecentStories } from "@/lib/db";

export default function RecentArticlesPage() {
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRecentArticles();
    }, []);

    const fetchRecentArticles = async () => {
        try {
            setLoading(true);

            const data = await fetchRecentStories(20);
            setRecentPosts(data.posts || []);

        } catch (err) {
            console.error('Error fetching recent articles:', err);
            setError('Failed to load recent articles');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatNumber = (num) => {
        if (!num) return 0;
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num;
    };

    if (loading && recentPosts.length === 0) {
        return (
            <div className="min-h-screen bg-[#f5f1e8] py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading recent articles...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f1e8]">
            {/* Hero Section */}
            <div className="bg-linear-to-b from-blue-500 to-blue-700 py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-8 h-8 text-white" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white">Recent Articles</h1>
                    </div>
                    <p className="text-white/90 text-lg max-w-3xl">
                        Fresh perspectives and latest stories from Kenya&apos;s vibrant creative community
                    </p>
                    <div className="mt-6 flex gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                            <p className="text-white text-sm">📰 Latest publications</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {error && (
                    <div className="text-center py-8">
                        <p className="text-red-500">{error}</p>
                        <button 
                            onClick={fetchRecentArticles}
                            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Top Articles Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {recentPosts.slice(0, 2).map((post, index) => (
                        <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-lg">
                            <Link href={`/blogs/${post.slug || post.id}`} className="block">
                                <div className="relative aspect-video overflow-hidden">
                                    {(post.coverImage || post.featuredImage) ? (
                                        <Image
                                            src={post.coverImage || post.featuredImage}
                                            alt={`${post.title} — Featured image`}
                                            fill
                                            className="object-cover hover:scale-105 transition-transform duration-300"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            priority={index === 0}
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-400"></div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                                            Just Published
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4">
                                            <h2 className="text-white text-xl font-bold mb-2 line-clamp-2">
                                                {post.title}
                                            </h2>
                                            <div className="flex items-center gap-4 text-white/80 text-sm">
                                                <span>{formatDate(post.publishedAt)}</span>
                                                <span>•</span>
                                                <span>{post.readingTime || 5} min read</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Recent List */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-500" />
                        Latest Stories
                    </h2>
                    <div className="space-y-4">
                        {recentPosts.slice(2).map((post, index) => (
                            <Link
                                key={post.id}
                                href={`/blogs/${post.slug || post.id}`}
                                className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors group"
                            >
                                <div className="text-2xl font-bold text-gray-300 w-8">{index + 3}</div>
                                <div className="flex-1">
                                    <h3 className="font-medium group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                        <span>{formatDate(post.publishedAt)}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <User size={12} />
                                            {post.author?.name || 'Anonymous'}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Eye size={12} />
                                            {formatNumber(post.viewCount)}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Heart size={12} />
                                            {formatNumber(post.likeCount)}
                                        </span>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </Link>
                        ))}
                    </div>
                </div>

                {recentPosts.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No recent articles found.</p>
                    </div>
                )}

                {/* Back to Blog */}
                <div className="mt-12 text-center">
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to All Articles
                    </Link>
                </div>
            </div>
        </div>
    );
}
