import { HeroSkeleton } from "@/components/Skeleton";

export default function Loading() {
    return (
        <main className="bg-[#050505] min-h-screen text-white overflow-x-hidden">
            <HeroSkeleton />

            {/* Categories Bento Grid Section Skeleton */}
            <section className="w-full py-20 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 h-auto md:h-[800px]">
                    {/* Left Column */}
                    <div className="flex flex-col gap-4 h-[800px] md:h-full">
                        <div className="flex-1 rounded-[2.5rem] bg-white/5 animate-pulse" />
                        <div className="flex-1 rounded-[2.5rem] bg-white/5 animate-pulse" />
                    </div>
                    {/* Right Column */}
                    <div className="h-[400px] md:h-full rounded-[2.5rem] bg-white/5 animate-pulse" />
                </div>
            </section>

            {/* Immersive Teaser Section Skeleton */}
            <section className="relative h-screen w-full flex items-center justify-center">
                <div className="absolute inset-0 bg-white/5" />
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#050505] via-[#050505]/50 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <div className="bg-black/30 backdrop-blur-md border border-white/10 p-12 md:p-20 rounded-xl">
                        <div className="w-24 h-4 mx-auto mb-6 bg-white/10 rounded animate-pulse" />
                        <div className="w-96 h-24 mx-auto mb-8 bg-white/10 rounded animate-pulse" />
                        <div className="space-y-2 max-w-lg mx-auto">
                            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                            <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
                        </div>
                        <div className="w-48 h-10 mx-auto mt-12 bg-white/10 rounded animate-pulse" />
                    </div>
                </div>
            </section>
        </main>
    );
}
