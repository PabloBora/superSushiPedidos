import { klaviyoUpsertProfile } from './klaviyo-helper.js'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return res.status(405).end('Method Not Allowed')
    }

    const { email, name, phone } = req.body

    if (!email) {
        return res.status(400).json({ error: 'Email is required' })
    }

    const apiKey = process.env.KLAVIYO_PRIVATE_KEY
    const listId = process.env.KLAVIYO_LIST_ID

    if (!apiKey || !listId) {
        console.warn('⚠️ KLAVIYO_PRIVATE_KEY o KLAVIYO_LIST_ID no configurados. Lead abandonado ignorado:', email)
        // Devolvemos 200 para no hacer fallar el frontend
        return res.json({ success: true, warning: 'Klaviyo config missing' })
    }

    try {
        const profileData = {
            type: 'profile',
            attributes: {
                email: email,
                phone_number: phone || null,
                first_name: name || null,
                properties: {
                    source: 'sushi-pedidos-abandoned',
                    has_ordered: false
                }
            }
        }

        await klaviyoUpsertProfile(profileData, listId, apiKey)

        console.log('✅ Lead abandonado guardado en Klaviyo y agregado a la lista:', email)
        return res.json({ success: true })

    } catch (err) {
        console.error('❌ Excepción al contactar Klaviyo (Lead):', err.message)
        // Retornamos 200 en fallback para que no existan crash issues client-side si esto falla.
        return res.status(200).json({ success: false, error: err.message })
    }
}
