
// ....................................................
// este cliente envía de golpe todos los mensajes al servidor
// (no debería hacerse así)
// ....................................................

var zmq = require('zeromq')

// ....................................................
var MI_NOMBRE = (process.argv[2] ? process.argv[2]  : "noname")

// ....................................................
console.log("Connecting to hello world server...")

var socketParaPedir = zmq.socket('req')

// ....................................................
var N = 10
var cont = 0

// ....................................................
// cuando reciba respuestas
socketParaPedir.on("message", function(respuesta) {

	cont++
	console.log("cliente " + MI_NOMBRE + ": recibo respuesta ", cont, ": [", respuesta.toString(), ']')

	if (cont === N) {
		socketParaPedir.close()
		process.exit(0)
	}
})

// ....................................................
// conectar
socketParaPedir.connect("tcp://localhost:5555")

// ....................................................
//
// envío 10 mensajes (función recursiva)
// seguidos cada 0.8 segundos (sin esperar respuesta. 
// Atención: no debería ser así. Debería esperar respuesta.
// Sin embargo, la biblioteca para JS parece que lo tolera
//

enviarMensaje = function (n, origen) {
	if (n <= N) {
		setTimeout(function() {
			console.log("enviando petición ", n, '...')
			socketParaPedir.send("Hello " + n + " desde " + origen)
			
			enviarMensaje (n+1, MI_NOMBRE)
		}, 800)
	}
}

// ....................................................
enviarMensaje (1, MI_NOMBRE)

// ....................................................

process.on('SIGINT', function() {
	console.log ( " ** SIGINT capturada: cerrando !! ** ")
	socketParaPedir.close()
})

