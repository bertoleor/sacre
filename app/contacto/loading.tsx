import { FormSkeleton } from "@/components/Skeleton";

export default function Loading() {
    return (
        <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505] py-20 px-6">
            {/* Background Skeleton */}
            <div className="absolute inset-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]" />
            </div>

            {/* Glass Container Skeleton */}
            <div className="relative z-10 w-[90%] md:max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-6 md:p-12">
                <div className="w-48 h-12 mx-auto mb-12 bg-white/10 rounded animate-pulse" />
                <FormSkeleton />
            </div>
        </main>
    );
}
