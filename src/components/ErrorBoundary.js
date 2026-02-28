// src/components/ErrorBoundary.js
"use client";

import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('BlogPostClient Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-white">
                    <div className="max-w-lg text-center bg-white rounded-lg shadow p-8 border">
                        <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
                        <p className="text-gray-600 mb-6">
                            We&apos;re having trouble loading this article.
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                if (this.props.onReset) this.props.onReset();
                            }}
                            className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}