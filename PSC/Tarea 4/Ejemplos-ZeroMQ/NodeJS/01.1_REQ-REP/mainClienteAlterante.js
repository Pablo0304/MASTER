
// ....................................................
// Envía un mensaje después de recibir la respuesta
// al anterior (por tanto, espera respuesta antes de seguir)
// ....................................................
var zmq = require('zeromq')

// ....................................................

// ....................................................
var MI_NOMBRE = (process.argv[2] ? process.argv[2]  : "noname")

// ....................................................
var socketREQ = zmq.socket('req')

// ....................................................
var N = 10
var cont = 0

// ....................................................
// cuando reciba respuesta
socketREQ.on("message", function(reply) {
	
	console.log("cliente " + MI_NOMBRE + ": recibo respuesta ", cont, ": [", reply.toString(), ']')

	if (cont === N) {
		socketREQ.close()
		process.exit(0)
	} else {
		enviarMensaje(MI_NOMBRE)
	}
})


// ....................................................
function enviarMensaje (origen) {
	cont++
	socketREQ.send("Hello " + cont + " desde " + origen)
	console.log (" enviado mensaje ", cont, " espero respuesta")
}

// ....................................................
socketREQ.connect("tcp://localhost:5555")

// ....................................................
// envía un mensaje, y luego el siguiente, cuando reciba respuesta del
// anterior
enviarMensaje(MI_NOMBRE)

// ....................................................
process.on('SIGINT', function() {
  socketREQ.close()
})
