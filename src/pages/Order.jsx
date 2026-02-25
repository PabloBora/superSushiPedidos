import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderProvider, useOrder } from '../hooks/useOrder.jsx';

import Step1Contact from '../steps/Step1Contact.jsx';
import Step2Pickup from '../steps/Step2Pickup.jsx';
import Step3Menu from '../steps/Step3Menu.jsx';
import Step4Summary from '../steps/Step4Summary.jsx';

const StepContent = () => {
    const { step } = useOrder();

    const renderStep = () => {
        switch (step) {
            case 1: return <Step1Contact key="step1" />;
            case 2: return <Step2Pickup key="step2" />;
            case 3: return <Step3Menu key="step3" />;
            case 4: return <Step4Summary key="step4" />;
            default: return <Step1Contact key="stepdefault" />;
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8">
            <div className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.25 }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

const Order = () => {
    return (
        <OrderProvider>
            <div className="order-bg">
                <StepContent />
            </div>
        </OrderProvider>
    );
};

export default Order;
