export const ArticleHeaderSkeleton = () => (
    <div className="col-span-3">
        <div className="mb-8">
            <div className="flex gap-2 mb-4">
                <div className="h-6 w-20 bg-gray-300 animate-pulse rounded-full"></div>
                <div className="h-6 w-16 bg-gray-300 animate-pulse rounded-full"></div>
            </div>
            <div className="h-12 bg-gray-300 animate-pulse rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-300 animate-pulse rounded-lg mb-6 w-3/4"></div>

            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-300 animate-pulse rounded-full"></div>
                    <div>
                        <div className="h-4 w-24 bg-gray-300 animate-pulse rounded mb-1"></div>
                        <div className="h-3 w-16 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                    <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                </div>
            </div>
        </div>
    </div>
);

export const FeaturedImageSkeleton = () => (
    <div className="col-span-3 mb-8">
        <div className="relative aspect-video bg-gray-300 animate-pulse rounded"></div>
    </div>
);

export const ContentSkeleton = () => (
    <div className="col-span-3">
        <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-gray-300 animate-pulse rounded w-full"
                    style={{ animationDelay: `${i * 100}ms` }}
                ></div>
            ))}
        </div>
    </div>
);

export const RelatedPostsSkeleton = () => (
    <div className="col-span-3 mb-12">
        <div className="h-8 w-48 bg-gray-300 animate-pulse rounded-lg mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
                <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                    <div className="h-44 bg-gray-300 animate-pulse"></div>
                    <div className="p-4">
                        <div className="h-5 bg-gray-300 animate-pulse rounded mb-2"></div>
                        <div className="h-4 bg-gray-300 animate-pulse rounded w-3/4"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const SidebarSkeleton = () => (
    <div className="lg:col-span-1 space-y-5">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="h-4 w-24 bg-gray-300 animate-pulse rounded mb-4"></div>
                {[...Array(3)].map((_, j) => (
                    <div key={j} className="mb-4 last:mb-0">
                        <div className="h-3 bg-gray-300 animate-pulse rounded mb-2 w-full"></div>
                        <div className="flex gap-2">
                            <div className="h-3 w-8 bg-gray-300 animate-pulse rounded"></div>
                            <div className="h-3 w-6 bg-gray-300 animate-pulse rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        ))}
    </div>
);

export function FullPageSkeleton() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content Skeleton */}
                    <main className="lg:col-span-3">
                        <div className="mb-6">
                            <div className="h-4 w-48 bg-gray-300 animate-pulse rounded mb-2"></div>
                            <div className="h-8 bg-gray-300 animate-pulse rounded mb-4"></div>
                            <div className="h-6 bg-gray-300 animate-pulse rounded w-3/4"></div>
                        </div>

                        <div className="relative aspect-video bg-gray-300 animate-pulse rounded mb-8"></div>

                        <div className="space-y-4 mb-12">
                            {[...Array(12)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-4 bg-gray-300 animate-pulse rounded"
                                    style={{
                                        width: `${100 - (i % 3) * 10}%`,
                                        animationDelay: `${i * 50}ms`,
                                    }}
                                ></div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="border border-gray-200 rounded-lg overflow-hidden"
                                >
                                    <div className="aspect-video bg-gray-300 animate-pulse"></div>
                                    <div className="p-4">
                                        <div className="h-5 bg-gray-300 animate-pulse rounded mb-2"></div>
                                        <div className="h-4 bg-gray-300 animate-pulse rounded w-3/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </main>

                    {/* Sidebar Skeleton */}
                    <SidebarSkeleton />
                </div>
            </div>
        </div>
    );
}


// export default {
//     SidebarSkeleton,
//     RelatedPostsSkeleton,
//     ContentSkeleton,
//     ArticleHeaderSkeleton,
//     FeaturedImageSkeleton
// }
