import type { Metadata } from "next";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

const cronde = localFont({
    src: "../public/fonts/CRONDERegular.ttf",
    variable: "--font-cronde",
});

const montserrat = Montserrat({
    subsets: ["latin"],
    variable: "--font-montserrat",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://sacre.com.ar"),
    title: "SACRÉ | El sabor de lo sagrado",
    description: "Chocolatería de alta gama.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={`${cronde.variable} ${montserrat.variable} bg-[#050505] text-white font-sans antialiased`}>
                <CartProvider>
                    <CartDrawer />
                    <Navbar />
                    {children}
                    <Footer />
                </CartProvider>
            </body>
        </html>
    );
}
