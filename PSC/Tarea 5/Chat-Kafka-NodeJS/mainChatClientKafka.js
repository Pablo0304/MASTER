// --------------------------------------------------------
// mainChatClientKafka.js
// --------------------------------------------------------
//
// Cliente/participante del chat usando Kafka como middleware.
//
// Rol en el diseño (Tarea 2):
//   - Equivalente a la clase "Participant" + "Communication".
//   - Mantiene un nick.
//   - Cuando el usuario escribe un mensaje:
//       -> se construye un "Message"
//       -> se envía al servidor a través de Kafka.
//   - Cuando llega un mensaje desde el servidor:
//       -> se muestra por pantalla (message_arrived()).
//
// Topología Kafka (coherente con el servidor):
//   - El cliente produce mensajes en el topic "chat-input".
//   - El cliente consume mensajes del topic "chat-broadcast".
//
// Para que cada cliente reciba TODOS los mensajes (también los
// suyos propios), cada participante tiene su propio grupo de
// consumo (groupId único basado en el nick).
//
// --------------------------------------------------------

const { Kafka } = require('kafkajs')
const readline = require('readline')

// ....................................................
// parámetros: nick del usuario
//
const NICK = process.argv[2] ? process.argv[2] : "anonimo"

console.log("Arrancando cliente de chat Kafka. Nick:", NICK)

// ....................................................
// configuración de Kafka
//
const kafka = new Kafka({
	clientId: `chat-client-${NICK}`,
	brokers: ['localhost:9094']
})

// grupo de consumo único por cliente para recibir todos los mensajes
const consumer = kafka.consumer({ groupId: `chat-group-${NICK}` })
const producer = kafka.producer()

// ....................................................
// interfaz de usuario (consola)
//
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: `(${NICK}) > `
})

// ....................................................
// función principal
//
async function main() {
	// conectamos producer y consumer
	await producer.connect()
	await consumer.connect()

	// suscribir al topic de difusión
	await consumer.subscribe({ topic: 'chat-broadcast', fromBeginning: false })

	// arrancar bucle de consumo
	await consumer.run({
		eachMessage: async ({ topic, partition, message }) => {
			try {
				const valueStr = message.value.toString()
				const msgObj = JSON.parse(valueStr)

				const nickRemitente = msgObj.nickName || 'noname'
				const texto = msgObj.message || ''

				// simulamos la callback message_arrived() del diseño:
				process.stdout.write(`\n[${nickRemitente}]: ${texto}\n`)
				rl.prompt()
			} catch (err) {
				console.error("[Cliente] Error procesando mensaje recibido:", err)
			}
		}
	})

	// arrancar la UI
	rl.prompt()

	rl.on('line', async (line) => {
		const texto = line.trim()
		if (!texto) {
			rl.prompt()
			return
		}

		// construimos la estructura "Message" del diseño:
		// { nickName: Text, message: Text, timestamp: Number }
		const msgObj = {
			nickName: NICK,
			message: texto,
			timestamp: Date.now()
		}

		try {
			await producer.send({
				topic: 'chat-input',
				messages: [{ value: JSON.stringify(msgObj) }]
			})
		} catch (err) {
			console.error("[Cliente] Error enviando mensaje:", err)
		}

		rl.prompt()
	})

	rl.on('close', async () => {
		console.log(`\n[Cliente ${NICK}] Saliendo del chat...`)
		await shutdown()
	})
}

// ....................................................
// apagado limpio
//
async function shutdown() {
	try {
		await consumer.disconnect()
		await producer.disconnect()
	} catch (err) {
		console.error("[Cliente] Error al desconectar:", err)
	}
	process.exit(0)
}

process.on('SIGINT', async () => {
	console.log(`\n[Cliente ${NICK}] SIGINT capturada.`)
	await shutdown()
})

// ....................................................
// lanzar main()
//
main().catch(err => {
	console.error("[Cliente] Error en main:", err)
	process.exit(1)
})

// --------------------------------------------------------
// --------------------------------------------------------

