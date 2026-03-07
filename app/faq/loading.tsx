import { FAQSkeleton } from "@/components/Skeleton";

export default function Loading() {
    return (
        <main className="pt-32 pb-20 px-6 min-h-screen">
            <div className="max-w-3xl mx-auto">
                <div className="w-64 h-14 mx-auto mb-16 bg-white/10 rounded animate-pulse" />
                <FAQSkeleton />
            </div>
        </main>
    );
}
