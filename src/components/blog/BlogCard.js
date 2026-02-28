// src/components/blogs/BlogCard.js
import Link from "next/link";

export default function BlogCard({ post }) {
    return (
        <article className="border rounded-lg p-5 hover:shadow transition">
            <h2 className="text-xl font-semibold mb-2">
                <Link href={`/blogs/${post.slug}`}>
                    {post.title}
                </Link>
            </h2>

            <p className="text-gray-600 text-sm mb-3">
                {post.excerpt}
            </p>

            <span className="text-xs text-gray-500">
                {post.readingTime} min read
            </span>
        </article>
    );
}
