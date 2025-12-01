import Link from "next/link";
import { Instagram, Facebook, Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#050505] text-white py-20 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
                <Link href="/" className="font-cronde text-4xl md:text-5xl mb-12 tracking-wider hover:opacity-80 transition-opacity">
                    SACRÉ
                </Link>

                <div className="flex space-x-8 mb-12">
                    <a href="#" className="hover:text-gray-400 transition-colors duration-500">
                        <Instagram size={20} strokeWidth={1.5} />
                    </a>
                    <a href="#" className="hover:text-gray-400 transition-colors duration-500">
                        <Facebook size={20} strokeWidth={1.5} />
                    </a>
                    <a href="mailto:hola@sacre.com.ar" className="hover:text-gray-400 transition-colors duration-500">
                        <Mail size={20} strokeWidth={1.5} />
                    </a>
                </div>

                <div className="text-xs uppercase tracking-widest opacity-40 font-light">
                    <p>&copy; {new Date().getFullYear()} SACRÉ. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
