import React from 'react';

const OrderSummary = ({ items = [], totals = { subtotal: 0, tax: 0, total: 0 }, pickup = null, contact = null }) => {
    const formatPrice = (n) => `$${n.toFixed(2)}`;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 overflow-hidden">
            <h3 className="font-bold text-lg text-dark mb-4 border-b border-gray-100 pb-3">Resumen de tu pedido</h3>

            {/* Pickup info if provided */}
            {pickup && pickup.date && pickup.time && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <p className="font-medium text-dark mb-1">Detalles de Recolección:</p>
                    <div className="flex gap-4 text-gray-600 text-sm">
                        <span className="flex items-center"><span className="mr-2">📅</span> {pickup.date}</span>
                        <span className="flex items-center"><span className="mr-2">🕐</span> {pickup.time}</span>
                    </div>
                    {contact && contact.name && (
                        <p className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-200">
                            A nombre de: {contact.name}
                        </p>
                    )}
                </div>
            )}

            {/* Items table */}
            <div className="mb-6">
                {items.length === 0 ? (
                    <p className="text-gray-500 italic">No hay productos en tu orden.</p>
                ) : (
                    <div className="w-full text-sm">
                        <div className="grid grid-cols-[1fr_auto_80px] sm:grid-cols-[1fr_auto_80px_80px] gap-2 mb-2 font-medium text-gray-500 pb-2 border-b border-gray-100">
                            <div>Producto</div>
                            <div className="text-center w-10">Cant</div>
                            <div className="text-right hidden sm:block">Precio</div>
                            <div className="text-right">Subtotal</div>
                        </div>

                        <div className="space-y-3 pt-2">
                            {items.map((item) => (
                                <div key={item.id} className="grid grid-cols-[1fr_auto_80px] sm:grid-cols-[1fr_auto_80px_80px] gap-2 items-center">
                                    <div className="font-medium text-dark truncate pr-2">{item.name}</div>
                                    <div className="text-center w-10 text-gray-600 bg-gray-50 rounded-md py-0.5">{item.qty}</div>
                                    <div className="text-right text-gray-500 hidden sm:block">{formatPrice(item.price)}</div>
                                    <div className="text-right font-medium text-dark">{formatPrice(item.price * item.qty)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Totals section */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>IVA (16%)</span>
                    <span>{formatPrice(totals.tax)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
                    <span className="font-bold text-lg text-dark">Total a pagar</span>
                    <span className="font-bold text-xl text-primary">{formatPrice(totals.total)}</span>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
