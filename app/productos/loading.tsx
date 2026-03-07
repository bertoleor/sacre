import { ProductGridSkeleton } from "@/components/Skeleton";

export default function Loading() {
    return (
        <main className="pt-32 pb-20 px-6 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <div className="w-48 h-12 mx-auto mb-4 bg-white/10 rounded animate-pulse" />
                </div>
                <ProductGridSkeleton />
            </div>
        </main>
    );
}
