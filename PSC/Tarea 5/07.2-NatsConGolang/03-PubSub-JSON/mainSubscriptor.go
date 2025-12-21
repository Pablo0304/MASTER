
// ---------------------------------------------------------------
// ---------------------------------------------------------------
package main

import (
  "fmt"
  "util"
  // "os"
  "time"
  //"errors"

  "github.com/nats-io/nats.go"
)

// ---------------------------------------------------------------
// ---------------------------------------------------------------
type MiMensaje struct {
  Funcion string
  Parametro1 int
  Parametro2 string
} // struct


// ---------------------------------------------------------------
// ---------------------------------------------------------------
func main() {
  fmt.Println( "hola. Empieza subscriptor" )
  url := nats.DefaultURL // normalmente: nats://localhost:4222
  fmt.Println( url )

	// conectar
	conexion, _ := nats.Connect(url)

  if conexion == nil {
    fmt.Println( "no he podido conectar, termino ")
    return
  }

  // diferir: diferimos el vaciado de los mensajes al cerrar la conexion
	defer func() {
    if conexion != nil {
      conexion.Drain()
    }
    fmt.Println( "ADIOS")
  }()


  // nos subscribimos a un canal
	subscripcion, _ := conexion.SubscribeSync("llamadas")
  fmt.Println( "estoy suscrito")

  for  {
    fmt.Println( "espero mensaje")
    mensaje, _ := subscripcion.NextMsg( 2 * time.Second ) // el valor es el timeout

    if mensaje != nil {
      fmt.Println( "\n ******* RECIBO PUBLICACION ********")
      fmt.Printf( " recibo: tema: %q\n", mensaje.Subject )

      var mensaje_entrante MiMensaje

      util.PasarBytesJsonAStruct( mensaje.Data, & mensaje_entrante )

      fmt.Printf( "Funcion: %s\n", mensaje_entrante.Funcion )
      fmt.Printf( "param 1: %d\n", mensaje_entrante.Parametro1 )
      fmt.Printf( "param 2: %s\n", mensaje_entrante.Parametro2 )
    } // if

  } // for

  conexion.Close()
} // main ()

// ---------------------------------------------------------------
// ---------------------------------------------------------------

// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ---------------------------------------------------------------


/*

package main

import (
  "fmt"
  "os"
  "time"

  "github.com/nats-io/nats.go"
)

func main() {
  // Use the env variable if running in the container, otherwise use the default.
  url := os.Getenv("NATS_URL")
  if url == "" {
    url = nats.DefaultURL
  }

  // Create an unauthenticated connection to NATS.
  nc, _ := nats.Connect(url)

  // Drain is a safe way to ensure all buffered messages that were published
  // are sent and all buffered messages received on a subscription are processed
  // before closing the connection.
  defer nc.Drain()

  // Messages are published to subjects. Although there are no subscribers,
  // this will be published successfully.
  nc.Publish("greet.joe", []byte("hello"))

  // Let's create a subscription on the greet.* wildcard.
  sub, _ := nc.SubscribeSync("greet.*")

  AQUI

  // For a synchronous subscription, we need to fetch the next message.
  // However.. since the publish occured before the subscription was
  // established, this is going to timeout.
  msg, _ := sub.NextMsg(10 * time.Millisecond)
  fmt.Println("subscribed after a publish...")
  fmt.Printf("msg is nil? %v\n", msg == nil)

  // Publish a couple messages.
  nc.Publish("greet.joe", []byte("hello"))
  nc.Publish("greet.pam", []byte("hello"))

  // Since the subscription is established, the published messages will
  // immediately be broadcasted to all subscriptions. They will land in
  // their buffer for subsequent NextMsg calls.
  msg, _ = sub.NextMsg(10 * time.Millisecond)
  fmt.Printf("msg data: %q on subject %q\n", string(msg.Data), msg.Subject)

  msg, _ = sub.NextMsg(10 * time.Millisecond)
  fmt.Printf("msg data: %q on subject %q\n", string(msg.Data), msg.Subject)

  // One more for good measures..
  nc.Publish("greet.bob", []byte("hello"))

  msg, _ = sub.NextMsg(10 * time.Millisecond)
  fmt.Printf("msg data: %q on subject %q\n", string(msg.Data), msg.Subject)
}
*/
