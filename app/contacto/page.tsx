import SectionDivider from "@/components/SectionDivider";

export default function Contacto() {
    return (
        <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505] py-20 px-6">
            <SectionDivider variant="bottom" height="h-24" />

            {/* Background Texture/Orbs */}
            <div className="absolute inset-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-burgundy/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-burgundy/10 rounded-full blur-[100px] pointer-events-none" />
            </div>

            {/* Glass Container */}
            <div className="relative z-10 w-[90%] md:max-w-2xl bg-black/30 backdrop-blur-xl border border-white/10 rounded-[3rem] p-6 md:p-12 shadow-2xl">
                <h1 className="font-cronde text-5xl md:text-6xl mb-12 text-center text-white drop-shadow-sm">Contacto</h1>

                <form className="space-y-10">
                    <div className="group">
                        <label htmlFor="name" className="block text-xs uppercase tracking-[0.2em] text-white/50 mb-2 group-focus-within:text-white transition-colors">Nombre completo</label>
                        <input
                            type="text"
                            id="name"
                            className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-burgundy transition-all duration-500"
                            placeholder="Tu nombre"
                        />
                    </div>

                    <div className="group">
                        <label htmlFor="email" className="block text-xs uppercase tracking-[0.2em] text-white/50 mb-2 group-focus-within:text-white transition-colors">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-burgundy transition-all duration-500"
                            placeholder="tu@email.com"
                        />
                    </div>

                    <div className="group">
                        <label htmlFor="message" className="block text-xs uppercase tracking-[0.2em] text-white/50 mb-2 group-focus-within:text-white transition-colors">Mensaje</label>
                        <textarea
                            id="message"
                            rows={4}
                            className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-burgundy transition-all duration-500 resize-none"
                            placeholder="¿En qué podemos ayudarte?"
                        />
                    </div>

                    <div className="pt-4 text-center">
                        <button
                            type="submit"
                            className="px-12 py-4 border border-white/20 bg-white/5 hover:bg-white hover:text-black transition-all duration-500 uppercase tracking-[0.2em] text-xs rounded-full backdrop-blur-md"
                        >
                            Enviar mensaje
                        </button>
                    </div>
                </form>

                <div className="mt-16 text-center space-y-2 opacity-50 font-light text-xs tracking-widest text-white">
                    <p>BUENOS AIRES, ARGENTINA</p>
                    <p>HOLA@SACRE.COM.AR</p>
                </div>
            </div>
            
            <SectionDivider variant="top" height="h-24" />
        </main>
    );
}
