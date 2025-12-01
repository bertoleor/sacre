import Image from "next/image";

export default function QuienesSomos() {
    return (
        <section className="relative min-h-screen w-full flex items-center justify-center">
            {/* 1. LA IMAGEN VA AQUÍ, COMO FONDO ABSOLUTO */}
            <Image
                src="/images/bombones.png"
                alt="Fondo Bombones"
                fill
                className="object-cover z-0"
                priority
            />

            {/* 2. OVERLAY OSCURO PARA LEER */}
            <div className="absolute inset-0 bg-black/50 z-10" />

            {/* 3. CAJA DE CRISTAL FLOTANTE (SOLO TEXTO) */}
            <div className="relative z-20 w-[90%] md:max-w-3xl p-6 md:p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] text-center shadow-2xl">
                <h1 className="font-cronde text-5xl md:text-7xl mb-6 text-white drop-shadow-lg">Nuestra Esencia</h1>

                <div className="space-y-6 font-light text-lg leading-relaxed text-stone-200">
                    <p>
                        SACRÉ es un tributo a la belleza oculta en la oscuridad del cacao.
                        Nacimos con la convicción de que el chocolate no es solo un alimento, sino un medio de expresión artística.
                    </p>
                    <p>
                        En nuestro atelier, fusionamos técnicas ancestrales con una visión contemporánea.
                        Cada creación es un acto de fe en la perfección, una búsqueda incansable de lo sublime.
                    </p>
                    <p className="text-xl italic opacity-90 pt-4 text-white">
                        "No vendemos chocolate; compartimos momentos de reverencia."
                    </p>
                </div>
            </div>
        </section>
    );
}
