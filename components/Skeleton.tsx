"use client";

interface SkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular";
    width?: string | number;
    height?: string | number;
}

export default function Skeleton({
    className = "",
    variant = "rectangular",
    width,
    height,
}: Readonly<SkeletonProps>) {
    const baseStyles = "animate-pulse bg-white/10";
    
    const variantStyles = {
        text: "rounded h-4",
        circular: "rounded-full",
        rectangular: "rounded-lg",
    };

    const style: React.CSSProperties = {
        width: width || "100%",
        height: height || "100%",
    };

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            style={style}
            aria-hidden="true"
        />
    );
}

// Hero Skeleton
export function HeroSkeleton() {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-black">
            <div className="absolute inset-0 bg-white/5" />
            <div className="relative z-10 flex flex-col items-center text-center px-4">
                <Skeleton className="w-48 h-6 mb-6" variant="text" />
                <Skeleton className="w-[60vw] h-32 mb-6" variant="text" />
                <Skeleton className="w-48 h-10" variant="rectangular" />
            </div>
        </div>
    );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
    return (
        <div className="bg-white/5 border border-white/5 p-8">
            <Skeleton className="aspect-square mb-8" />
            <Skeleton className="w-3/4 h-6 mx-auto mb-2" variant="text" />
            <Skeleton className="w-full h-4 mx-auto mb-2" variant="text" />
            <Skeleton className="w-1/2 h-4 mx-auto" variant="text" />
            <Skeleton className="w-full h-10 mt-6" />
        </div>
    );
}

// Product Grid Skeleton
export function ProductGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map((idx) => (
                <ProductCardSkeleton key={`product-card-${idx}`} />
            ))}
        </div>
    );
}

// Text Content Skeleton
export function TextContentSkeleton() {
    return (
        <div className="space-y-4 max-w-3xl mx-auto">
            <Skeleton className="w-3/4 h-10" variant="text" />
            <Skeleton className="w-full h-4" variant="text" />
            <Skeleton className="w-full h-4" variant="text" />
            <Skeleton className="w-5/6 h-4" variant="text" />
            <Skeleton className="w-full h-4" variant="text" />
            <Skeleton className="w-4/5 h-4" variant="text" />
        </div>
    );
}

// Image Text Section Skeleton
export function ImageTextSectionSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
                <Skeleton className="w-1/2 h-8" variant="text" />
                <Skeleton className="w-full h-4" variant="text" />
                <Skeleton className="w-full h-4" variant="text" />
                <Skeleton className="w-3/4 h-4" variant="text" />
            </div>
        </div>
    );
}

// Form Skeleton
export function FormSkeleton() {
    return (
        <div className="space-y-8 max-w-xl mx-auto">
            <div className="space-y-2">
                <Skeleton className="w-24 h-4" variant="text" />
                <Skeleton className="w-full h-10" />
            </div>
            <div className="space-y-2">
                <Skeleton className="w-24 h-4" variant="text" />
                <Skeleton className="w-full h-10" />
            </div>
            <div className="space-y-2">
                <Skeleton className="w-24 h-4" variant="text" />
                <Skeleton className="w-full h-24" />
            </div>
            <Skeleton className="w-48 h-12 mx-auto" />
        </div>
    );
}

// FAQ Skeleton
export function FAQSkeleton() {
    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            {[0, 1, 2].map((idx) => (
                <div key={`faq-item-${idx}`} className="border-b border-white/20 pb-8">
                    <Skeleton className="w-3/4 h-6 mb-4" variant="text" />
                    <Skeleton className="w-full h-4 mb-2" variant="text" />
                    <Skeleton className="w-5/6 h-4" variant="text" />
                </div>
            ))}
        </div>
    );
}

// Timeline Skeleton
export function TimelineSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[0, 1, 2, 3, 4].map((idx) => (
                <div key={`timeline-step-${idx}`} className="h-[400px] border border-white/5 p-8">
                    <Skeleton className="w-16 h-16 mb-4" variant="circular" />
                    <Skeleton className="w-3/4 h-6 mb-2" variant="text" />
                    <Skeleton className="w-full h-4" variant="text" />
                </div>
            ))}
        </div>
    );
}

// Carousel Skeleton
export function CarouselSkeleton() {
    return (
        <div className="py-24 bg-[#050505]">
            <div className="container mx-auto px-6 mb-12">
                <Skeleton className="w-48 h-10 mb-2" variant="text" />
                <Skeleton className="w-24 h-px" />
            </div>
            <div className="flex gap-6 px-6 overflow-x-auto">
                {[0, 1, 2].map((idx) => (
                    <div key={`carousel-skeleton-${idx}`} className="flex-shrink-0 w-[85vw] md:w-[600px] lg:w-[700px]">
                        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden h-full">
                            <Skeleton className="aspect-square mb-6" />
                            <div className="p-6 pt-0 min-h-[200px]">
                                <Skeleton className="w-3/4 h-6 mx-auto mb-2" variant="text" />
                                <Skeleton className="w-full h-4 mx-auto mb-2" variant="text" />
                                <Skeleton className="w-1/2 h-6 mx-auto mb-4" variant="text" />
                                <Skeleton className="w-full h-10" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
