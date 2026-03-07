import SectionDivider from "@/components/SectionDivider";

export default function Terminos() {
    return (
        <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20">
            <SectionDivider variant="bottom" height="h-16" />
            
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="font-cronde text-5xl md:text-6xl mb-12 text-center">Términos y Condiciones</h1>

                <div className="prose prose-invert prose-lg max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-cronde text-burgundy mb-4">1. Información General</h2>
                        <p className="text-white/70 font-light leading-relaxed">
                            SACRÉ es una marca de chocolates artesanales fundada en Buenos Aires, Argentina. 
                            Al acceder a nuestro sitio web y realizar compras, aceptás los siguientes términos y condiciones.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-cronde text-burgundy mb-4">2. Productos</h2>
                        <p className="text-white/70 font-light leading-relaxed">
                            Todos nuestros productos son elaborados artesanalmente en nuestro atelier. 
                            Cada pieza puede presentar variaciones sutiles en apariencia, peso y sabor, 
                            lo cual es característico de los productos artesanales de alta gama.
                        </p>
                        <p className="text-white/70 font-light leading-relaxed mt-4">
                            Las fotografías de los productos son referenciales. 
                            Nos reservamos el derecho de modificar la presentación, 
                            packaging o ingredientes sin previo aviso.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-cronde text-burgundy mb-4">3. Precios y Pago</h2>
                        <p className="text-white/70 font-light leading-relaxed">
                            Los precios publicados están expresados en pesos argentinos (ARS) 
                            e incluyen IVA. Nos reservamos el derecho de modificar precios 
                            sin previo aviso.
                        </p>
                        <p className="text-white/70 font-light leading-relaxed mt-4">
                            Los métodos de pago aceptados son: MercadoPago, transferencias bancarias 
                            y tarjetas de crédito/débito a través de MercadoPago.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-cronde text-burgundy mb-4">4. Envíos</h2>
                        <p className="text-white/70 font-light leading-relaxed">
                            Realizamos envíos a todo el territorio argentino mediante servicios de logística refrigerada 
                            para preservar la calidad del chocolate. El costo de envío varía según la zona 
                            y se calcula al momento de la compra.
                        </p>
                        <p className="text-white/70 font-light leading-relaxed mt-4">
                            El tiempo estimado de entrega es de 3 a 7 días hábiles para Buenos Aires 
                            y 5 a 10 días hábiles para el resto del país.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-cronde text-burgundy mb-4">5. Conservación</h2>
                        <p className="text-white/70 font-light leading-relaxed">
                            Recomendamos consumir nuestros productos dentro de los 30 días desde su fecha de fabricación.
                            Almacenar en lugar fresco y seco, entre 16°C y 18°C. 
                            Evitar la heladera doméstica debido a la humedad que puede afectar textura y brillo.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-cronde text-burgundy mb-4">6. Política de Devoluciones</h2>
                        <p className="text-white/70 font-light leading-relaxed">
                            No aceptamos devoluciones de productos alimenticios por razones de higiene y seguridad.
                            En caso de recibir un producto en mal estado, contactanos dentro de las 24 horas 
                            siguientes a la recepción con fotos del producto.
                        </p>
                        <p className="text-white/70 font-light leading-relaxed mt-4">
                            Evaluaremos cada caso particular y procederemos al reemplazo o reembolso 
                            según corresponda.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-cronde text-burgundy mb-4">7. Alérgenos</h2>
                        <p className="text-white/70 font-light leading-relaxed">
                            Nuestros productos pueden contener trazas de: frutos secos, lácteos, soja y huevos.
                            Si tenés alguna alergia o intolerancia alimentaria, por favor contactanos 
                            antes de realizar tu compra.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-cronde text-burgundy mb-4">8. Propiedad Intelectual</h2>
                        <p className="text-white/70 font-light leading-relaxed">
                            Todos los contenidos del sitio web (textos, fotografías, logos, diseños) 
                            son propiedad de SACRÉ y están protegidos por las leyes de propiedad intelectual.
                            Queda prohibida su reproducción sin autorización previa.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-cronde text-burgundy mb-4">9. Contacto</h2>
                        <p className="text-white/70 font-light leading-relaxed">
                            Para consultas sobre pedidos, productos o cualquier otra cuestión, 
                            podés contactarnos a través de:
                        </p>
                        <ul className="text-white/70 font-light leading-relaxed mt-4 space-y-2">
                            <li>• Email: hola@sacre.com.ar</li>
                            <li>• Teléfono: [número de teléfono]</li>
                            <li>• Instagram: @sacre</li>
                        </ul>
                    </section>

                    <section className="pt-8 border-t border-white/10">
                        <p className="text-white/40 text-sm">
                            Última actualización: {new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                    </section>
                </div>
            </div>

            <SectionDivider variant="top" height="h-16" />
        </main>
    );
}
