import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

export const createOrder = async (orderData) => {
    const { data } = await axios.post(`${BASE}/api/orders`, orderData)
    return data  // retorna { clientSecret }
}

export const captureAbandonedLead = async (contact) => {
    // Se llama cuando el usuario llena Step1 pero no completa el pedido
    // TODO: conectar a Klaviyo directamente desde frontend
    // Por ahora solo log
    console.log('📬 Lead abandonado capturado:', contact.email)
}
