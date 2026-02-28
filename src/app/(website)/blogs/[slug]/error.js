"use client";

import Link from "next/link";
import React from "react";

export default function Error({ error, reset }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-white">
            <div className="max-w-lg text-center bg-white rounded-lg shadow p-8 border">
                <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
                <p className="text-gray-600 mb-6">
                    An unexpected error occurred while loading this article.
                </p>

                <pre className="text-xs text-left text-red-600 mb-4 overflow-auto max-h-40">
                    {String(error?.message || error)}
                </pre>

                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-gray-900 text-white rounded"
                    >
                        Try again
                    </button>

                    <Link
                        href="/blogs"
                        className="px-4 py-2 border rounded text-gray-700"
                    >
                        Back to blogs
                    </Link>
                </div>
            </div>
        </div>
    );
}
