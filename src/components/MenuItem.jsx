import React, { useState } from 'react';
import { useOrder } from '../hooks/useOrder.jsx';

const MenuItem = ({ item, onAdd, onRemove }) => {
    const { items: cartItems } = useOrder();
    const [selectedVariant, setSelectedVariant] = useState(null);

    const formatPrice = (n) => `$${n.toFixed(2)}`;

    const hasVariants = Boolean(item.variants && item.variants.length > 0);
    const activeId = hasVariants && selectedVariant ? selectedVariant.id : item.id;
    const currentQty = cartItems.find(i => i.id === activeId)?.qty || 0;

    const handleAdd = () => {
        if (hasVariants) {
            if (!selectedVariant) return;
            onAdd({ ...item, variant: selectedVariant });
        } else {
            onAdd(item);
        }
    };

    const handleRemove = () => {
        if (hasVariants && selectedVariant) {
            onRemove(selectedVariant.id);
        } else {
            onRemove(item.id);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-full">
            <div className="mb-4">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-dark text-lg leading-tight pr-2">{item.name}</h3>
                    {!hasVariants && (
                        <span className="font-bold text-primary whitespace-nowrap">{formatPrice(item.price)}</span>
                    )}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>

                {hasVariants && (
                    <div className="mb-2">
                        <div className="flex flex-wrap gap-2 mb-2">
                            {item.variants.map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVariant(v)}
                                    className={`px-3 py-1 text-sm font-medium rounded-full border transition-colors focus:outline-none ${selectedVariant?.id === v.id
                                            ? 'bg-primary border-primary text-white'
                                            : 'bg-white border-gray-300 text-gray-600 hover:border-primary hover:text-primary'
                                        }`}
                                >
                                    {v.label}
                                </button>
                            ))}
                        </div>
                        {selectedVariant && (
                            <div className="font-bold text-primary">
                                {formatPrice(selectedVariant.price)}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-auto">
                {currentQty === 0 ? (
                    <button
                        onClick={handleAdd}
                        disabled={hasVariants && !selectedVariant}
                        className={`w-full h-10 font-semibold rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${hasVariants && !selectedVariant
                                ? 'bg-primary/10 text-primary opacity-50 cursor-not-allowed'
                                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                            }`}
                    >
                        Agregar
                    </button>
                ) : (
                    <div className="flex items-center justify-between bg-gray-50 rounded-full border border-gray-200 p-1">
                        <button
                            onClick={handleRemove}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white text-dark hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label="Disminuir cantidad"
                        >
                            <span className="text-lg font-medium leading-none mb-0.5">-</span>
                        </button>
                        <span className="font-semibold text-dark w-8 text-center">{currentQty}</span>
                        <button
                            onClick={handleAdd}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                            aria-label="Aumentar cantidad"
                        >
                            <span className="text-lg font-medium leading-none mb-0.5">+</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuItem;
