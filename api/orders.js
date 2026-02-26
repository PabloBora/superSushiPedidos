import Stripe from 'stripe'
import { MongoClient } from 'mongodb'
import { randomUUID } from 'crypto'
import { sendConfirmationEmail } from './email.js'
import { klaviyoUpsertProfile } from './klaviyo-helper.js'

const TEST_MODE = process.env.TEST_MODE === 'true'

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { contact, pickup, items, totals } = req.body

            const client = new MongoClient(process.env.MONGODB_URI)
            await client.connect()
            const collection = client.db('ssushipedidos').collection('orders')

            if (TEST_MODE) {
                // ── MODO DE PRUEBA ────────────────────────────────────────
                // Guarda en MongoDB con status 'paid', sin llamar a Stripe.
                const paymentIntentId = 'test_' + Date.now()
                const managerToken = randomUUID()

                const order = {
                    contact,
                    pickup,
                    items,
                    totals,
                    paymentIntentId,
                    managerToken,
                    status: 'paid',
                    createdAt: new Date(),
                    paidAt: new Date()
                }

                await collection.insertOne(order)

                await client.close()

                console.log('🧪 TEST_MODE: orden guardada en MongoDB sin Stripe', { paymentIntentId })

                await notifyRestaurant({ contact, pickup, items, totals })
                await sendConfirmationEmail({ order: { contact, pickup, items, totals }, token: managerToken })
                await addToKlaviyo(contact)

                return res.json({ clientSecret: 'test_mode', testMode: true })
            }

            // ── PRODUCCIÓN ────────────────────────────────────────────────
            // Inicializar Stripe solo en producción (STRIPE_SECRET_KEY requerida)
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

            // 1. Calcular monto
            const settings = { payment: { mode: 'full', depositPercent: 10 } }
            const amount = settings.payment.mode === 'deposit'
                ? Math.round(totals.total * settings.payment.depositPercent / 100 * 100)
                : Math.round(totals.total * 100)  // Stripe usa centavos

            // 2. Guardar en MongoDB PRIMERO como 'pending' (antes de Stripe)
            const managerToken = randomUUID()
            const doc = {
                contact,
                pickup,
                items,
                totals,
                paymentIntentId: null,
                managerToken,
                status: 'pending',
                createdAt: new Date(),
                paidAt: null
            }
            const { insertedId } = await collection.insertOne(doc)

            // 3. Crear PaymentIntent en Stripe
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency: 'mxn',
                metadata: {
                    orderId: insertedId.toString(),
                    customerEmail: contact.email,
                    customerName: contact.name,
                    customerPhone: contact.phone || '',
                    pickupDate: pickup.date,
                    pickupTime: pickup.time
                }
            })

            // 4. Actualizar el documento con el paymentIntentId real
            await collection.updateOne(
                { _id: insertedId },
                { $set: { paymentIntentId: paymentIntent.id } }
            )

            await client.close()

            // TODO PRODUCCIÓN: mover notifyRestaurant() y 
            // sendConfirmationEmail() a api/webhook.js dentro 
            // del handler payment_intent.succeeded para garantizar 
            // que solo se ejecutan cuando el pago es confirmado por Stripe.
            await notifyRestaurant({ contact, pickup, items, totals })
            await sendConfirmationEmail({ order: { contact, pickup, items, totals }, token: managerToken })

            // Captura en Klaviyo movida al webhook para producción

            // 5. Retornar clientSecret al frontend
            return res.json({ clientSecret: paymentIntent.client_secret })

        } catch (err) {
            console.error(err)
            res.status(500).json({ error: err.message })
        }
    } else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method Not Allowed')
    }
}

async function notifyRestaurant({ contact, pickup, items, totals }) {
    const erpWebhookUrl = process.env.ERP_WEBHOOK_URL
    const secret = process.env.SUSHI_WEBHOOK_SECRET

    if (!erpWebhookUrl || !secret) {
        console.log('⚠️ ERP_WEBHOOK_URL o SUSHI_WEBHOOK_SECRET no configurados')
        return
    }

    try {
        await fetch(erpWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-sushi-secret': secret
            },
            body: JSON.stringify({ contact, pickup, items, totals })
        })
        console.log('✅ Webhook ERP notificado')
    } catch (err) {
        console.error('❌ Error notificando al ERP:', err.message)
    }
}

async function addToKlaviyo(contact) {
    const apiKey = process.env.KLAVIYO_PRIVATE_KEY
    const listId = process.env.KLAVIYO_LIST_ID

    if (!apiKey || !listId) {
        console.warn('⚠️ KLAVIYO_PRIVATE_KEY o KLAVIYO_LIST_ID no configurados. Lead ignorado:', contact.email)
        return
    }

    try {
        const profileData = {
            type: 'profile',
            attributes: {
                email: contact.email,
                phone_number: contact.phone || null,
                first_name: contact.name || null,
                properties: {
                    source: 'sushi-pedidos-online',
                    has_ordered: true
                }
            }
        }

        await klaviyoUpsertProfile(profileData, listId, apiKey)

        console.log('✅ Klaviyo lead capturado y agregado a la lista:', contact.email)
    } catch (err) {
        console.error('❌ ERROR inesperado en addToKlaviyo:', err.message)
    }
}
