// ----------------------------------------------
// 
// ----------------------------------------------

package util

// ----------------------------------------------
// imports
// ----------------------------------------------
import (
  //"fmt"

  "log" 

  "os"
  "os/signal"
  "syscall"

  "math/rand"
  "time"
  "strconv"
  "encoding/json"

//  "context"
)

// ----------------------------------------------
//
// nivel: N, msg: Texto, resto: Objet --> f()
//
// Helper to log.
// ----------------------------------------------
func JLog( nivel int32, msg string, resto ...any ) {

  const DEBUG_LEVEL = 1

  if  nivel <= DEBUG_LEVEL {
    log.Printf( msg, resto... )
  }

} // ()


// ----------------------------------------------
// Helper
//   f() --> Texto
// ----------------------------------------------
func GetRandomString() string {
  var aux = ( time.Now().UnixMilli() * int64(rand.Int()) )  % 31415926535 
  if aux < 0 {
    aux = -aux
  }
  return strconv.FormatInt( aux, 10 )
}

// ----------------------------------------------
// Helper
// Object --> f() --> []byte
// ----------------------------------------------
func PasarStructAJsonBytes( obj interface{} ) []byte {

  comoBytes, _  := json.Marshal( obj )

  return comoBytes 

} // ()

// ----------------------------------------------
// Helper
// Object --> f() --> TextoJson
// ----------------------------------------------
func PasarStructATextoJson( obj interface{} ) string {

  return string( PasarStructAJsonBytes( obj ) )

} // ()

// ----------------------------------------------
// Helper
// BytesJson --> f() --> Object
//
// with generics
// ----------------------------------------------
func PasarBytesJsonAStruct[T any]( bytesJson []byte, p * T )  error {

  return json.Unmarshal( bytesJson, p )
} // ()

// ----------------------------------------------
// Helper
// TextoJson --> f() --> Object
//
// with generics
// ----------------------------------------------
func PasarTextoJsonAStruct[T any]( textoJson string, p * T )  error {

  var comoBytes = []byte( textoJson )

  return json.Unmarshal( comoBytes, p )
} // ()

// ---------------------------------
// ---------------------------------
type CallbackCtrlC func()
func InstalaEscuchadorCtrlC( callback CallbackCtrlC ) {

  //
  // preparo para captura ctrl-c y terminar
  //
  c := make( chan os.Signal )
  // signal.Notify( c, os.Interrupt, syscall.SIGTERM )
  signal.Notify( c, os.Interrupt, syscall.SIGSEGV, syscall.SIGTERM )


  //signal.Notify( c, os.Interrupt )
  go func() { // nuevo thread o go routina que espera
    <- c // espera algo en el canal
    callback()
    //   elGestor.Desconectar()
    //  os.Exit( 0 )
  } () // llamando
} // ()

// ----------------------------------------------
// ----------------------------------------------
// ----------------------------------------------
// ----------------------------------------------
