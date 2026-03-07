import { ProductGridSkeleton } from "@/components/Skeleton";

export default function Loading() {
    return (
        <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Back Link Skeleton */}
                <div className="w-32 h-6 mb-12 bg-white/10 rounded animate-pulse" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Image Section */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white/5 animate-pulse" />

                    {/* Details Section */}
                    <div className="space-y-8">
                        {/* Breadcrumb */}
                        <div className="w-32 h-4 bg-white/10 rounded animate-pulse" />

                        {/* Title */}
                        <div className="w-3/4 h-16 bg-white/10 rounded animate-pulse" />

                        {/* Price */}
                        <div className="w-32 h-8 bg-white/10 rounded animate-pulse" />

                        {/* Rating */}
                        <div className="flex gap-1">
                            {[0,1,2,3,4].map((starIndex) => (
                                <div key={`star-${starIndex}`} className="w-4 h-4 bg-white/10 rounded-full animate-pulse" />
                            ))}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                            <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
                        </div>

                        {/* Product Info */}
                        <div className="border-t border-white/10 pt-8 space-y-4">
                            <div className="flex justify-between">
                                <div className="w-16 h-4 bg-white/10 rounded animate-pulse" />
                                <div className="w-24 h-4 bg-white/10 rounded animate-pulse" />
                            </div>
                            <div className="flex justify-between">
                                <div className="w-16 h-4 bg-white/10 rounded animate-pulse" />
                                <div className="w-24 h-4 bg-white/10 rounded animate-pulse" />
                            </div>
                        </div>

                        {/* Quantity & Add to Cart */}
                        <div className="border-t border-white/10 pt-8">
                            <div className="flex gap-4">
                                <div className="w-32 h-12 bg-white/10 rounded-full animate-pulse" />
                                <div className="flex-1 h-12 bg-white/10 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                <section className="mt-24">
                    <div className="w-64 h-10 mx-auto mb-12 bg-white/10 rounded animate-pulse" />
                    <ProductGridSkeleton />
                </section>
            </div>
        </main>
    );
}
