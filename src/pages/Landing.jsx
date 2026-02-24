import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
    const navigate = useNavigate();

    const handleOrderClick = () => {
        navigate('/orden');
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Section 1 - Hero */}
            <section className="bg-dark text-white pt-20 pb-24 px-6 md:px-12 lg:px-24">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-start"
                    >
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium tracking-wide mb-6 border border-white/20">
                            Pedidos en línea • Pick-up
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            Super Sushi
                        </h1>
                        <h2 className="text-2xl md:text-3xl text-gray-300 font-medium mb-6">
                            Ordena en línea, recoge cuando quieras
                        </h2>
                        <p className="text-gray-400 text-lg mb-10 max-w-md leading-relaxed">
                            Selecciona tus rollos favoritos, elige tu horario y paga en línea. Sin esperas, sin llamadas.
                        </p>

                        <button
                            onClick={handleOrderClick}
                            className="h-[52px] px-10 bg-primary text-white text-lg font-bold rounded-full hover:bg-red-700 transition-all hover:scale-105 shadow-[0_0_20px_rgba(212,43,43,0.3)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark w-full sm:w-auto"
                        >
                            Ordenar ahora
                        </button>
                        <p className="text-gray-500 text-sm mt-4 font-medium">
                            Pick-up disponible hoy • 12:00 - 21:00
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full aspect-video bg-gray-800 rounded-2xl border border-gray-700 flex items-center justify-center overflow-hidden relative shadow-2xl"
                    >
                        {/* Placeholder for real image */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 to-gray-800 opacity-80"></div>
                        <p className="text-gray-400 font-medium flex items-center gap-3 relative z-10 text-lg">
                            <span className="text-2xl">📸</span> Foto del restaurante
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Section 2 - Cómo funciona */}
            <section className="py-24 px-6 md:px-12 bg-white">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-dark">¿Cómo funciona?</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {[
                            {
                                num: "01",
                                title: "Elige tu menú",
                                desc: "Selecciona tus rollos y entradas favoritas"
                            },
                            {
                                num: "02",
                                title: "Elige tu horario",
                                desc: "Selecciona el día y hora de recogida"
                            },
                            {
                                num: "03",
                                title: "Paga y listo",
                                desc: "Pago seguro en línea. Te mandamos confirmación por correo"
                            }
                        ].map((step, index) => (
                            <motion.div
                                key={step.num}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="relative z-10 flex flex-col items-center text-center group"
                            >
                                <h3 className="text-6xl font-black text-primary mb-4">{step.num}</h3>
                                <h4 className="text-xl font-bold text-dark mb-3">{step.title}</h4>
                                <p className="text-gray-500 leading-relaxed max-w-xs">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 3 - CTA Final */}
            <section className="bg-primary py-24 px-6 md:px-12 text-center relative overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 max-w-3xl mx-auto"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        ¿Listo para ordenar?
                    </h2>
                    <p className="text-xl text-white/80 font-medium mb-10">
                        Tu pedido estará listo cuando llegues
                    </p>
                    <button
                        onClick={handleOrderClick}
                        className="h-[56px] px-12 bg-white text-primary text-xl font-bold rounded-full hover:bg-gray-50 transition-all hover:scale-105 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30"
                    >
                        Hacer mi pedido
                    </button>
                </motion.div>
            </section>
        </div>
    );
};

export default Landing;
