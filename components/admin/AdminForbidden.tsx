import { logoutAction } from "@/app/admin/actions";

/**
 * SACRÉ P0-1 — Pantalla para usuarios autenticados SIN membership admin
 * (sin fila en admin_users). RLS ya les devuelve 0 filas en la DB; acá ni
 * siquiera renderizamos el chrome del panel. Sin redirect (evita loop con
 * el proxy): logout es server action, revoca en GoTrue.
 */
export default function AdminForbidden() {
    return (
        <main className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <h1 className="font-cronde text-5xl text-white mb-6">SACRÉ</h1>
                <p className="text-white/60 mb-8">
                    Tu cuenta no tiene acceso de administrador.
                </p>
                <form action={logoutAction}>
                    <button
                        type="submit"
                        className="bg-burgundy text-black py-3 px-8 rounded-lg uppercase tracking-widest text-xs hover:bg-white transition-colors"
                    >
                        Cerrar sesión
                    </button>
                </form>
            </div>
        </main>
    );
}
