import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrder } from '../hooks/useOrder.jsx';
import { MENU } from '../config/menu.js';
import MenuItem from '../components/MenuItem.jsx';
import StepIndicator from '../components/StepIndicator.jsx';

const Step3Menu = () => {
    const { items, addItem, removeItem, updateQty, setStep, totals } = useOrder();
    const [activeCategory, setActiveCategory] = useState(MENU[0].category);

    // Helper function to get qty for a specific item id
    const getItemQty = (id) => {
        const found = items.find(i => i.id === id);
        return found ? found.qty : 0;
    };

    const handleAdd = (itemData) => {
        addItem({ ...itemData, category: activeCategory });
    };

    const handleRemove = (id) => {
        const currentQty = getItemQty(id);
        if (currentQty > 1) {
            updateQty(id, currentQty - 1);
        } else {
            removeItem(id);
        }
    };

    const activeMenu = MENU.find(c => c.category === activeCategory)?.items || [];
    const totalItemsCount = items.reduce((acc, item) => acc + item.qty, 0);

    return (
        <div className="relative pb-24 max-w-2xl mx-auto"> {/* Padding bottom for sticky footer */}
            <StepIndicator currentStep={3} />
            <div className="flex items-center mb-6 mt-4">
                <button
                    onClick={() => setStep(2)}
                    className="h-10 px-4 rounded-full border border-gray-300 text-dark font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                    ← Atrás
                </button>
                <h2 className="text-xl font-bold text-dark ml-4">Nuestro Menú</h2>
            </div>

            {/* Categories Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                {MENU.map((cat) => (
                    <button
                        key={cat.category}
                        onClick={() => setActiveCategory(cat.category)}
                        className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === cat.category
                            ? 'bg-primary text-white shadow-sm'
                            : 'border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                            }`}
                    >
                        {cat.category}
                    </button>
                ))}
            </div>

            {/* Items Grid */}
            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {activeMenu.map((item) => (
                            <MenuItem
                                key={item.id}
                                item={item}
                                qty={getItemQty(item.id)}
                                onAdd={handleAdd}
                                onRemove={handleRemove}
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Sticky Bottom Summary */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {totalItemsCount > 0 && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50 border-t border-gray-200"
                        >
                            <div className="max-w-2xl mx-auto flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">{totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}</p>
                                    <p className="font-bold text-lg text-dark">Total: ${totals.subtotal.toFixed(2)}</p>
                                </div>
                                <button
                                    onClick={() => setStep(4)}
                                    className="h-12 px-8 bg-primary text-white font-semibold rounded-full hover:bg-red-700 transition-colors shadow-sm"
                                >
                                    Ver resumen →
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default Step3Menu;
