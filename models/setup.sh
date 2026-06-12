#!/bin/bash
echo "[AEGIS] Setting up AMD ROCm + Ollama..."

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull Mistral model
echo "[AEGIS] Pulling Mistral 7B..."
ollama pull mistral

echo "[AEGIS] Setup complete. Run: ollama serve"
