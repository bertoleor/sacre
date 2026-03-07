export default function Loading() {
    return (
        <section className="relative min-h-screen w-full flex items-center justify-center">
            {/* Background Skeleton */}
            <div className="absolute inset-0 bg-white/5" />

            {/* Overlay Skeleton */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Glass Box Skeleton */}
            <div className="relative z-20 w-[90%] md:max-w-3xl p-6 md:p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem]">
                <div className="w-64 h-14 mx-auto mb-6 bg-white/10 rounded animate-pulse" />
                <div className="space-y-4">
                    <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                    <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
                    <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                </div>
            </div>
        </section>
    );
}
