// ....................................................
// subscriber.js

// ....................................................
var zmq = require('zeromq')

// ....................................................
var subscriber = zmq.socket('sub')

// ....................................................
subscriber.on("message", function(mensajeRecibido) {
  console.log('Received message: ', mensajeRecibido.toString());
})

// ....................................................
subscriber.connect("tcp://localhost:8688");
subscriber.subscribe(""); // sin filtro, acepto todos los mensajes

// ....................................................
process.on('SIGINT', function() {
  subscriber.close()
  console.log('\nClosed')
})
