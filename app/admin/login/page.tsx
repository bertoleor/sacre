"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock } from "lucide-react";
import { loginAction, type LoginActionState } from "./actions";

const initialState: LoginActionState = { error: "" };

/**
 * SACRÉ P0-1 — Login admin con Supabase Auth real.
 * Sin credenciales hardcodeadas ni localStorage: el form postea al server
 * action `loginAction` (ver actions.ts) que autentica contra GoTrue y setea
 * la sesión como cookies httpOnly server-side.
 */
export default function AdminLogin() {
    const [state, formAction, pending] = useActionState(loginAction, initialState);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <main className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-burgundy/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-burgundy/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-12">
                    <h1 className="font-cronde text-5xl text-white mb-2">SACRÉ</h1>
                    <p className="text-white/40 text-sm uppercase tracking-widest">Panel de Administración</p>
                </div>

                {/* Login Form */}
                <form action={formAction} className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                        <div className="space-y-5">
                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-xs uppercase tracking-widest text-white/50">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    autoComplete="email"
                                    className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-burgundy focus:outline-none transition-colors"
                                    placeholder="admin@sacre.com.ar"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-xs uppercase tracking-widest text-white/50">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        autoComplete="current-password"
                                        className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder-white/20 focus:border-burgundy focus:outline-none transition-colors"
                                        placeholder="Ingresa tu contraseña"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Error message */}
                            {state.error && (
                                <div className="text-red-400 text-sm text-center" role="alert">
                                    {state.error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={pending}
                                className="w-full bg-burgundy text-black py-4 rounded-lg uppercase tracking-widest text-xs hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {pending ? (
                                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Lock size={16} />
                                        Iniciar Sesión
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Back to site */}
                <div className="text-center mt-8">
                    <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">
                        ← Volver al sitio
                    </Link>
                </div>
            </div>
        </main>
    );
}
