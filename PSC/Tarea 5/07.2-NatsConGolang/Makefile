
help:
	@echo "----------------------------------------------"
	@echo " lee Makefile "
	@echo 
	@echo    make runnats
	@echo "----------------------------------------------"

# -------------------------------------------------------------------
# recordar: docker inspect
# -------------------------------------------------------------------

# -------------------------------------------------------------------
#
# utilidades sobre el contenedor nats
#
# -------------------------------------------------------------------
pullnats:
	docker pull nats
	docker images

#
# A nats server exposes multiple ports:
#  4222 for clients
#  6222 routing for clusters
#  8222 for requesting information for reports
# Fuente: hub.doocker.com -> nats container
#
	#docker run --name natssrv --rm  -p 4222:4222 nats
runnats:
	xterm -bg orange -e 'docker run --name natssrv --rm  -p 4222:4222 nats -js' &

stopnats:
	docker stop natssrv
	docker ps -a

# -------------------------------------------------------------------
#
# utilidades docker
#
# -------------------------------------------------------------------
ls:
	docker images

ps:
	docker ps -a

rmtodos:
	docker rm `docker ps -aq` || true
#wc -l `ls`

#clean: rmcont
	#docker ps -a
	#@echo
	#docker images

# -------------------------------------------------------------------
#
# ejemplos
#
# -------------------------------------------------------------------
#
run-pubsub:
	@echo " recuerda haber arrancado nats: make runnats"
	xterm -bg red -fg white -e '(cd 01-PubSub-Simple; go run mainSubscriptor.go)' &
	xterm -bg red -fg white -e '(cd 01-PubSub-Simple; go run mainSubscriptor.go)' &
	xterm -bg blue -fg white -e '(cd 01-PubSub-Simple; go run mainPublicador.go)' &
	
run-reqrep:
	@echo " recuerda haber arrancado nats: make runnats"
	xterm -bg red -fg white -e '(cd 02-ReqRep-Simple; go run mainReplier.go)' &
	xterm -bg blue -fg white -e '(cd 02-ReqRep-Simple; go run mainRequester.go)' &

run-pubsubjson:
	@echo " recuerda haber arrancado nats: make runnats"
	xterm -bg red -fg white -e '(cd 03-PubSub-JSON; go run mainSubscriptor.go)' &
	xterm -bg red -fg white -e '(cd 03-PubSub-JSON; go run mainSubscriptor.go)' &
	xterm -bg blue -fg white -e '(cd 03-PubSub-JSON; go run mainPublicador.go)' &
	
run-jetstream:
	@echo " recuerda haber arrancado nats: make runnats"
	xterm -bg blue -fg white -e '(cd 04-Log-Jetstream; go run main.go jetstream.go publisher.go consumer.go)' &
	
