import Image from "next/image";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="h-screen w-full flex flex-col justify-center items-center relative overflow-hidden">
            {/* Top gradient - smooth fade from page background */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#050505] via-[#050505]/50 to-transparent z-30" />
            
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/hero.png"
                    alt="Chocolate artesanal SACRÉ"
                    fill
                    className="object-cover object-center"
                    priority
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Echo Title (Background) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none w-full text-center">
                <span className="font-cronde text-[25vw] opacity-[0.03] text-white blur-sm leading-none">
                    SAGRADO
                </span>
            </div>

            {/* Main Title (Foreground) */}
            <div className="relative z-20 flex flex-col items-center justify-center text-center px-4">
                <h1 className="flex flex-col items-center mb-12">
                    <span className="font-cronde text-3xl md:text-5xl mb-6 lowercase tracking-wide text-white italic">
                        el sabor de lo
                    </span>
                    <span className="font-cronde text-7xl md:text-[11rem] lg:text-[13vw] leading-[0.8] uppercase text-white drop-shadow-2xl break-words w-full">
                        SAGRADO
                    </span>
                </h1>

                <Link
                    href="/productos"
                    className="mt-12 px-8 py-3 border border-white/30 hover:bg-white hover:text-black transition-all duration-700 uppercase tracking-[0.2em] text-xs backdrop-blur-sm text-white"
                >
                    Descubrir Colección
                </Link>
            </div>
        </section>
    );
}
