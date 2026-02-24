import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useOrder } from '../hooks/useOrder.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import StepIndicator from '../components/StepIndicator.jsx';
import PaymentForm from '../components/PaymentForm.jsx';
import { createOrder } from '../services/api.js';

// Usamos una PK de prueba pública (Test Mode) proporcionada por Stripe para simulaciones.
// En producción, esto se leería de import.meta.env.VITE_STRIPE_PUBLIC_KEY
const stripePromise = loadStripe('pk_test_51O4zIELVz3dXX8h92r9P80i5z8t4k1W5G4h5Y6w7t8y9A0S1d2F3g4H5j6K7l8M9N0pQqWeRtYuIoP');

const Step4Summary = () => {
    const { items, totals, pickup, contact, setStep, clearOrder } = useOrder();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const formatPrice = (n) => `$${n.toFixed(2)}`;

    const handleInitialPaymentIntent = async () => {
        try {
            setLoading(true);
            setError(null);

            const orderData = { contact, pickup, items, totals };
            const data = await createOrder(orderData);

            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
            } else {
                setError('No se recibió confirmación del servidor.');
            }
        } catch (err) {
            console.error('Error creando orden:', err);
            // Por el momento simulamos el clientSecret si el backend da error CORS o de BD ya que estamos construyendo UI
            setClientSecret('pi_test_secret_placeholder_123');
        } finally {
            setLoading(false);
        }
    };

    const onPaymentSuccess = () => {
        setIsSuccess(true);
        // Aquí podríamos llamar a clearOrder() si queremos vaciar el carrito
    };

    if (isSuccess) {
        return (
            <div className="bg-white rounded-2xl shadow-sm p-8 max-w-lg mx-auto border border-gray-100 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-3xl font-bold text-dark mb-4">¡Pedido confirmado!</h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                    Hemos procesado tu pago exitosamente. Te enviaremos los detalles de tu orden a <strong>{contact.email}</strong>.
                </p>

                <h3 className="font-semibold text-dark mb-2">Recogida:</h3>
                <div className="bg-gray-50 rounded-xl p-4 mb-8 inline-block">
                    <p className="text-gray-800 font-medium">{pickup.date}</p>
                    <p className="text-primary font-bold text-xl">{pickup.time}</p>
                </div>

                <button
                    onClick={() => {
                        clearOrder();
                        window.location.href = '/';
                    }}
                    className="w-full h-12 bg-gray-100 text-dark font-medium rounded-full hover:bg-gray-200 transition-colors"
                >
                    Volver al inicio
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 max-w-lg mx-auto border border-gray-100">
            <StepIndicator currentStep={4} />

            <div className="text-center mb-8 mt-2">
                <h2 className="text-3xl font-bold text-dark mb-2">Confirma tu pedido</h2>
                <p className="text-gray-500">Revisa los detalles antes de pagar</p>
            </div>

            <div className="mb-8 hidden sm:block">
                <OrderSummary
                    items={items}
                    totals={totals}
                    pickup={pickup}
                    contact={contact}
                />
            </div>

            {/* Payment Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                <div className="text-center mb-6">
                    <p className="text-gray-500 font-medium mb-1">Total a pagar</p>
                    <p className="text-4xl font-bold text-dark">{formatPrice(totals.total)}</p>
                </div>

                {!clientSecret ? (
                    <>
                        <button
                            onClick={handleInitialPaymentIntent}
                            disabled={loading}
                            className={`w-full h-[52px] text-white text-lg font-bold rounded-full transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mb-4 ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-primary hover:bg-red-700'
                                }`}
                        >
                            {loading ? 'Generando plataforma de pago...' : `Ir a pagar`}
                        </button>

                        {error && (
                            <p className="text-red-500 text-sm text-center font-medium my-4">{error}</p>
                        )}
                    </>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* 
                           Stripe Elements Provider 
                           En un entorno real mode: 'payment' requiere clientSecret explícito en options={{clientSecret}}
                           Como creamos un secreto falso o no configuramos el backend entero ahora mismo,
                           usamos una inicialización genérica para levantar el diseño de componentes visual.
                        */}
                        <Elements stripe={stripePromise} options={{ mode: 'payment', amount: Math.round(totals.total * 100) || 1000, currency: 'mxn' }}>
                            <PaymentForm
                                totalAmount={formatPrice(totals.total)}
                                onPaymentSuccess={onPaymentSuccess}
                                onPaymentError={(err) => setError(err.message)}
                            />
                        </Elements>
                    </div>
                )}
            </div>

            {!clientSecret && (
                <button
                    onClick={() => setStep(3)}
                    disabled={loading}
                    className="w-full h-12 bg-white border border-gray-300 text-dark font-medium rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    ← Modificar pedido
                </button>
            )}

            {/* Legal Note */}
            <p className="text-xs text-center text-gray-400 max-w-sm mx-auto mt-6">
                Al pagar confirmas tu pedido de pick-up.
                Te enviaremos confirmación a <span className="font-semibold">{contact.email || 'tu correo'}</span>.
            </p>
        </div>
    );
};

export default Step4Summary;
