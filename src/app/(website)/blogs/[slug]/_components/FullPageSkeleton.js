import { SidebarSkeleton } from "./SkeletalLoader";

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