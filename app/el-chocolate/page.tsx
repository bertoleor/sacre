import Image from "next/image";

export default function ElChocolate() {
    return (
        <main className="bg-[#050505] min-h-screen text-white overflow-x-hidden">

            {/* 1. Hero Section - Clean & Centered */}
            <section className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center">
                {/* Fixed Background */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/baina_cacao.png"
                        alt="Cacao Texture"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/90" />
                </div>

                {/* Centered Title */}
                <div className="relative z-20 text-center px-4">
                    <h2 className="font-cronde text-6xl md:text-[12rem] leading-none text-white drop-shadow-2xl break-words">
                        CACAO
                    </h2>
                </div>

                <div className="absolute bottom-[10vh] right-[10%] max-w-xs text-right hidden md:block z-20">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/80 mb-4">Theobroma</p>
                    <p className="font-light text-sm leading-relaxed text-white/70">
                        Alimento de los dioses. <br /> Fuente de vida y sabiduría ancestral.
                    </p>
                </div>
            </section>

            {/* 2. Central Narrative - The Axis */}
            <section className="relative py-40 px-6">
                <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center">

                    {/* Left Text */}
                    <div className="space-y-20 text-right hidden md:block relative z-10">
                        <div className="pr-12 border-r border-white/10 py-8 bg-black/60 backdrop-blur-md p-8 rounded-xl border border-white/5">
                            <h3 className="font-cronde text-4xl mb-4 text-white">Las Flores</h3>
                            <p className="font-light text-sm leading-relaxed text-white/80">
                                Nacen en delicados racimos, "cojines florales" que brotan directamente del tronco.
                                Belleza efímera que precede al fruto.
                            </p>
                        </div>
                    </div>

                    {/* Center Image - The Axis */}
                    <div className="relative h-[80vh] w-full md:w-full mx-auto overflow-hidden rounded-[2rem]">
                        <Image
                            src="/images/bombones_artesanales.png"
                            alt="El Eje del Cacao"
                            fill
                            className="object-cover grayscale hover:grayscale-0 transition-all duration-[2s] ease-out"
                        />
                        <div className="absolute inset-0 border border-white/10 mix-blend-overlay" />
                    </div>

                    {/* Right Text */}
                    <div className="space-y-20 md:pt-40 relative z-10">
                        <div className="pl-12 border-l border-white/10 py-8 bg-black/60 backdrop-blur-md p-8 rounded-xl border border-white/5">
                            <h3 className="font-cronde text-4xl mb-4 text-white">El Fruto</h3>
                            <p className="font-light text-sm leading-relaxed text-white/80">
                                Solo 30 de cada 6.000 flores se transforman.
                                Un tesoro que tarda 5 años en madurar bajo el sol tropical.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Cinematic Timeline - Glassmorphism */}
            <section className="relative py-40 w-full overflow-hidden">
                {/* Background Video/Texture Placeholder */}
                <div className="absolute inset-0 bg-[#080808]">
                    <div className="absolute inset-0 bg-[url('/images/hero.png')] bg-cover bg-fixed opacity-10 blur-sm" />
                </div>

                <div className="relative z-10 max-w-[1800px] mx-auto px-6">
                    <h2 className="font-cronde text-6xl md:text-8xl text-center mb-32 opacity-90">El Ritual</h2>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {[
                            { num: "01", title: "Fermentación", desc: "El nacimiento del aroma." },
                            { num: "02", title: "Secado", desc: "Conservando la esencia bajo el sol." },
                            { num: "03", title: "Molienda", desc: "La transformación en licor puro." },
                            { num: "04", title: "Conchado", desc: "72 horas de refinamiento absoluto." },
                            { num: "05", title: "Temperado", desc: "El brillo del cristal perfecto." },
                        ].map((step, i) => (
                            <div key={i} className="group relative h-[400px] border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-700 p-8 flex flex-col justify-between overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20 font-cronde text-6xl group-hover:scale-150 group-hover:opacity-10 transition-all duration-1000">
                                    {step.num}
                                </div>
                                <div className="mt-auto relative z-10">
                                    <h3 className="font-cronde text-3xl mb-4 group-hover:translate-x-2 transition-transform duration-500">{step.title}</h3>
                                    <p className="text-sm font-light opacity-50 group-hover:opacity-90 transition-opacity duration-500">
                                        {step.desc}
                                    </p>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Closing Statement */}
            <section className="h-[50vh] flex items-center justify-center text-center px-6">
                <p className="font-cronde text-4xl md:text-6xl max-w-4xl leading-tight opacity-80 mix-blend-difference">
                    "Una joya que se funde en el alma."
                </p>
            </section>
        </main>
    );
}
