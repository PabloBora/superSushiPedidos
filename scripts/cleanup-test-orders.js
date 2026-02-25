import 'dotenv/config'
import { MongoClient } from 'mongodb'
import readline from 'readline'

const FILTER = { paymentIntentId: /^test_/ }

async function main() {
    const uri = process.env.MONGODB_URI
    if (!uri) {
        console.error('❌ MONGODB_URI no está definido en .env')
        process.exit(1)
    }

    const client = new MongoClient(uri)

    try {
        await client.connect()
        const collection = client.db('ssushipedidos').collection('orders')

        // Contar documentos que se borrarían
        const count = await collection.countDocuments(FILTER)

        if (count === 0) {
            console.log('✅ No hay pedidos de prueba (paymentIntentId: test_*) en la colección.')
            return
        }

        console.log(`\n⚠️  Se encontraron ${count} pedido(s) de prueba con paymentIntentId iniciando en 'test_'.`)
        console.log('   Colección: ssushipedidos.orders')
        console.log('   Filtro:    { paymentIntentId: /^test_/ }\n')

        // Pedir confirmación
        const confirmed = await askConfirmation(`¿Deseas eliminar estos ${count} documento(s)? (escribe "si" para confirmar): `)

        if (!confirmed) {
            console.log('🚫 Operación cancelada. No se eliminó nada.')
            return
        }

        // Borrar
        const result = await collection.deleteMany(FILTER)
        console.log(`\n✅ ${result.deletedCount} pedido(s) de prueba eliminado(s) correctamente.`)

    } finally {
        await client.close()
        console.log('🔌 Conexión cerrada.')
    }
}

function askConfirmation(question) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
        rl.question(question, (answer) => {
            rl.close()
            resolve(answer.trim().toLowerCase() === 'si')
        })
    })
}

main().catch((err) => {
    console.error('❌ Error inesperado:', err.message)
    process.exit(1)
})
