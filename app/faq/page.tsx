export default function FAQ() {
    return (
        <main className="pt-32 pb-20 px-6 min-h-screen">
            <div className="max-w-3xl mx-auto">
                <h1 className="font-cronde text-5xl md:text-7xl mb-16 text-center">Preguntas frecuentes</h1>

                <div className="space-y-12">
                    <div className="border-b border-white/20 pb-8">
                        <h3 className="font-cronde text-2xl mb-4">¿Realizan envíos a todo el país?</h3>
                        <p className="font-light opacity-80">
                            Sí, realizamos envíos a toda Argentina. Utilizamos un servicio de logística refrigerada para garantizar que el producto llegue en perfectas condiciones.
                        </p>
                    </div>

                    <div className="border-b border-white/20 pb-8">
                        <h3 className="font-cronde text-2xl mb-4">¿Cómo debo conservar los bombones?</h3>
                        <p className="font-light opacity-80">
                            Recomendamos mantenerlos en un lugar fresco y seco, entre 16°C y 18°C. Evite la heladera, ya que la humedad puede afectar su textura y brillo.
                        </p>
                    </div>

                    <div className="border-b border-white/20 pb-8">
                        <h3 className="font-cronde text-2xl mb-4">Información sobre alérgenos</h3>
                        <p className="font-light opacity-80">
                            Nuestros productos pueden contener trazas de frutos secos, lácteos y soja. Si tiene alguna alergia específica, por favor contáctenos antes de realizar su compra.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
