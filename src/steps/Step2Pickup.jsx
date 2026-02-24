import React, { useState, useEffect } from 'react';
import { useOrder } from '../hooks/useOrder.jsx';
import { SETTINGS } from '../config/settings.js';
import StepIndicator from '../components/StepIndicator.jsx';

const Step2Pickup = () => {
    const { pickup, setPickup, setStep } = useOrder();

    // Initialize with form data or today's date if not set
    const getTodayFormatted = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getMaxDateFormatted = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + SETTINGS.maxDaysAdvance);
        return maxDate.toISOString().split('T')[0];
    };

    const [date, setDate] = useState(pickup.date || getTodayFormatted());
    const [time, setTime] = useState(pickup.time || '');
    const [timeSlots, setTimeSlots] = useState([]);
    const [error, setError] = useState('');

    // Generate time slots based on settings
    useEffect(() => {
        const slots = [];
        const { open, close, intervalMinutes } = SETTINGS.pickupHours;

        // Parse open time
        const [openHour, openMin] = open.split(':').map(Number);
        // Parse close time
        const [closeHour, closeMin] = close.split(':').map(Number);

        let currentHour = openHour;
        let currentMin = openMin;

        while (currentHour < closeHour || (currentHour === closeHour && currentMin <= closeMin)) {
            const formattedHour = currentHour.toString().padStart(2, '0');
            const formattedMin = currentMin.toString().padStart(2, '0');
            slots.push(`${formattedHour}:${formattedMin}`);

            currentMin += intervalMinutes;
            if (currentMin >= 60) {
                currentHour += Math.floor(currentMin / 60);
                currentMin = currentMin % 60;
            }
        }

        setTimeSlots(slots);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!date || !time) {
            setError('Por favor selecciona una fecha y hora para recoger tu pedido');
            return;
        }

        setPickup({ date, time });
        setStep(3);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 max-w-[480px] mx-auto border border-gray-100">
            <StepIndicator currentStep={2} />
            <h2 className="text-xl font-bold text-dark mb-2 mt-2">Cuándo recoges</h2>
            <p className="text-gray-500 mb-6 text-sm">Selecciona la fecha y hora para tu pedido</p>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                        Ver fechas disponibles
                    </label>
                    <input
                        id="date"
                        type="date"
                        value={date}
                        min={getTodayFormatted()}
                        max={getMaxDateFormatted()}
                        onChange={(e) => {
                            setDate(e.target.value);
                            setError('');
                        }}
                        className="w-full h-12 px-4 rounded-full border border-gray-300 focus:border-primary focus:ring-primary focus:outline-none focus:ring-1 transition-colors"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Selecciona el horario
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {timeSlots.map((slot) => (
                            <button
                                key={slot}
                                type="button"
                                onClick={() => {
                                    setTime(slot);
                                    setError('');
                                }}
                                className={`py-2 px-1 text-sm font-medium rounded-lg border transition-all ${time === slot
                                    ? 'bg-primary border-primary text-white shadow-sm'
                                    : 'border-gray-200 text-dark hover:border-primary hover:text-primary'
                                    }`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="h-12 px-6 rounded-full border border-gray-300 text-dark font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                    >
                        ← Atrás
                    </button>

                    <button
                        type="submit"
                        className="h-12 px-6 bg-primary text-white font-semibold rounded-full hover:bg-red-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Siguiente: menú →
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Step2Pickup;
