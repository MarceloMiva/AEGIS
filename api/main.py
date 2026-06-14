from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
from agent.orchestrator import build_agent
import uuid

app = FastAPI(title="AEGIS API", version="1.0")

app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"])

jobs: Dict = {}

class ScanRequest(BaseModel):
    target: str

class JobStatus(BaseModel):
    status: str
    target: Optional[str] = None
    error: Optional[str] = None

def run_scan(job_id: str, target: str):
    jobs[job_id]["status"] = "running"
    try:
        agent = build_agent()
        result = agent.invoke({
            "target": target,
            "recon_data": {},
            "scan_data": {},
            "classified_data": {},
            "report_path": "",
            "logs": []
        })
        jobs[job_id]["status"] = "done"
        jobs[job_id]["result"] = {
            "logs": result.get("logs", []),
            "report_path": result.get("report_path", ""),
            "risk": result.get("classified_data", {}).get("overall_risk", "UNKNOWN")
        }
    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)

@app.get("/")
def root():
    return {"name": "AEGIS", "status": "online", "version": "1.0"}

@app.post("/scan")
def start_scan(req: ScanRequest, bg: BackgroundTasks):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "queued", "target": req.target}
    bg.add_task(run_scan, job_id, req.target)
    return {"job_id": job_id, "status": "queued"}

@app.get("/scan/{job_id}")
def get_scan(job_id: str):
    if job_id not in jobs:
        return {"error": "Job not found"}
    return jobs[job_id]

@app.get("/jobs")
def list_jobs():
    return {"jobs": list(jobs.keys()), "count": len(jobs)}
