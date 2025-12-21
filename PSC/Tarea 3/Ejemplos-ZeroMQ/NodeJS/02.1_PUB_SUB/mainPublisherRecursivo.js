// ....................................................
// publisher.js

// ....................................................
var zmq = require('zeromq')

// ....................................................
var publisher = zmq.socket('pub')

// ....................................................
publisher.bind('tcp://*:8688', function(err) {
  if(err)
    console.log(err)
  else
    console.log("Listening on 8688...")
})

// ....................................................
var enviar = function (n) {
	if (n>10) return;

    setTimeout(
		function() {
			console.log('enviando');
			publisher.send("Hello, últimas noticias ! " + (n-1));
		}, 
		2000 * n
	);

	n++;

	enviar (n);
	
} // ()

// ....................................................
enviar (1);

// ....................................................
process.on('SIGINT', function() {
  publisher.close()
  console.log('\nClosed')
})
