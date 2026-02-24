export const SETTINGS = {
    restaurantName: 'Super Sushi',
    pickupHours: {
        open: '12:00',
        close: '21:00',
        intervalMinutes: 30   // slots cada 30 min
    },
    minDaysAdvance: 0,      // puede ordenar para hoy
    maxDaysAdvance: 7,      // máximo 7 días adelante
    currency: 'MXN',
    currencySymbol: '$',
    payment: {
        mode: 'full',        // 'full' | 'deposit'
        depositPercent: 10,  // solo aplica si mode === 'deposit'
    }
};
