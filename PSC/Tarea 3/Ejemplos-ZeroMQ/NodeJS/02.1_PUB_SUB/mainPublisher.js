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
    console.log("Publishing on 8688...")
})

// ....................................................
for (var i=1 ; i<=10 ; i++)

    setTimeout(
		function() {
			console.log('enviando');
			publisher.send("Hello, últimas noticias ! ")
		}, 
		2000 * i /* 
				  * ¿cuánto tiempo pasa entre 2 envíos? la derivada respecto i !
				  * ¿qué vale 'i'en los envíos si lo incluimos?
				  */
		
	);

// ....................................................
process.on('SIGINT', function() {
  publisher.close()
  console.log('\nClosed')
})
