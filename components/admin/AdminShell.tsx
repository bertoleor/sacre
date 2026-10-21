"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    LogOut,
    Menu,
    X,
    ChevronLeft,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";

const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Productos", href: "/admin/productos", icon: Package },
    { name: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
];

/**
 * SACRÉ P0-1 — Chrome client del panel admin (sidebar + topbar).
 * La AUTENTICACIÓN no vive acá: el layout server ya validó sesión + is_admin
 * antes de renderizar este componente. Acá solo queda estado de UI (sidebar
 * mobile) y el logout, que es un server action (revoca en GoTrue y limpia
 * cookies httpOnly — nada de remover flags de localStorage).
 */
export default function AdminShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#050505]">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
                    <Link href="/admin" className="font-cronde text-2xl text-white">
                        SACRÉ
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-white/40 hover:text-white"
                        aria-label="Cerrar menú"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                    isActive
                                        ? "bg-burgundy/10 text-burgundy"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon size={20} />
                                <span className="text-sm">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout — server action: revoca sesión en GoTrue + limpia cookies */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="flex items-center gap-3 px-4 py-3 w-full text-white/60 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="text-sm">Cerrar Sesión</span>
                        </button>
                    </form>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <div className="sticky top-0 z-30 h-16 bg-[#050505]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 lg:px-8">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-white/60 hover:text-white"
                        aria-label="Abrir menú"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
                        >
                            <ChevronLeft size={16} />
                            Ver sitio
                        </Link>
                    </div>
                </div>

                {/* Page content */}
                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
