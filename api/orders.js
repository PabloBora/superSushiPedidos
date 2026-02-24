import Stripe from 'stripe'
import { MongoClient } from 'mongodb'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { contact, pickup, items, totals } = req.body

            // 1. Calcular monto según mode
            const settings = { payment: { mode: 'full', depositPercent: 10 } }
            const amount = settings.payment.mode === 'deposit'
                ? Math.round(totals.total * settings.payment.depositPercent / 100 * 100)
                : Math.round(totals.total * 100)  // Stripe usa centavos

            // 2. Crear PaymentIntent en Stripe
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency: 'mxn',
                metadata: {
                    customerEmail: contact.email,
                    customerName: contact.name,
                    pickupDate: pickup.date,
                    pickupTime: pickup.time
                }
            })

            // 3. Guardar orden en MongoDB como 'pending'
            const client = new MongoClient(process.env.MONGODB_URI)
            await client.connect()
            const db = client.db('ssushipedidos')
            await db.collection('orders').insertOne({
                contact,
                pickup,
                items,
                totals,
                paymentIntentId: paymentIntent.id,
                status: 'pending',
                createdAt: new Date()
            })
            await client.close()

            // Notificación al restaurante
            await notifyRestaurant({ contact, pickup, items, totals })

            // Captura en Klaviyo
            await addToKlaviyo(contact)

            // 4. Retornar clientSecret al frontend
            res.json({ clientSecret: paymentIntent.client_secret })

        } catch (err) {
            console.error(err)
            res.status(500).json({ error: err.message })
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}

async function notifyRestaurant({ contact, pickup, items, totals }) {
    // TODO: reemplazar con SendGrid o el canal que defina Valde
    // Opciones: SendGrid email, Slack webhook, módulo ERP
    console.log('📧 Notificación al restaurante:', {
        cliente: contact.name,
        pickup: `${pickup.date} ${pickup.time}`,
        total: totals.total,
        items: items.map(i => `${i.qty}x ${i.name}`).join(', ')
    })
    // Cuando esté listo:
    // await fetch(process.env.SLACK_WEBHOOK_URL, { 
    //   method: 'POST', 
    //   body: JSON.stringify({ text: `Nuevo pedido de ${contact.name}...` })
    // })
}

async function addToKlaviyo(contact) {
    // TODO: reemplazar con llamada real a Klaviyo API
    console.log('📬 Klaviyo lead capturado:', contact.email)
    // Cuando esté listo:
    // await fetch('https://a.klaviyo.com/api/profiles/', {
    //   method: 'POST',
    //   headers: { 
    //     Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     data: {
    //       type: 'profile',
    //       attributes: {
    //         email: contact.email,
    //         phone_number: contact.phone,
    //         first_name: contact.name,
    //         properties: { source: 'sushi-pedidos-online' }
    //       },
    //       relationships: {
    //         lists: { data: [{ type: 'list', id: process.env.KLAVIYO_LIST_ID }] }
    //       }
    //     }
    //   })
    // })
}
