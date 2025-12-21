
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

  // nos subscribimos a un canal
	// subscripcion, _ := conexion.SubscribeSync("temazo.*")

  contador := 0

  for {
    contador++
    mensaje := fmt.Sprintf( "hola %d", contador )
    fmt.Printf( " publico: %s \n", mensaje )
    conexion.Publish( "temazos", []byte( mensaje ))
    time.Sleep( 3 * time.Second )
  
  }

  conexion.Close()
} // main ()

// ---------------------------------------------------------------
// ---------------------------------------------------------------

// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ---------------------------------------------------------------
