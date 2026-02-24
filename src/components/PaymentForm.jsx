import React, { useState } from 'react';

const PaymentForm = ({ onPaymentSuccess, onPaymentError, totalAmount }) => {
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulamos el delay de red de Stripe processing
        setTimeout(() => {
            setIsLoading(false);
            setMessage('Pago exitoso!');
            onPaymentSuccess && onPaymentSuccess({ status: 'succeeded' });
        }, 2000);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">

                {/* Visual Fake Stripe Elements UI for demo purposes until real keys are provided */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Número de Tarjeta
                        </label>
                        <div className="w-full h-10 px-3 bg-gray-50 border border-gray-300 rounded flex items-center justify-between text-gray-400 font-mono text-sm">
                            <span>•••• •••• •••• ••••</span>
                            <span className="text-xl">💳</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Fecha Exp
                            </label>
                            <div className="w-full h-10 px-3 bg-gray-50 border border-gray-300 rounded flex items-center text-gray-400 font-mono text-sm">
                                MM / AA
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                CVC
                            </label>
                            <div className="w-full h-10 px-3 bg-gray-50 border border-gray-300 rounded flex items-center text-gray-400 font-mono text-sm">
                                •••
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {message && (
                <div className={`mb-4 text-sm font-medium text-center ${message.includes('exitoso') ? 'text-green-600' : 'text-red-500'}`}>
                    {message}
                </div>
            )}

            <button
                disabled={isLoading}
                id="submit"
                className={`w-full h-[52px] text-white text-lg font-bold rounded-full transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isLoading
                        ? 'bg-gray-400 cursor-not-allowed hidden'
                        : 'bg-primary hover:bg-red-700'
                    }`}
            >
                <span id="button-text">
                    {isLoading ? "Procesando el pago..." : `Pagar ${totalAmount}`}
                </span>
            </button>

            {isLoading && (
                <button disabled className="w-full h-[52px] text-white text-lg font-bold rounded-full transition-all shadow-md focus:outline-none bg-gray-400 cursor-not-allowed animate-pulse">
                    Procesando transacción...
                </button>
            )}
        </form>
    );
};

export default PaymentForm;
