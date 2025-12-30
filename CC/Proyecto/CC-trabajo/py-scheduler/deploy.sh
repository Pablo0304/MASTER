#!/bin/bash

log() {
  echo
  echo "======================================"
  echo "[LOG] $1"
  echo "======================================"
  echo
}

log "Creating kind cluster 'sched-lab'"
kind create cluster --name sched-lab

log "Showing cluster info"
kubectl cluster-info

log "Listing cluster nodes"
kubectl get nodes

log "Checking default kube-scheduler pod"
kubectl -n kube-system get pods -l component=kube-scheduler

log "Showing logs of default kube-scheduler"
kubectl -n kube-system logs -l component=kube-scheduler --tail 3

log "Waiting for control-plane node to be Ready"
kubectl wait --for=condition=Ready node/sched-lab-control-plane --timeout=60s

log "Creating a test pod (nginx)"
kubectl run test --image=nginx --restart=Never

log "Waiting for default ServiceAccount to be created"
kubectl wait --for=condition=Established serviceaccount/default -n default --timeout=20s 2>/dev/null || true

log "Listing all pods (wide output)"
kubectl get pods -o wide

log "Activating virtual environment"
source .venv/bin/activate

log "Building Docker image my-py-scheduler:latest"
docker build -t my-py-scheduler:latest .

log "Loading image into kind cluster (sched-lab)"
kind load docker-image my-py-scheduler:latest --name sched-lab

log "Applying RBAC and Deployment for custom scheduler"
kubectl apply -f rbac-deploy.yaml

log "Waiting for custom scheduler pod to be created"
kubectl -n kube-system wait --for=condition=ContainersReady pod -l app=my-scheduler --timeout=60s || true

log "Checking custom scheduler pods"
kubectl -n kube-system get pods -l app=my-scheduler

log "Applying test pod manifest"
kubectl apply -f test-pod.yaml

log "Listing all pods (wide output)"
kubectl get pods -o wide

log "Showing custom scheduler logs"
kubectl -n kube-system logs deploy/my-scheduler

log "Setup completed"