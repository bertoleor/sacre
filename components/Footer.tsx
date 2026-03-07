import Link from "next/link";
import { Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#050505] text-white py-20 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
                <Link href="/" className="font-cronde text-4xl md:text-5xl mb-12 tracking-wider hover:opacity-80 transition-opacity">
                    SACRÉ
                </Link>

                <div className="flex space-x-8 mb-12">
                    <a href="https://instagram.com/sacre" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors duration-500" aria-label="Instagram">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </a>
                    <a href="https://facebook.com/sacre" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors duration-500" aria-label="Facebook">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                    <a href="mailto:hola@sacre.com.ar" className="hover:text-gray-400 transition-colors duration-500" aria-label="Email">
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
