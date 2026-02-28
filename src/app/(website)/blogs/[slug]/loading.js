import React from 'react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-white animate-pulse">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
                <div className="h-8 w-3/4 bg-gray-200 rounded mb-6"></div>
                <div className="h-64 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded" />
                    ))}
                </div>
            </div>
        </div>
    );
}
