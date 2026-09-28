import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Heart, Star } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import { getProductById, getProducts, getCatalogClient } from "@/lib/catalog";

// ORN-126: ISR so stock/price edits show within 5 min without a rebuild.
export const revalidate = 300;

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;
    const supabase = getCatalogClient();
    const product = await getProductById(supabase, id);

    if (!product) {
        return {
            title: "Producto no encontrado | SACRÉ",
        };
    }

    return {
        title: `${product.name} | SACRÉ`,
        description: product.description ?? undefined,
        openGraph: {
            title: `${product.name} | SACRÉ`,
            description: product.description ?? undefined,
            images: [product.image || product.images?.[0] || ""],
        },
    };
}

export default async function ProductDetailPage({ params }: Readonly<PageProps>) {
    const { id } = await params;
    // ORN-126: product from the live DB. Degrades to null on DB errors or
    // missing config, so an outage renders a 404, never a 500.
    const supabase = getCatalogClient();
    const product = await getProductById(supabase, id);

    if (!product) {
        notFound();
    }

    const soldOut = (product.stock ?? 0) <= 0;
    const allProducts = await getProducts(supabase);

    return (
        <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Back Link */}
                <Link 
                    href="/productos" 
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-12"
                >
                    <ArrowLeft size={20} />
                    <span className="uppercase tracking-widest text-xs">Volver a Colección</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Image Section */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white/5">
                        <Image
                            src={product.image || product.images?.[0] || "/images/bombones.png"}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                        {soldOut && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="uppercase tracking-[0.3em] text-sm border border-white/30 rounded-full px-6 py-3 text-white/80">
                                    Agotado
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="space-y-8">
                        {/* Breadcrumb */}
                        <div className="text-xs uppercase tracking-[0.2em] text-white/40">
                            Colección / {product.name}
                        </div>

                        {/* Title */}
                        <h1 className="font-cronde text-4xl md:text-6xl">
                            {product.name}
                        </h1>

                        {/* Price */}
                        <div className="text-2xl text-burgundy">
                            $ {product.price.toLocaleString("es-AR")}
                        </div>

                        {/* Stock */}
                        <div className="text-sm text-white/50">
                            {soldOut ? (
                                <span className="text-burgundy uppercase tracking-widest">Sin stock</span>
                            ) : (
                                <span>{product.stock} disponibles</span>
                            )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                            {[0,1,2,3,4].map((starIndex) => (
                                <Star 
                                    key={`star-${starIndex}`} 
                                    size={16} 
                                    className="text-burgundy fill-burgundy" 
                                />
                            ))}
                            <span className="text-white/40 text-sm ml-2">(12 reseñas)</span>
                        </div>

                        {/* Description */}
                        <p className="text-white/70 font-light leading-relaxed text-lg">
                            {product.description}
                        </p>

                        {/* Product Info */}
                        <div className="border-t border-white/10 pt-8 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-white/40">Origen</span>
                                <span>Cacao Premium Ecuador</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-white/40">Peso</span>
                                <span>120g</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-white/40">Conservación</span>
                                <span>16-18°C, lugar seco</span>
                            </div>
                        </div>

                        {/* Quantity & Add to Cart */}
                        <div className="border-t border-white/10 pt-8">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex items-center border border-white/20 rounded-full px-4 py-2">
                                    <button className="text-white/60 hover:text-white px-3">-</button>
                                    <span className="px-4">1</span>
                                    <button className="text-white/60 hover:text-white px-3">+</button>
                                </div>
                                {soldOut ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="flex-1 border border-white/20 text-white/40 px-8 py-3 rounded-full uppercase tracking-widest text-xs cursor-not-allowed flex items-center justify-center gap-3"
                                    >
                                        Agotado
                                    </button>
                                ) : (
                                    <AddToCartButton product={product} />
                                )}
                                <button className="border border-white/20 p-3 rounded-full hover:border-burgundy hover:text-burgundy transition-colors">
                                    <Heart size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="bg-white/5 rounded-2xl p-6 space-y-4">
                            <p className="text-sm text-white/60">
                                <span className="text-white">🍫</span> artesanalmente elaborado en nuestro atelier
                            </p>
                            <p className="text-sm text-white/60">
                                <span className="text-white">📦</span> envío refrigerado para preservar frescura
                            </p>
                            <p className="text-sm text-white/60">
                                <span className="text-white">🎁</span> presentacion perfecta para regalo
                            </p>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                <section className="mt-24">
                    <h2 className="font-cronde text-3xl mb-12 text-center">
                        También te puede gustar
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {allProducts
                            .filter((p) => p.id !== product.id)
                            .slice(0, 3)
                            .map((relatedProduct) => (
                                <Link 
                                    key={relatedProduct.id} 
                                    href={`/productos/${relatedProduct.id}`}
                                    className="group"
                                >
                                    <div className="relative aspect-square mb-4 overflow-hidden rounded-2xl">
                                        <Image
                                            src={relatedProduct.image || relatedProduct.images?.[0] || "/images/bombones.png"}
                                            alt={relatedProduct.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <h3 className="font-cronde text-xl mb-1">{relatedProduct.name}</h3>
                                    <p className="text-burgundy">
                                        $ {relatedProduct.price.toLocaleString("es-AR")}
                                    </p>
                                </Link>
                            ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
