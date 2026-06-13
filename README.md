# ⚔️ AEGIS
### Autonomous AI Security Triage Agent on AMD GPUs

> *Give it a target. It hunts, classifies, and reports threats — no human in the loop.*

[![AMD ROCm](https://img.shields.io/badge/AMD-ROCm-ED1C24?style=flat-square&logo=amd)](https://rocm.docs.amd.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python)](https://python.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Hackathon](https://img.shields.io/badge/AMD%20Developer%20Hackathon-ACT%20II-ED1C24?style=flat-square)](https://lablab.ai)

---

## 🧠 What is AEGIS?

AEGIS is an **autonomous, agentic cybersecurity pipeline** that performs end-to-end security triage without human intervention. Point it at a target scope, and it autonomously:

1. **Recons** — subdomain enumeration, port scanning, WHOIS, header analysis
2. **Classifies** — GPU-accelerated threat classification using a local LLM on AMD ROCm
3. **Reports** — generates structured vulnerability reports with CVE mappings and risk scores

Built for the **AMD Developer Hackathon: ACT II** — running real AI inference on AMD GPU cloud infrastructure, not just wrapping external APIs.

---

## ⚙️ Architecture

```
User Input (target scope)
        ↓
  Agent Orchestrator  ←— LLM on AMD GPU (ROCm + Ollama)
        ↓
┌─────────────────────────────────────┐
│  Module 1: Recon Engine             │
│  Module 2: Vulnerability Scanner    │
│  Module 3: Threat Classifier (GPU)  │
│  Module 4: Report Generator         │
└─────────────────────────────────────┘
        ↓
  PDF/HTML Report + Risk Score Dashboard
```

---

## 🚀 Features

- 🔍 **Autonomous recon** — subdomain enum, port scan, service fingerprinting
- 🧬 **CVE matching** — real-time lookup against NVD/CVE database
- 🤖 **GPU-accelerated inference** — LLM runs locally on AMD Developer Cloud via ROCm
- 📊 **Risk scoring** — CVSS-based severity classification per finding
- 📄 **Auto-reporting** — clean PDF/HTML output ready for stakeholders
- 🖥️ **Live dashboard** — React frontend showing agent progress in real time

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Agent Framework | LangGraph |
| LLM | Mistral 7B / Llama 3 via Ollama |
| GPU Runtime | AMD Developer Cloud (ROCm) |
| Backend | Python (FastAPI) |
| Frontend | React + TailwindCSS |
| CVE Lookup | NVD API |
| Report Generation | ReportLab (PDF) |

---

## 📁 Project Structure

```
AEGIS/
├── agent/
│   ├── orchestrator.py      # LangGraph agent core
│   ├── tools/
│   │   ├── recon.py         # Recon module
│   │   ├── scanner.py       # Vulnerability scanner
│   │   ├── classifier.py    # GPU threat classifier
│   │   └── reporter.py      # Report generator
├── api/
│   └── main.py              # FastAPI backend
├── frontend/
│   └── src/                 # React dashboard
├── models/
│   └── setup.sh             # ROCm + Ollama setup
├── requirements.txt
└── README.md
```

---

## 🏃 Getting Started

```bash
# Clone the repo
git clone https://github.com/MarceloMiva/AEGIS.git
cd AEGIS

# Install dependencies
pip install -r requirements.txt

# Set up AMD GPU + Ollama (ROCm)
bash models/setup.sh

# Run AEGIS
python agent/orchestrator.py --target scope.json
```

---

## 🏆 Built For

**AMD Developer Hackathon: ACT II**
- Online Phase: July 6–11, 2026
- On-site (London): July 11–12, 2026
- Prize Pool: $10,000

---

## 👤 Author

**YSIM MARCELO** (Fashipe Oluwadamilare Ayoola)
- GitHub: [@MarceloMiva](https://github.com/MarceloMiva)
- Portfolio: [marcelomiva.github.io](https://marcelomiva.github.io)

---

*AEGIS — Your infrastructure's shield.*
