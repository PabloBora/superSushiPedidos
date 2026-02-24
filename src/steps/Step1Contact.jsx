import React from 'react';
import { useForm } from 'react-hook-form';
import { useOrder } from '../hooks/useOrder.jsx';
import StepIndicator from '../components/StepIndicator.jsx';
import { captureAbandonedLead } from '../services/api.js';

const Step1Contact = () => {
    const { contact, setContact, setStep } = useOrder();
    const { register, handleSubmit, getValues, formState: { errors } } = useForm({
        defaultValues: {
            name: contact.name || '',
            phone: contact.phone || '',
            email: contact.email || ''
        },
        mode: 'onTouched'
    });

    const onSubmit = (data) => {
        setContact(data);
        setStep(2);
    };

    const handleEmailBlur = async (e) => {
        // Ejecutamos la validación nativa del hook form primero si es necesario, 
        // pero principalmente verificamos si no hay errores y hay datos
        const { name, phone, email } = getValues();
        if (email && !errors.email) {
            try {
                // Captura silenciosa, no bloquea al usuario
                await captureAbandonedLead({ name, phone, email });
            } catch (err) {
                console.error('Error capturando lead abandonado:', err);
            }
        }
    };

    // Extraemos onBlur de register para inyectar nuestro handleEmailBlur
    const { onBlur: rhfOnBlur, ...emailRegisterRest } = register("email", {
        required: "El correo es requerido",
        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Formato de correo inválido" }
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 max-w-[480px] mx-auto border border-gray-100">
            <StepIndicator currentStep={1} />
            <div className="text-center mb-8 mt-2">
                <h1 className="text-3xl font-bold text-dark mb-2">Super Sushi</h1>
                <p className="text-gray-500">Haz tu pedido en línea</p>
            </div>

            <h2 className="text-lg font-semibold text-dark mb-6">Tus datos de contacto</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre completo
                    </label>
                    <input
                        id="name"
                        type="text"
                        className={`w-full h-12 px-4 rounded-full border ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'} focus:outline-none focus:ring-1 transition-colors`}
                        placeholder="Ej. Juan Pérez"
                        {...register("name", {
                            required: "El nombre es requerido",
                            minLength: { value: 3, message: "Mínimo 3 caracteres" }
                        })}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono Móvil
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        className={`w-full h-12 px-4 rounded-full border ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'} focus:outline-none focus:ring-1 transition-colors`}
                        placeholder="10 dígitos"
                        {...register("phone", {
                            required: "El teléfono es requerido",
                            pattern: { value: /^[0-9]{10}$/, message: "Debe ser un número válido de 10 dígitos" }
                        })}
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Correo Electrónico
                    </label>
                    <input
                        id="email"
                        type="email"
                        className={`w-full h-12 px-4 rounded-full border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'} focus:outline-none focus:ring-1 transition-colors`}
                        placeholder="tu@correo.com"
                        {...emailRegisterRest}
                        onBlur={(e) => {
                            rhfOnBlur(e);
                            handleEmailBlur(e);
                        }}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <button
                    type="submit"
                    className="w-full h-12 mt-4 bg-primary text-white font-semibold rounded-full hover:bg-red-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    Siguiente: fecha y hora →
                </button>
            </form>
        </div>
    );
};

export default Step1Contact;
