
// ---------------------------------------------------------------
// ---------------------------------------------------------------
package main

import (
  //"encoding/json"
  "util"
  "fmt"
  "os"
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

  util.InstalaEscuchadorCtrlC( func() {
    fmt.Println( " ctr-c pulsado, Cerrrando ... ")
    conexion.Close()
    os.Exit( 0 )

  })

  // nos subscribimos a un canal
	// subscripcion, _ := conexion.SubscribeSync("temazo.*")

  contador := 0

  for {
    contador++
    mensaje := MiMensaje{ "f1", contador, "probando"}
    mensaje_en_bytes := util.PasarStructAJsonBytes( mensaje )
    fmt.Printf( " publico: %d \n", contador )
    conexion.Publish( "llamadas", mensaje_en_bytes )
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
