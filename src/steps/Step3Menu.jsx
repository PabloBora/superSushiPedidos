import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrder } from '../hooks/useOrder.jsx';
import { MENU } from '../config/menu.js';
import MenuItem from '../components/MenuItem.jsx';
import StepIndicator from '../components/StepIndicator.jsx';
import OrderSummary from '../components/OrderSummary.jsx';

const Step3Menu = () => {
    const { items, addItem, removeItem, updateQty, setStep, totals } = useOrder();
    const [activeCategory, setActiveCategory] = useState(MENU[0].category);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

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
        <div className="relative pb-24 max-w-2xl mx-auto">
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

            {/* Sticky Bottom Cart — rendered via portal to float above everything */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {totalItemsCount > 0 && !isExiting && (
                        <>
                            {/* Backdrop */}
                            <AnimatePresence>
                                {isCartOpen && (
                                    <motion.div
                                        key="backdrop"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        onClick={() => setIsCartOpen(false)}
                                        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                                    />
                                )}
                            </AnimatePresence>

                            {/* Bottom Sheet Panel — `layout` lets Framer animate its own height */}
                            <motion.div
                                layout
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{
                                    type: 'spring', damping: 35, stiffness: 200,
                                    layout: { type: 'spring', damping: 35, stiffness: 200, delay: 0.15 }
                                }}
                                style={{ originY: 1 }}
                                className={`fixed bottom-0 left-0 right-0 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-50 rounded-t-3xl border-t border-gray-100 flex flex-col ${isCartOpen ? 'max-h-[85vh]' : ''}`}
                            >
                                {/* Header / Drag Handle */}
                                <motion.div
                                    layout="position"
                                    onClick={() => setIsCartOpen(!isCartOpen)}
                                    className="pt-3 pb-4 px-6 cursor-pointer flex flex-col items-center border-b border-gray-100 flex-shrink-0"
                                >
                                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-3" />
                                    <div className="w-full max-w-2xl mx-auto flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                                <span>{totalItemsCount}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-dark">Tu Carrito</p>
                                                <p className="text-sm text-gray-500 font-medium">Total: ${totals.subtotal.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="text-primary font-semibold text-sm">
                                            {isCartOpen ? '▼ Cerrar' : '▲ Ver detalle'}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Cart Content — only fades; parent `layout` handles height change */}
                                <AnimatePresence initial={false}>
                                    {isCartOpen && (
                                        <motion.div
                                            key="cart-content"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-y-auto overflow-x-hidden w-full flex-1 min-h-0"
                                        >
                                            <div className="p-6 max-w-2xl mx-auto w-full">
                                                <OrderSummary
                                                    items={items}
                                                    totals={totals}
                                                    isEditable={true}
                                                    onUpdateQty={updateQty}
                                                    onRemoveItem={removeItem}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Checkout Button — plain div, no layout distortion */}
                                <div className="p-4 md:p-6 bg-white border-t border-gray-100 max-w-2xl mx-auto w-full flex-shrink-0">
                                    <button
                                        onClick={() => {
                                            setIsCartOpen(false);
                                            setIsExiting(true);
                                            setTimeout(() => setStep(4), 350);
                                        }}
                                        className="w-full h-14 bg-primary text-white text-lg font-bold rounded-full hover:bg-red-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center justify-between px-6"
                                    >
                                        <span>Ir a pagar</span>
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                                            ${totals.total.toFixed(2)}
                                        </span>
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default Step3Menu;
