import { Plus, Star } from "lucide-react";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import GlassCard from "@/components/GlassCard";
import { getProducts, getCatalogClient } from "@/lib/catalog";

export default async function ProductGrid({ category }: { readonly category?: string }) {
    const supabase = getCatalogClient();
    const allProducts = await getProducts(supabase);
    const filteredProducts = category
        ? allProducts.filter(p => p.category === category)
        : allProducts;

    return (
        <section className="py-24 bg-[#050505]">
            <div className="container mx-auto px-6">
                <FadeIn direction="up" duration={0.8}>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-cronde text-burgundy mb-4">
                            {category ? `Colección ${category.charAt(0).toUpperCase() + category.slice(1)}` : "Colección Exclusiva"}
                        </h2>
                        <div className="w-24 h-px bg-burgundy/30 mx-auto" />
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {filteredProducts.map((product, index) => (
                        <FadeIn key={product.id} direction="up" delay={index * 0.1} duration={0.6}>
                            <Link
                                href={`/productos/${product.id}`}
                                className="group block"
                            >
                                <GlassCard>
                                    {/* Featured Badge */}
                                    {product.featured && (
                                        <div className="absolute top-4 right-4 z-20 bg-burgundy/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                                            <Star className="w-3 h-3 text-burgundy fill-burgundy" />
                                            <span className="text-xs text-burgundy uppercase tracking-wider">Destacado</span>
                                        </div>
                                    )}

                                    <div className="aspect-square mb-6 overflow-hidden relative">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                            style={{ backgroundImage: `url(${product.image || product.images?.[0] || "/images/bombones.png"})` }}
                                        />
                                        {(product.stock ?? 0) <= 0 && (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                                                <span className="uppercase tracking-[0.2em] text-xs border border-white/30 rounded-full px-4 py-2 text-white/80">
                                                    Agotado
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 pt-0 flex flex-col justify-end min-h-[200px] text-center">
                                        <h3 className="text-xl font-cronde text-cream-accent group-hover:text-burgundy transition-colors mb-2">
                                            {product.name}
                                        </h3>
                                        <p className="text-stone-400 text-sm font-light line-clamp-2 mb-4">
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
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
