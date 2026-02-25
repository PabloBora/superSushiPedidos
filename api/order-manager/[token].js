import { MongoClient } from 'mongodb'

const PICKUP_CUTOFF_HOURS = 30
const MONTERREY_TZ = 'America/Monterrey'

function getMongoCollection() {
    const client = new MongoClient(process.env.MONGODB_URI)
    return { client, collection: () => client.db('ssushipedidos').collection('orders') }
}

// Calcula cuántas horas faltan para el pickup (en timezone Monterrey)
function hoursUntilPickup(pickupDate, pickupTime) {
    const pickupStr = `${pickupDate}T${pickupTime}:00`

    // Hora actual en Monterrey
    const nowMtyStr = new Date().toLocaleString('en-CA', {
        timeZone: MONTERREY_TZ,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
    }).replace(/(\d+)\/(\d+)\/(\d+),\s/, '$3-$1-$2T')

    const nowMty = new Date(nowMtyStr)
    const pickup = new Date(pickupStr)
    return (pickup - nowMty) / (1000 * 60 * 60)
}

export default async function handler(req, res) {
    const { token } = req.query
    const isPickupRoute = req.url && req.url.includes('/pickup')

    // ── GET /api/order-manager/:token ──────────────────────────────────────
    if (req.method === 'GET' && !isPickupRoute) {
        const { client, collection } = getMongoCollection()
        try {
            await client.connect()
            const order = await collection().findOne(
                { managerToken: token },
                { projection: { paymentIntentId: 0, managerToken: 0 } }
            )
            if (!order) return res.status(404).json({ error: 'Pedido no encontrado' })

            const hours = hoursUntilPickup(order.pickup.date, order.pickup.time)
            return res.json({
                ...order,
                canEditPickup: hours > PICKUP_CUTOFF_HOURS,
                hoursUntilPickup: Math.round(hours)
            })
        } finally {
            await client.close()
        }
    }

    // ── PATCH /api/order-manager/:token/pickup ──────────────────────────────
    if (req.method === 'PATCH' && isPickupRoute) {
        const { date, time } = req.body
        if (!date || !time) return res.status(400).json({ error: 'Se requieren date y time' })

        const { client, collection } = getMongoCollection()
        try {
            await client.connect()
            const order = await collection().findOne({ managerToken: token })
            if (!order) return res.status(404).json({ error: 'Pedido no encontrado' })

            const hours = hoursUntilPickup(order.pickup.date, order.pickup.time)
            if (hours <= PICKUP_CUTOFF_HOURS) {
                return res.status(403).json({
                    error: `Ya no es posible modificar el pedido. Solo se permiten cambios con más de ${PICKUP_CUTOFF_HOURS} horas de anticipación.`
                })
            }

            await collection().updateOne(
                { managerToken: token },
                { $set: { 'pickup.date': date, 'pickup.time': time, updatedAt: new Date() } }
            )

            const updated = await collection().findOne(
                { managerToken: token },
                { projection: { paymentIntentId: 0, managerToken: 0 } }
            )
            const newHours = hoursUntilPickup(updated.pickup.date, updated.pickup.time)
            return res.json({
                ...updated,
                canEditPickup: newHours > PICKUP_CUTOFF_HOURS,
                hoursUntilPickup: Math.round(newHours)
            })
        } finally {
            await client.close()
        }
    }

    res.setHeader('Allow', 'GET, PATCH')
    res.status(405).end('Method Not Allowed')
}
