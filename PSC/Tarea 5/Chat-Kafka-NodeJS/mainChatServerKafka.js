// --------------------------------------------------------
// mainChatServerKafka.js
// --------------------------------------------------------
//
// Servidor de chat usando Kafka como middleware de mensajes.
//
// Rol en el diseño (Tarea 2):
//   - Equivalente a la clase "Chat" + "MessageStore".
//   - Recibe mensajes de los participantes.
//   - Los almacena en memoria.
//   - Los redistribuye a todos los clientes.
//
// Diferencia principal con la versión ZeroMQ (Tarea 3):
//   - Antes: se usaban sockets REQ/REP y PUB/SUB directamente.
//   - Ahora: la comunicación pasa por Kafka (topics).
//
// Topología Kafka:
//   - Topic de entrada:   "chat-input"     (clientes -> servidor)
//   - Topic de difusión:  "chat-broadcast" (servidor -> clientes)
//
//   Los clientes:
//     - producen en "chat-input"
//     - consumen de "chat-broadcast"
//
//   El servidor:
//     - consume de "chat-input"
//     - produce en "chat-broadcast"
//
// Los mensajes se codifican como JSON, con la misma estructura
// lógica que "Message" del diseño:
//   { nickName: Text, message: Text, timestamp: Number }
//
// --------------------------------------------------------

const { Kafka } = require('kafkajs')

// ....................................................
// configuración de conexión a Kafka
//
// Se asume que el broker Kafka está levantado con el
// docker-compose proporcionado, exponiendo:
//   localhost:9094
//
const kafka = new Kafka({
	clientId: 'chat-server',
	brokers: ['localhost:9094']
})

const consumer = kafka.consumer({ groupId: 'chat-server-group' })
const producer = kafka.producer()

// ....................................................
// "MessageStore" en memoria (histórico de mensajes)
//
const mensajes = []

// ....................................................
// función principal asíncrona
//
async function main() {
	console.log("Servidor de chat (Kafka) arrancando...")

	// conectar producer y consumer
	await producer.connect()
	await consumer.connect()

	// asegurarnos de que los topics existen (creación idempotente)
	const admin = kafka.admin()
	await admin.connect()
	await admin.createTopics({
		topics: [
			{ topic: 'chat-input', numPartitions: 1, replicationFactor: 1 },
			{ topic: 'chat-broadcast', numPartitions: 1, replicationFactor: 1 }
		],
		waitForLeaders: true
	})
	await admin.disconnect()

	console.log("Topics 'chat-input' y 'chat-broadcast' preparados.")

	// suscribir al topic de entrada
	await consumer.subscribe({ topic: 'chat-input', fromBeginning: false })

	console.log("Servidor suscrito a 'chat-input'. Esperando mensajes...")

	// bucle de consumo
	await consumer.run({
		eachMessage: async ({ topic, partition, message }) => {
			try {
				const valueStr = message.value.toString()
				const msgObj = JSON.parse(valueStr)

				// se espera un objeto tipo:
				// { nickName: string, message: string, timestamp: number }
				const nickName = msgObj.nickName || 'noname'
				const texto = msgObj.message || ''
				const ts = msgObj.timestamp || Date.now()

				console.log(`\n[Servidor] Mensaje recibido de ${nickName}: ${texto}`)

				// guardar en el "MessageStore" en memoria
				mensajes.push({
					nickName: nickName,
					message: texto,
					timestamp: ts
				})

				// reenviar a todos los clientes por el topic de difusión
				const outgoing = JSON.stringify({
					nickName: nickName,
					message: texto,
					timestamp: ts
				})

				await producer.send({
					topic: 'chat-broadcast',
					messages: [{ value: outgoing }]
				})

				console.log(`[Servidor] Difundido a 'chat-broadcast': ${outgoing}`)
			} catch (err) {
				console.error("[Servidor] Error procesando mensaje:", err)
			}
		}
	})
}

// ....................................................
// gestión de señales para apagado limpio
//
async function shutdown() {
	console.log("\n[Servidor] Apagando servidor de chat Kafka...")
	try {
		await consumer.disconnect()
		await producer.disconnect()
	} catch (err) {
		console.error("[Servidor] Error al desconectar:", err)
	}
	process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

// ....................................................
// lanzar main()
//
main().catch(err => {
	console.error("[Servidor] Error en main:", err)
	process.exit(1)
})

// --------------------------------------------------------
// --------------------------------------------------------

