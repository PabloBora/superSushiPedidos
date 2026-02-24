import { createContext, useContext, useState, useMemo } from 'react';

const initialState = {
    step: 1,
    contact: {
        name: '',
        phone: '',
        email: ''
    },
    pickup: {
        date: '',
        time: ''
    },
    items: []
};

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
    const [step, setStep] = useState(initialState.step);
    const [contact, setContact] = useState(initialState.contact);
    const [pickup, setPickup] = useState(initialState.pickup);
    const [items, setItems] = useState(initialState.items);

    const totals = useMemo(() => {
        const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const tax = subtotal * 0.16; // 16% IVA México
        const total = subtotal + tax;
        return { subtotal, tax, total };
    }, [items]);

    const addItem = (item) => {
        setItems((currentItems) => {
            // Transform item if it has a chosen variant
            const cartItem = item.variant ? {
                ...item,
                id: item.variant.id,
                name: `${item.name} — ${item.variant.label}`,
                price: item.variant.price
            } : item;

            // Remove temporary variant key to keep cart model clean
            if (cartItem.variant) {
                delete cartItem.variant;
            }

            const existing = currentItems.find(i => i.id === cartItem.id);
            if (existing) {
                return currentItems.map(i =>
                    i.id === cartItem.id ? { ...i, qty: i.qty + (cartItem.qty || 1) } : i
                );
            }
            return [...currentItems, { ...cartItem, qty: cartItem.qty || 1 }];
        });
    };

    const removeItem = (id) => {
        setItems((currentItems) => currentItems.filter(i => i.id !== id));
    };

    const updateQty = (id, qty) => {
        setItems((currentItems) =>
            currentItems.map(i =>
                i.id === id ? { ...i, qty: Math.max(1, qty) } : i
            )
        );
    };

    const clearOrder = () => {
        setStep(initialState.step);
        setContact(initialState.contact);
        setPickup(initialState.pickup);
        setItems(initialState.items);
    };

    const value = {
        step,
        setStep,
        contact,
        setContact,
        pickup,
        setPickup,
        items,
        totals,
        addItem,
        removeItem,
        updateQty,
        clearOrder
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrder = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
};
