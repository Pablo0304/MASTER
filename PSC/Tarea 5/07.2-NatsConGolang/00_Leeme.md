
1. Arrancar el servidor Nats (que está en docker)

```
make runnats
```

Se para con

```
make stopnats
```

2. Arrancar los programas de ejemplo

+ Requester - Replier

```
make run-reqrep
```

+ Publicador - subscriptor

```
make run-pubsub
```

+ Publicador - subscriptor, usando JSON

```
make run-pubsubjson
```

+ Log (con Nats + jetstream)

```
make run-jetstream
```
