// --------------------------------------------------------
// mainChatClient.js
// --------------------------------------------------------
//
// Proceso cliente/participante del chat usando ZeroMQ.
//
// Este proceso representa el papel de la clase "Participant"
// del diseño de la Tarea 2:
//   - tiene un nickname
//   - cuando el usuario escribe una línea, se genera un "Message"
//     y se envía al servidor
//   - cuando llega un mensaje desde el servidor, se muestra en pantalla
//
// Comunicación concreta:
//   * Socket REQ -> envía al servidor mensajes tipo "CHAT ..."
//   * Socket SUB -> recibe del servidor mensajes "MSG ..."
//
// Diferencias respecto al diseño REST:
//   - En el diseño original, el cliente hacía polling cada 10s con
//     GET /message. Aquí, gracias al patrón PUB/SUB de ZeroMQ, los
//     mensajes llegan de forma "push" sin necesidad de polling.
//
// --------------------------------------------------------

// ....................................................
// importamos bibliotecas
//
var zmq = require('zeromq')
var readline = require('readline')

// ....................................................
// parámetros de ejecución
//
//   node mainChatClient.js [NICK]
//
var NICK = (process.argv[2] ? process.argv[2] : "anonimo")

console.log("Arrancando cliente de chat. Nick:", NICK)

// ....................................................
// sockets del cliente
//
//   emisorMensajes: REQ -> al servidor (puerto 5555)
//   receptorMensajes: SUB -> del servidor (puerto 8688)
//
var emisorMensajes = zmq.socket('req')
var receptorMensajes = zmq.socket('sub')

// sin filtro: recibimos todos los mensajes difundidos
receptorMensajes.subscribe("")

// ....................................................
// conexión de sockets
//
emisorMensajes.connect("tcp://localhost:5555")
console.log("Cliente", NICK, "conectado (REQ) a puerto 5555")

receptorMensajes.connect("tcp://localhost:8688")
console.log("Cliente", NICK, "suscrito (SUB) a puerto 8688")

// ....................................................
// recepción de mensajes desde el servidor (PUB/SUB)
//
receptorMensajes.on("message", function(mensajeCrudo) {
	var texto = mensajeCrudo.toString()
	var partes = texto.split(" ")

	if (partes[0] !== "MSG" || partes.length < 4) {
		console.log("[Cliente", NICK, "] Mensaje no reconocido:", texto)
		return
	}

	var nickRemitente = partes[1]
	// var timestampMs = parseFloat(partes[2])  // no lo usamos, solo para traza si se quiere
	var cuerpo = partes.slice(3).join(" ")

	// mostramos el mensaje en formato parecido al del diseño original
	process.stdout.write("\n[" + nickRemitente + "]: " + cuerpo + "\n")
	// reimprimir prompt para que la experiencia sea cómoda
	process.stdout.write("(" + NICK + ") > ")
})

// ....................................................
// recepción de respuestas a nuestros envíos (REQ/REP)
//
emisorMensajes.on("message", function(mensajeCrudo) {
	var texto = mensajeCrudo.toString()
	// se espera algo tipo "ACK <timestamp>" o "ERROR ..."
	console.log("\n[Cliente", NICK, "] Respuesta servidor:", texto)
	process.stdout.write("(" + NICK + ") > ")
})

// ....................................................
// interfaz de usuario por línea de comandos
//
var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: "(" + NICK + ") > "
})

rl.prompt()

rl.on('line', function(linea) {
	var texto = linea.trim()
	if (texto.length === 0) {
		rl.prompt()
		return
	}

	// creamos el "Message" equivalente del diseño:
	// { nickName: Text, message: Text, timestamp: Number }
	var timestampMs = Date.now()

	// codificamos en nuestro protocolo textual:
	//   CHAT <nickName> <timestampMs> <texto...>
	var mensaje = "CHAT " + NICK + " " + timestampMs + " " + texto

	// enviamos al servidor
	emisorMensajes.send(mensaje)

	rl.prompt()
})

rl.on('close', function() {
	console.log("\n[Cliente", NICK, "] Saliendo del chat...")
	emisorMensajes.close()
	receptorMensajes.close()
	process.exit(0)
})

// ....................................................
// gestión de SIGINT (Ctrl+C) para una salida limpia
//
process.on('SIGINT', function() {
	console.log("\n[Cliente", NICK, "] SIGINT capturada. Cerrando sockets...")
	emisorMensajes.close()
	receptorMensajes.close()
	process.exit(0)
})

// --------------------------------------------------------
// --------------------------------------------------------

