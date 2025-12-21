// --------------------------------------------------------
// mainClient.js
// --------------------------------------------------------
//
// Proceso cliente del algoritmo de Berkeley.
// Cada cliente:
//  - mantiene un "reloj lógico" (Date.now() + desfase)
//  - recibe PREGUNTA_HORA del coordinador (PUB/SUB)
//  - responde con su hora usando REQ/REP
//  - recibe un mensaje AJUSTE y actualiza su desfase
//
// La estructura corresponde al diseño de la tarea 2:
// procesos que envían/reciben mensajes por canales bien
// definidos. La diferencia con el diseño abstracto es que
// aquí usamos sockets concretos de ZeroMQ y un formato
// de mensaje textual sencillo.
//
// --------------------------------------------------------

// ....................................................
// importamos biblioteca zeromq
var zmq = require('zeromq')

// ....................................................
// parámetros de ejecución
//
//   node mainClient.js [ID_CLIENTE] [DESFASE_INICIAL_MS]
//
var ID_CLIENTE = (process.argv[2] ? process.argv[2] : "CLI-1")
var DESFASE_INICIAL_MS = (process.argv[3] ? parseInt(process.argv[3]) : 0)
if (isNaN(DESFASE_INICIAL_MS)) DESFASE_INICIAL_MS = 0

console.log("Cliente Berkeley arrancando...")
console.log("  id cliente:       ", ID_CLIENTE)
console.log("  desfase inicial:  ", DESFASE_INICIAL_MS, "ms")

// ....................................................
// "reloj lógico" del cliente = Date.now() + desfase
//
var desfaseActual = DESFASE_INICIAL_MS

function leerReloj() {
	return Date.now() + desfaseActual
}

// ....................................................
// sockets del cliente
//
//  - suscriptor SUB: recibe PREGUNTA_HORA y AJUSTE
//  - emisor REQ: envía HORA ... al coordinador
//
var subPreguntas = zmq.socket('sub')
var emisorHoras  = zmq.socket('req')

// ....................................................
// cuando el coordinador nos envía mensajes por el canal PUB
//
subPreguntas.on("message", function(mensaje) {
	var texto = mensaje.toString()
	console.log("Cliente", ID_CLIENTE, "recibe por SUB:", texto)

	var partes = texto.split(" ")
	if (partes[0] === "PREGUNTA_HORA") {
		// protocolo:
		//   PREGUNTA_HORA <ronda>
		var ronda = parseInt(partes[1])
		if (isNaN(ronda)) ronda = 0

		// al recibir la orden, enviamos nuestra hora
		var miHora = leerReloj()
		var msgHora = "HORA " + ID_CLIENTE + " " + miHora + " " + ronda
		console.log("   Cliente", ID_CLIENTE, "envía su hora:", msgHora)
		emisorHoras.send(msgHora)

	} else if (partes[0] === "AJUSTE") {
		// protocolo:
		//   AJUSTE <idCliente> <ajusteMs> <ronda> <horaMedia>
		if (partes.length < 5) {
			console.log("   mensaje AJUSTE mal formado, ignorado.")
			return
		}

		var idObjetivo = partes[1]
		if (idObjetivo !== ID_CLIENTE) {
			// el ajuste no es para este cliente
			return
		}

		var ajuste = parseInt(partes[2])
		var rondaAj = parseInt(partes[3])
		var horaMedia = parseInt(partes[4])

		if (isNaN(ajuste)) ajuste = 0

		console.log("   Cliente", ID_CLIENTE, "recibe ajuste para ronda", rondaAj)
		console.log("      ajuste (ms): ", ajuste, "  hora media (ms):", horaMedia)
		console.log("      reloj ANTES del ajuste:", leerReloj(), "ms")

		// aplicamos el ajuste sobre el desfase
		desfaseActual += ajuste

		console.log("      reloj DESPUÉS del ajuste:", leerReloj(), "ms")
	}
})

// ....................................................
// respuesta del coordinador a nuestro REQ (ACK, errores,...)
//
emisorHoras.on("message", function(mensaje) {
	console.log("Cliente", ID_CLIENTE, "recibe respuesta REQ/REP:", mensaje.toString())
})

// ....................................................
// gestión de señales
//
process.on('SIGINT', function() {
	console.log("\nSIGINT capturada en cliente", ID_CLIENTE, ". Cerrando sockets...")
	subPreguntas.close()
	emisorHoras.close()
	process.exit(0)
})

// ....................................................
// conexiones
//
subPreguntas.subscribe("") // sin filtro: todos los mensajes

subPreguntas.connect("tcp://localhost:8688")
console.log("Cliente", ID_CLIENTE, "conectado como SUB a puerto 8688")

emisorHoras.connect("tcp://localhost:5555")
console.log("Cliente", ID_CLIENTE, "conectado como REQ a puerto 5555")

// ....................................................
// imprimir periódicamente nuestro reloj lógico para ver la
// diferencia antes y después de la sincronización
//
setInterval(function() {
	console.log("Cliente", ID_CLIENTE, "reloj lógico (ms):", leerReloj())
}, 5000)

// --------------------------------------------------------
// --------------------------------------------------------

