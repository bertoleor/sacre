"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { getItemCount, toggleCart } = useCart();
    const itemCount = getItemCount();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || isOpen
                    ? "bg-black/80 backdrop-blur-md py-3"
                    : "bg-transparent py-6"
                    } text-white`}
            >
                <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
                    <Link href="/" className="font-cronde text-2xl tracking-wider z-50 relative">
                        SACRÉ
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8 lg:space-x-12 text-sm tracking-[0.15em] uppercase font-light">
                        <Link href="/" className="hover:opacity-70 transition-opacity">
                            Inicio
                        </Link>
                        <Link href="/el-chocolate" className="hover:opacity-70 transition-opacity">
                            El Chocolate
                        </Link>
                        <Link href="/productos" className="hover:opacity-70 transition-opacity">
                            Productos
                        </Link>
                        <Link href="/quienes-somos" className="hover:opacity-70 transition-opacity">
                            Quiénes Somos
                        </Link>
                        <Link href="/contacto" className="hover:opacity-70 transition-opacity">
                            Contacto
                        </Link>
                        
                        {/* Cart Button */}
                        <button 
                            onClick={toggleCart}
                            className="relative hover:opacity-70 transition-opacity"
                            aria-label="Abrir carrito"
                        >
                            <ShoppingBag size={20} />
                            {itemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-antique-gold text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                    {itemCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden z-50 relative text-white focus:outline-none"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={32} /> : <Menu size={32} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
                    <div className="flex flex-col space-y-8 text-center">
                        <Link
                            href="/"
                            className="font-cronde text-4xl text-white hover:text-white/70 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Inicio
                        </Link>
                        <Link
                            href="/el-chocolate"
                            className="font-cronde text-4xl text-white hover:text-white/70 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            El Chocolate
                        </Link>
                        <Link
                            href="/productos"
                            className="font-cronde text-4xl text-white hover:text-white/70 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Productos
                        </Link>
                        <Link
                            href="/quienes-somos"
                            className="font-cronde text-4xl text-white hover:text-white/70 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Quiénes Somos
                        </Link>
                        <Link
                            href="/contacto"
                            className="font-cronde text-4xl text-white hover:text-white/70 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Contacto
                        </Link>
                        
                        {/* Cart in mobile */}
                        <button 
                            onClick={() => {
                                setIsOpen(false);
                                toggleCart();
                            }}
                            className="font-cronde text-4xl text-antique-gold hover:text-white/70 transition-colors flex items-center justify-center gap-3"
                        >
                            <ShoppingBag size={32} />
                            Carrito
                            {itemCount > 0 && (
                                <span className="bg-antique-gold text-black text-sm w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                    {itemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
