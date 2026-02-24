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
        }

        res.json({ received: true })

    } catch (err) {
        console.error('Webhook error:', err)
        res.status(400).json({ error: err.message })
    }
}
