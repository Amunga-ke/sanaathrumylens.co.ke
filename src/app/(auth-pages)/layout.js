// src/app/components/AuthLayout.js
import Link from "next/link";
import React, { Suspense } from 'react';

export default function AuthLayout({ children, title, subtitle }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Main Content */}
            <main className="flex-1  flex items-center justify-center ">
                <div className="w-full max-w-md">
                    {/* Auth Card */}

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {title}
                        </h1>
                        <p className="text-gray-600">
                            {subtitle}
                        </p>
                    </div>

                    <Suspense fallback={<div className="h-8 w-full" />}>
                        {children}
                    </Suspense>

                    {/* Back to Home */}
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                        <Link
                            href="/"
                            className="text-sm text-gray-600 hover:text-black transition-colors"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="py-6 text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} Sanaathrumylens. All rights reserved.</p>
            </footer>
        </div>
    );
}