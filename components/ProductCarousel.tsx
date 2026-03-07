"use client";

import { useRef } from "react";
import { Plus, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { products } from "@/lib/data";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";

interface ProductCarouselProps {
    title?: string;
    category?: string;
    showNavigation?: boolean;
}

export default function ProductCarousel({
    title = "Colección Exclusiva",
    category,
    showNavigation = true
}: ProductCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    
    const filteredProducts = category
        ? products.filter(p => p.category === category)
        : products;

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 400;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
        }
    };

    return (
        <section className="relative py-24 bg-[#050505]">
            {/* Section Header */}
            <div className="container mx-auto px-6 mb-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-cronde text-burgundy mb-2">
                            {title}
                        </h2>
                        <div className="w-24 h-px bg-burgundy/30" />
                    </div>
                    
                    {showNavigation && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => scroll("left")}
                                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-burgundy hover:border-burgundy/50 transition-all duration-300"
                                aria-label="Deslizar a la izquierda"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => scroll("right")}
                                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-burgundy hover:border-burgundy/50 transition-all duration-300"
                                aria-label="Deslizar a la derecha"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Carousel Container */}
            <div className="relative">
                {/* Gradient overlays for edges */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />
                
                {/* Scrollable container */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scrollbar-hide px-6 pb-4"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {filteredProducts.map((product, index) => (
                        <Link
                            key={product.id}
                            href={`/productos/${product.id}`}
                            className="flex-shrink-0 w-[320px] group"
                        >
                            <GlassCard className="h-full">
                                {/* Featured Badge */}
                                {product.featured && (
                                    <div className="absolute top-4 right-4 z-20 bg-burgundy/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                                        <Star className="w-3 h-3 text-burgundy fill-burgundy" />
                                        <span className="text-xs text-burgundy uppercase tracking-wider">Destacado</span>
                                    </div>
                                )}
                                
                                {/* Product Image */}
                                <div className="aspect-square mb-6 overflow-hidden">
                                    <div 
                                        className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: `url(${product.image})` }}
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="p-6 pt-0 space-y-3">
                                    <h3 className="text-xl font-cronde text-cream-accent group-hover:text-burgundy transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-stone-400 text-sm font-light line-clamp-2">
                                        {product.description}
                                    </p>
                                    <p className="text-burgundy font-medium tracking-wide text-lg">
                                        $ {product.price.toLocaleString("es-AR")}
                                    </p>

                                    <div className="w-full mt-4 py-3 border border-white/10 text-stone-300 text-xs uppercase tracking-widest group-hover:bg-burgundy group-hover:text-black group-hover:border-burgundy transition-all duration-300 flex items-center justify-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Ver Detalle
                                    </div>
                                </div>
                            </GlassCard>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
