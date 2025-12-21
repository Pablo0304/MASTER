
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
  fmt.Println( "hola" )
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

  contador := 0

  for {
    fmt.Println( "=======================================================" )
    fmt.Println( "                       REQUESTER                       " )
    fmt.Println( "=======================================================" )
    contador++
    mensaje := fmt.Sprintf( "pregunta %d", contador )
    fmt.Printf( " pregunto: %s \n", mensaje )

    respuesta, _ := conexion.Request( "preguntas", []byte(mensaje), time.Second )

    fmt.Println( "=======================================================" )
    if respuesta != nil {
      fmt.Println( " * me responden: ")
      fmt.Println( " subject:", respuesta.Subject )
      fmt.Println( " reply:", respuesta.Reply )
      fmt.Println( " header:", respuesta.Header )
      fmt.Println( " data:", string(respuesta.Data) )
      fmt.Println( " subscripcion:", respuesta.Sub )
      fmt.Println()
    } 
    fmt.Println( "=======================================================" )

    time.Sleep( 3 * time.Second )

  } // for

  conexion.Close()
} // main ()

// ---------------------------------------------------------------
// ---------------------------------------------------------------

// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ---------------------------------------------------------------
