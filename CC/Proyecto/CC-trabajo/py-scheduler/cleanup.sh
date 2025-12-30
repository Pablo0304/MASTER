#!/bin/bash

log() {
  echo
  echo "======================================"
  echo "[LOG] $1"
  echo "======================================"
  echo
}

log "Deleting test pod"
kubectl delete -f test-pod.yaml

log "Deleting scheduler RBAC and Deployment"
kubectl delete -f rbac-deploy.yaml

log "Deleting kind cluster 'sched-lab'"
kind delete cluster --name sched-lab

log "Cleanup completed"