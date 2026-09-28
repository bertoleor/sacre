import Hero from "@/components/Hero";
import Link from "next/link";
import Image from "next/image";
import FadeIn from "@/components/FadeIn";
import ProductCarousel from "@/components/ProductCarousel";
import SectionDivider from "@/components/SectionDivider";
import { getProductsByCategory, getCatalogClient } from "@/lib/catalog";

// ORN-126: catalog from live DB. ISR: stock/price changes show within 5 min
// without a rebuild; the page stays static-fast between revalidations.
export const revalidate = 300;

export default async function Home() {
    // ORN-126: catalog from live DB (service role). Degrades to empty on DB
    // outage or missing config — the page renders without the carousel.
    const supabase = getCatalogClient();
    const bombones = await getProductsByCategory(supabase, "bombones");

    return (
        <main className="bg-[#050505] min-h-screen text-white overflow-x-hidden">
            <Hero />
            
            {/* Gradient Divider: Hero → Categories */}
            <SectionDivider variant="both" height="h-24" />

            {/* Categories Bento Grid Section */}
            <section className="w-full py-20 px-6 bg-[#050505]">
                <FadeIn direction="up" delay={0.2}>
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 h-auto md:h-[800px]">

                        {/* Left Column (Stack) */}
                        <div className="flex flex-col gap-4 h-[800px] md:h-full">
                            {/* Card 1: Bombones */}
                            <div className="relative flex-1 rounded-[2.5rem] overflow-hidden group cursor-pointer">
                                <Image
                                    src="/images/bombones.png"
                                    alt="Bombones"
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-700" />

                                <div className="absolute bottom-8 left-8 bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-2xl">
                                    <h2 className="font-cronde text-3xl text-white drop-shadow-lg">
                                        Bombones
                                    </h2>
                                </div>
                                <Link href="/productos" className="absolute inset-0 z-10" />
                            </div>

                            {/* Card 2: Tabletas */}
                            <div className="relative flex-1 rounded-[2.5rem] overflow-hidden group cursor-pointer">
                                <Image
                                    src="/images/tableta.png"
                                    alt="Tabletas"
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-700" />

                                <div className="absolute bottom-8 left-8 bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-2xl">
                                    <h2 className="font-cronde text-3xl text-white drop-shadow-lg">
                                        Tabletas
                                    </h2>
                                </div>
                                <Link href="/productos" className="absolute inset-0 z-10" />
                            </div>
                        </div>

                        {/* Right Column (Hero Card) */}
                        <div className="relative h-[400px] md:h-full rounded-[2.5rem] overflow-hidden group cursor-pointer">
                            <Image
                                src="/images/bombones_navidad3.png"
                                alt="Privilège / Colección Festiva"
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-700" />

                            <div className="absolute bottom-8 left-8 bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-2xl">
                                <h2 className="font-cronde text-3xl md:text-5xl text-white drop-shadow-lg">
                                    Privilège{" "}
                                    <span className="block text-sm font-sans tracking-widest uppercase mt-2 opacity-80">Colección Festiva</span>
                                </h2>
                            </div>
                            <Link href="/productos" className="absolute inset-0 z-10" />
                        </div>

                    </div>
                </FadeIn>
            </section>

            {/* Gradient Divider: Categories → Products */}
            <SectionDivider variant="both" height="h-24" />

            {/* Featured Products Carousel */}
            <ProductCarousel 
                title="Selección" 
                products={bombones}
            />

            {/* Gradient Divider: Products → Origin */}
            <SectionDivider variant="both" height="h-24" />

            {/* Immersive Teaser Section - Origin */}
            <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
                {/* Parallax Background with Vignette */}
                <div className="absolute inset-0">
                    <Image
                        src="/images/baina_cacao.png"
                        alt="Origen del Cacao"
                        fill
                        className="object-cover"
                        sizes="100vw"
                        quality={90}
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    {/* Top Vignette */}
                    <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#050505] via-[#050505]/50 to-transparent" />
                    {/* Bottom Vignette */}
                    <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <FadeIn direction="up" duration={0.8}>
                        <div className="bg-black/30 backdrop-blur-md border border-white/10 p-12 md:p-20 rounded-xl">
                            <span className="block text-xs uppercase tracking-[0.3em] text-white/80 mb-6">Nuestra Esencia</span>
                            <h2 className="font-cronde text-6xl md:text-8xl mb-8 leading-[0.9]">
                                El <br /> Origen
                            </h2>
                            <p className="font-light text-xl leading-relaxed opacity-90 mb-12">
                                En la profundidad de la selva, el tiempo se detiene.
                                Cada grano es un tesoro sagrado, preservando la pureza de un sabor milenario.
                            </p>
                            <Link
                                href="/el-chocolate"
                                className="inline-block px-12 py-4 border border-white/30 hover:bg-white hover:text-black hover:border-white transition-all duration-700 uppercase tracking-[0.2em] text-xs"
                            >
                                Descubrir Historia
                            </Link>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Gradient Divider: Origin → Footer */}
            <SectionDivider variant="top" height="h-32" />
        </main>
    );
}
