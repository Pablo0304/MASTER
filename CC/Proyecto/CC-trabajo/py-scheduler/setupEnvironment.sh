#!/bin/bash

log() {
  echo
  echo "======================================"
  echo "[LOG] $1"
  echo "======================================"
  echo
}

log "Creating Python virtual environment inside .venv"
python3 -m venv .venv

log "Activating virtual environment"
source .venv/bin/activate

log "Installing kubernetes Python package"
pip install kubernetes==29.0.0

log "Environment setup completed"