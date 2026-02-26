import { klaviyoUpsertProfile } from './klaviyo-helper.js'

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end()

    const sig = req.headers['stripe-signature']

    try {
        // TODO: descomentar cuando tengas STRIPE_WEBHOOK_SECRET
        // const event = stripe.webhooks.constructEvent(
        //   req.body, sig, process.env.STRIPE_WEBHOOK_SECRET
        // )

        const event = req.body // placeholder sin verificación de firma

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object

            // TODO: actualizar orden en MongoDB
            // const client = new MongoClient(process.env.MONGODB_URI)
            // await client.connect()
            // await client.db('ssushipedidos').collection('orders').updateOne(
            //   { paymentIntentId: paymentIntent.id },
            //   { $set: { status: 'paid', paidAt: new Date() } }
            // )
            // await client.close()

            // TODO: enviar email de confirmación al cliente
            // await sendConfirmationEmail(paymentIntent.metadata)

            console.log('✅ Pago confirmado:', paymentIntent.id)

            // Captura en Klaviyo
            const apiKey = process.env.KLAVIYO_PRIVATE_KEY
            const listId = process.env.KLAVIYO_LIST_ID
            const { customerEmail, customerName, customerPhone } = paymentIntent.metadata

            if (apiKey && listId && customerEmail) {
                const profileData = {
                    type: 'profile',
                    attributes: {
                        email: customerEmail,
                        phone_number: customerPhone || null,
                        first_name: customerName || null,
                        properties: {
                            source: 'sushi-pedidos-online',
                            has_ordered: true
                        }
                    }
                }

                // Disparo en background
                klaviyoUpsertProfile(profileData, listId, apiKey)
                    .then(() => console.log('✅ Klaviyo lead confirmado en webhook:', customerEmail))
                    .catch(e => console.error('❌ Error Klaviyo webhook:', e.message))
            }
        }

        res.json({ received: true })

    } catch (err) {
        console.error('Webhook error:', err)
        res.status(400).json({ error: err.message })
    }
}
