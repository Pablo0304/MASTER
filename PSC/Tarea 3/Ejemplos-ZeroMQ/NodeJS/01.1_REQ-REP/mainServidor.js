// --------------------------------------------------------
// mainServidor.js
// --------------------------------------------------------

// ....................................................
// "importamos biblioteca zeromq"
var zmq = require('zeromq')

// --------------------------------------------------------
// --------------------------------------------------------
function main() {

    	//
    	//
    	//
	console.log( "hola mundo" )

	// 
	// creo un socket (de la biblioteca zeromq)
	// de tipo REP (reply)
	// 
	// 
	// SocketResponder spr = new SocketResponder();
	var socketParaResponder = zmq.socket('rep')

	//
	// doy una función anónima como callback
	// para enterarme del evento SIGINT (ctrl-c)
	//
	process.on('SIGINT', function() {
		console.log (" sigint capturada ! ")
		console.log (" hasta luego Lucas! ")
		socketParaResponder.close()
		// socketParaResponder = null
	})

	//
	// pongo contador de mensajes recibidos a 0
	//
	var cont = 0

	//
	// doy la función que debe ejecutarse cuando
	// llegue un mensaje al socket
	//
	socketParaResponder.on('message', function(peticionQueRecibo) {
		//
		// función  que se ejecuta cuando llega un mensaje
		//
	
		// sumo 1 al contador de mensajes llegados
		cont++
		// informo por pantalla
		console.log("servidor recibo petición: "
					+ cont + " [", peticionQueRecibo.toString(), "]")

		// hago algo de "trabajo": esperar algunos segundos
		// y entonces ejecutar el callback, en el cuál respondemos
		// 
		// setTimeout = encargar algo para dentro de un tiempo
		setTimeout(
			function() {
			// respondemos
			console.log("servidor respondo petición: " + cont )
			if (socketParaResponder) 
				socketParaResponder.send(
					" respuesta desde servidor, "
						+ " echo de "
						+ peticionQueRecibo.toString())
			}, 4000) // setTimeout
	}) // socketParaResponder.on()

	//
	// bind = vincular numero con socket = anuncio que mi
	// socket está disponible
	// en el puerto 5555 (al cuál se puede conectar cualquiera
	// por tcp)
	//
	// Se le da también un callback para que cuando
	// efectivamente el bind()  haya ocurrido
	// se ejecuta la función
	//
	socketParaResponder.bind('tcp://*:5555', function(err) {
		if (err) {
			console.log(err)
		} else {
			console.log("Listening on 5555...")
		}
	})
} // main ()

// --------------------------------------------------------
// --------------------------------------------------------

main() 

// --------------------------------------------------------
// --------------------------------------------------------
// --------------------------------------------------------
// --------------------------------------------------------
