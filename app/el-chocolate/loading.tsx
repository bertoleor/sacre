import { TimelineSkeleton } from "@/components/Skeleton";

export default function Loading() {
    return (
        <main className="bg-[#050505] min-h-screen text-white overflow-x-hidden">
            {/* Hero Section Skeleton */}
            <section className="relative h-screen w-full flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-white/5" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/90" />
                <div className="relative z-20 text-center px-4">
                    <div className="w-64 h-24 mx-auto bg-white/10 rounded animate-pulse" />
                </div>
            </section>

            {/* Central Narrative Skeleton */}
            <section className="relative py-40 px-6">
                <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                    <div className="hidden md:block space-y-20">
                        <div className="h-32 bg-white/5 rounded-xl p-8" />
                    </div>
                    <div className="relative h-[80vh] w-full bg-white/5 rounded-2xl animate-pulse" />
                    <div className="space-y-20 md:pt-40">
                        <div className="h-32 bg-white/5 rounded-xl p-8" />
                    </div>
                </div>
            </section>

            {/* Timeline Skeleton */}
            <section className="relative py-40 w-full overflow-hidden">
                <div className="absolute inset-0 bg-[#080808]" />
                <div className="relative z-10 max-w-[1800px] mx-auto px-6">
                    <div className="w-64 h-16 mx-auto mb-32 bg-white/10 rounded animate-pulse" />
                    <TimelineSkeleton />
                </div>
            </section>

            {/* Closing Statement Skeleton */}
            <section className="h-[50vh] flex items-center justify-center">
                <div className="w-96 h-16 bg-white/10 rounded animate-pulse" />
            </section>
        </main>
    );
}
