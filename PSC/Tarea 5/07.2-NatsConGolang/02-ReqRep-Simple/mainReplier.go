
// ---------------------------------------------------------------
// ---------------------------------------------------------------
package main

import (
  "fmt"
  // "os"
  "time"
  //"errors"

  "github.com/nats-io/nats.go"
)
// ---------------------------------------------------------------
// ---------------------------------------------------------------
func main() {
  fmt.Println( "hola. Empieza servidor" )
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
	//subscripcion, _ := conexion.Subscribe( "preguntas",
	conexion.Subscribe( "preguntas",
    func( mensaje *nats.Msg ) { // callback:
      fmt.Println( "=======================================================" )
      fmt.Println( "                       REPLIER                         " )
      fmt.Println( "=======================================================" )
      fmt.Println( "\nme preguntan" )
      fmt.Println( " subject:", mensaje.Subject )
      fmt.Println( " reply:", mensaje.Reply )
      fmt.Println( " header:", mensaje.Header )
      fmt.Println( " data:", string(mensaje.Data) )
      fmt.Println( " subscripcion:", mensaje.Sub )
      fmt.Println()

      fmt.Println( "=======================================================" )
      respuesta := fmt.Sprintf( "Te contesto a: %s", string( mensaje.Data) )
      mensaje.Respond( []byte( respuesta ))
      fmt.Println( "=======================================================" )
    },
  )
  fmt.Println( "estoy suscrito")

  time.Sleep( 20 * time.Second )

  conexion.Close()
} // main ()

// ---------------------------------------------------------------
// ---------------------------------------------------------------

// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ---------------------------------------------------------------
