import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

export const createOrder = async (orderData) => {
    const { data } = await axios.post(`${BASE}/api/orders`, orderData)
    return data  // retorna { clientSecret }
}

export const captureAbandonedLead = async (contact) => {
    try {
        await axios.post(`${BASE}/api/klaviyo-lead`, contact)
    } catch (err) {
        console.error('Error enviando lead abandonado:', err)
    }
}
