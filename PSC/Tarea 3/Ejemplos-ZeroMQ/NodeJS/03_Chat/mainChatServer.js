// --------------------------------------------------------
// mainChatServer.js
// --------------------------------------------------------
//
// Implementación de un servidor de chat sencillo usando ZeroMQ
// (patrones REQ/REP y PUB/SUB) siguiendo el diseño validado
// en la Tarea 2 (clases Message, Chat, MessageStore).
//
// - Este proceso juega el papel de la clase "Chat" del diseño.
// - Los mensajes que gestionamos son equivalentes a la clase "Message":
//     { nickName: Text, message: Text, timestamp: Number }
// - La "MessageStore" abstracta se materializa aquí como un
//   array en memoria (en un solo proceso JS).
//
// Comunicación concreta:
//   * Socket REP en puerto 5555:
//       - recibe mensajes de los clientes (equivalente a POST /message)
//   * Socket PUB en puerto 8688:
//       - difunde los mensajes a todos los clientes (equivalente a GET /message + push)
//
// Relación diseño vs realidad:
//   - En el diseño REST, el servidor almacena mensajes y los entrega
//     cuando los clientes hacen "polling".
//   - En esta implementación ZeroMQ, el servidor recibe un mensaje
//     y lo reenvía inmediatamente por el canal PUB a todos los
//     clientes conectados (no hay polling, sino difusión push).
//
// --------------------------------------------------------

// ....................................................
// importamos biblioteca zeromq
//
var zmq = require('zeromq')

// ....................................................
// estructura interna equivalente a "MessageStore"
//
var mensajes = [] // aquí almacenamos el histórico (solo para traza)

// ....................................................
// sockets del servidor:
//
//  - receptorMensajes: REP -> recibe mensajes de los clientes
//  - difusorMensajes:  PUB -> difunde mensajes a todos los clientes
//
var receptorMensajes = zmq.socket('rep')
var difusorMensajes  = zmq.socket('pub')

// ....................................................
// lógica principal del servidor de chat
//
// formato de mensajes que esperamos por REP:
//   CHAT <nickName> <timestampMs> <texto...>
//
// formato de mensajes que difundimos por PUB:
//   MSG <nickName> <timestampMs> <texto...>
//
receptorMensajes.on('message', function(mensajeCrudo) {
	var texto = mensajeCrudo.toString()
	console.log("[Servidor] Recibido por REP:", texto)

	var partes = texto.split(" ")

	if (partes.length < 4 || partes[0] !== "CHAT") {
		console.log("[Servidor] Formato no válido, ignorado.")
		receptorMensajes.send("ERROR formato")
		return
	}

	// extraemos campos
	var nick = partes[1]
	var timestampStr = partes[2]
	var timestampMs = parseFloat(timestampStr)
	if (isNaN(timestampMs)) {
		timestampMs = Date.now()
	}

	// el resto de la línea es el texto del mensaje
	var textoMensaje = partes.slice(3).join(" ")

	// creamos el objeto "Message" equivalente al diseño
	var mensaje = {
		nickName: nick,
		message: textoMensaje,
		timestamp: timestampMs
	}

	// guardamos en la estructura interna (equivalente a MessageStore.add)
	mensajes.push(mensaje)

	console.log("[Servidor] Almacenado mensaje de", nick, ":", textoMensaje)

	// difundir el mensaje a todos los clientes
	var mensajeDifusion = "MSG " + nick + " " + timestampMs + " " + textoMensaje
	console.log("[Servidor] Difundiendo:", mensajeDifusion)
	difusorMensajes.send(mensajeDifusion)

	// respondemos al cliente (equivalente a devolver 201 / ACK)
	receptorMensajes.send("ACK " + timestampMs)
})

// ....................................................
// gestión de señales (Ctrl+C)
//
process.on('SIGINT', function() {
	console.log("\n[Servidor] SIGINT capturada. Cerrando sockets...")
	receptorMensajes.close()
	difusorMensajes.close()
	console.log("[Servidor] Hasta luego!")
	process.exit(0)
})

// ....................................................
// bind de los sockets
//
receptorMensajes.bind('tcp://*:5555', function(err) {
	if (err) {
		console.log("[Servidor] Error al hacer bind REP:", err)
	} else {
		console.log("[Servidor] REP escuchando en puerto 5555 (clientes -> servidor)")
	}
})

difusorMensajes.bind('tcp://*:8688', function(err) {
	if (err) {
		console.log("[Servidor] Error al hacer bind PUB:", err)
	} else {
		console.log("[Servidor] PUB difundiendo en puerto 8688 (servidor -> clientes)")
	}
})

// --------------------------------------------------------
// --------------------------------------------------------

