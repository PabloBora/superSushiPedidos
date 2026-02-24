import React from 'react';

const StepIndicator = ({ currentStep, labels = ['Contacto', 'Recoger', 'Menú', 'Pago'] }) => {
    const progressPercentage = (currentStep / 4) * 100;
    const currentLabel = labels[currentStep - 1] || '';

    return (
        <div className="w-full mb-8">
            <div className="flex items-center mb-3">
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold flex items-center tracking-wide">
                    <span className="mr-2 text-[10px]">●</span>
                    PASO {currentStep} DE 4 - {currentLabel.toUpperCase()}
                </div>
            </div>

            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
        </div>
    );
};

export default StepIndicator;
