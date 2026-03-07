"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Hardcoded credentials
        if (username === "sacre" && password === "chocolate") {
            // Set a simple cookie or localStorage for session
            localStorage.setItem("admin_session", "true");
            router.push("/admin");
        } else {
            setError("Credenciales incorrectas");
            setLoading(false);
        }
    };

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
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                        <div className="space-y-5">
                            {/* Username */}
                            <div className="space-y-2">
                                <label htmlFor="username" className="block text-xs uppercase tracking-widest text-white/50">
                                    Usuario
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-burgundy focus:outline-none transition-colors"
                                    placeholder="Ingresa tu usuario"
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
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder-white/20 focus:border-burgundy focus:outline-none transition-colors"
                                        placeholder="Ingresa tu contraseña"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="text-red-400 text-sm text-center">{error}</div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-burgundy text-black py-4 rounded-lg uppercase tracking-widest text-xs hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
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
                    <a href="/" className="text-white/40 hover:text-white text-sm transition-colors">
                        ← Volver al sitio
                    </a>
                </div>
            </div>
        </main>
    );
}
