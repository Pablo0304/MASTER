# Aplicacion distribuida de firmas

Este entrega propone dos alternativas distribuidas (sin coordinador central fijo):

- ZeroMQ: el cliente orquesta y recolecta firmas directamente de los nodos firmantes.
- Kafka: publicacion/suscripcion con agregacion en el cliente; cada firmante procesa la peticion y publica su firma.

## Requisitos del enunciado

- El sistema recibe un documento y una lista de firmantes.
- El sistema devuelve el documento con las firmas requeridas.
- Los firmantes son nodos independientes.
- Explorar alternativas a una version centralizada y tolerancia a fallos.

## Alternativa 1: ZeroMQ (brokerless)

Diseno:

- El cliente publica la solicitud (documento + lista de firmantes) por un canal PUB.
- Cada firmante esta suscrito al canal; si su ID esta en la lista, firma y envia la respuesta al cliente por un canal PUSH->PULL.
- El cliente agrega firmas hasta completar o hasta timeout y puede reintentar.

Tolerancia a fallos:

- Si algun firmante no responde, el cliente sigue con las firmas recibidas y reporta faltantes.
- Se puede reintentar la peticion con el mismo doc_id para idempotencia (firma deduplicada por doc_id+signer_id).

Ejecutar (en terminales separadas):

1. Firmantes:
   - `python3 signer.py --id A --sub tcp://localhost:5555 --push tcp://localhost:5556`
   - `python3 signer.py --id B --sub tcp://localhost:5555 --push tcp://localhost:5556`
2. Cliente:
   - `python3 client.py --pub tcp://*:5555 --pull tcp://*:5556 --signers A,B --doc "hola"`

Archivos:

- `zeromq/client.py`
- `zeromq/signer.py`
- `zeromq/common.py`

## Alternativa 2: Kafka (pub/sub)

Diseno:

- El cliente publica la solicitud en `sign-requests` con `doc_id` y lista de firmantes.
- Cada firmante consume con un group id unico (para recibir todas las solicitudes) y publica su firma en `sign-responses`.
- El cliente consume respuestas y agrega firmas hasta completar o hasta timeout.

Tolerancia a fallos:

- Kafka asegura entrega al menos una vez; el cliente deduplica por doc_id+signer_id.
- Si un firmante cae, al reiniciar puede continuar desde el offset (si no se usa auto commit) o desde el ultimo offset confirmado.

Ejecutar (requiere Kafka local):

1. Firmantes:
   - `python3 signer.py --id A --brokers localhost:9092`
   - `python3 signer.py --id B --brokers localhost:9092`
2. Cliente:
   - `python3 client.py --brokers localhost:9092 --signers A,B --doc "hola"`

Archivos:

- `kafka/client.py`
- `kafka/signer.py`
- `kafka/common.py`

## Entrega:

- Un README con el diseño y como ejecutar.
- Codigo minimo para cliente y firmante en cada alternativa.
- Mantener todo simple y en un solo archivo por rol, con dependencias estandar (pyzmq y kafka-python).
- Incluir timeouts, deduplicacion y manejo basico de errores.
