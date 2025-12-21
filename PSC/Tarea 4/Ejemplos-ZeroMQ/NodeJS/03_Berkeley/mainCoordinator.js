// --------------------------------------------------------
// mainCoordinator.js
// --------------------------------------------------------
//
// Implementación del algoritmo de Berkeley usando ZeroMQ
// siguiendo el diseño de la tarea 2:
//  - un proceso coordinador
//  - varios procesos clientes
//  - el coordinador pregunta la hora a los clientes,
//    calcula la hora media y envía ajustes.
//
// En el diseño abstracto los procesos se comunican
// con "mensajes" y "canales". En esta realidad concreta:
//  - usamos un socket PUB para difundir órdenes/ajustes
//  - usamos un socket REQ/REP para que los clientes
//    envíen su hora al coordinador
//
// --------------------------------------------------------

// ....................................................
// "importamos biblioteca zeromq"
var zmq = require('zeromq')

// ....................................................
// parámetros de ejecución
//
//   node mainCoordinator.js [NUM_CLIENTES] [PERIODO_MS]
//
var NUM_CLIENTES = (process.argv[2] ? parseInt(process.argv[2]) : 2)
var PERIODO_MS   = (process.argv[3] ? parseInt(process.argv[3]) : 10000)

if (isNaN(NUM_CLIENTES) || NUM_CLIENTES <= 0) NUM_CLIENTES = 2
if (isNaN(PERIODO_MS)   || PERIODO_MS   <= 0) PERIODO_MS   = 10000

console.log("Coordinador Berkeley arrancando...")
console.log("  número de clientes esperados:", NUM_CLIENTES)
console.log("  periodo entre rondas (ms):   ", PERIODO_MS)

// ....................................................
// sockets
//
//  - publisher: difunde órdenes (PREGUNTA_HORA) y ajustes (AJUSTE ...)
//  - receptor  (rep): recibe las horas de los clientes
//
var publisher = zmq.socket('pub')
var receptor  = zmq.socket('rep')

// ....................................................
// estado de la ronda actual
//
var rondaActual = 0
var tiemposRonda = {} // diccionario: idCliente -> tiempo que envía

// ....................................................
// función auxiliar: iniciar una ronda de sincronización
//
function iniciarRonda() {
	rondaActual++
	tiemposRonda = {}

	console.log("\n--------------------------------------------------------")
	console.log("Iniciando ronda de sincronización:", rondaActual)
	console.log("--------------------------------------------------------")

	// el coordinador usa su reloj local
	var ahoraCoordinador = Date.now()
	console.log("Ronda", rondaActual, "- hora coordinador (ms):", ahoraCoordinador)

	// difundir orden a los clientes para que envíen su hora
	var mensaje = "PREGUNTA_HORA " + rondaActual
	console.log("Publicando:", mensaje)
	publisher.send(mensaje)
}

// ....................................................
// función auxiliar: calcular media y enviar ajustes
//
function calcularYEnviarAjustes() {
	var ids = Object.keys(tiemposRonda)
	if (ids.length < NUM_CLIENTES) {
		// aún no tenemos todas las respuestas necesarias
		return
	}

	console.log("Ronda", rondaActual, "- recibidas todas las horas de los clientes.")

	// construimos array de tiempos
	var sumaTiempos = 0

	for (var i = 0; i < ids.length; i++) {
		var idCliente = ids[i]
		var tiempoCliente = tiemposRonda[idCliente]
		console.log("   cliente", idCliente, " -> ", tiempoCliente, "ms")
		sumaTiempos += tiempoCliente
	}

	// añadimos el tiempo del coordinador (tal y como dice el algoritmo de Berkeley)
	var tiempoCoordinador = Date.now()
	console.log("   coordinador (propio) -> ", tiempoCoordinador, "ms")
	sumaTiempos += tiempoCoordinador

	var totalParticipantes = NUM_CLIENTES + 1 // clientes + coordinador
	var media = Math.round(sumaTiempos / totalParticipantes)

	console.log("Ronda", rondaActual, "- tiempo medio calculado:", media, "ms")

	// desplazamiento que debe aplicar el coordinador a su propio reloj
	var ajusteCoordinador = media - tiempoCoordinador
	console.log("Ronda", rondaActual, "- ajuste coordinador:", ajusteCoordinador, "ms")

	// enviar ajustes a cada cliente mediante el canal de publicación
	for (var j = 0; j < ids.length; j++) {
		var id = ids[j]
		var tiempoCli = tiemposRonda[id]
		var ajusteCli = media - tiempoCli

		var msg = "AJUSTE " + id + " " + ajusteCli + " " + rondaActual + " " + media
		console.log("Enviando ajuste a cliente", id, ":", msg)
		publisher.send(msg)
	}

	console.log("Ronda", rondaActual, "- fin de ronda.")
}

// ....................................................
// callback para recepción de horas de los clientes
//
receptor.on('message', function(mensaje) {
	var texto = mensaje.toString()
	console.log("Coordinador recibe:", texto)

	// protocolo esperado:
	//   HORA <idCliente> <tiempoMs> <ronda>
	var partes = texto.split(" ")
	if (partes.length < 4 || partes[0] !== "HORA") {
		console.log("   mensaje no reconocido, ignorado.")
		receptor.send("ERROR protocolo")
		return
	}

	var idCli = partes[1]
	var tiempoCli = parseInt(partes[2])
	var rondaMsg = parseInt(partes[3])

	if (rondaMsg !== rondaActual) {
		console.log("   mensaje de otra ronda (", rondaMsg, "), ignorado.")
		receptor.send("IGNORADO ronda")
		return
	}

	if (isNaN(tiempoCli)) {
		console.log("   tiempo no numérico, ignorado.")
		receptor.send("ERROR tiempo")
		return
	}

	// guardamos el tiempo para la ronda actual
	tiemposRonda[idCli] = tiempoCli

	// respuesta tipo ACK para respetar el patrón REQ/REP
	receptor.send("ACK " + rondaActual + " " + idCli)

	// si ya tenemos todas las respuestas, calculamos ajustes
	calcularYEnviarAjustes()
})

// ....................................................
// gestión de señales
//
process.on('SIGINT', function() {
	console.log("\nSIGINT capturada en coordinador. Cerrando sockets...")
	publisher.close()
	receptor.close()
	process.exit(0)
})

// ....................................................
// bind de sockets y arranque de rondas
//
publisher.bind('tcp://*:8688', function(err) {
	if (err) {
		console.log("Error al hacer bind del publisher:", err)
	} else {
		console.log("Publisher escuchando en puerto 8688...")
	}
})

receptor.bind('tcp://*:5555', function(err) {
	if (err) {
		console.log("Error al hacer bind del receptor REP:", err)
	} else {
		console.log("Receptor REP escuchando en puerto 5555...")

		// arrancamos la primera ronda y las siguientes periódicas
		setTimeout(function() {
			iniciarRonda()

			setInterval(function() {
				iniciarRonda()
			}, PERIODO_MS)
		}, 1000)
	}
})

// --------------------------------------------------------
// --------------------------------------------------------

