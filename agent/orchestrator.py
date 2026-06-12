from langgraph.graph import StateGraph, END
from typing import TypedDict, List
from agent.tools.recon import run_recon
from agent.tools.scanner import run_scanner
from agent.tools.classifier import run_classifier
from agent.tools.reporter import run_reporter

class AgentState(TypedDict):
    target: str
    recon_data: dict
    scan_data: dict
    classified_data: dict
    report_path: str
    logs: List[str]

def recon_node(state: AgentState):
    print("[AEGIS] Running recon...")
    result = run_recon(state["target"])
    state["recon_data"] = result
    state["logs"].append("Recon complete")
    return state

def scanner_node(state: AgentState):
    print("[AEGIS] Running vulnerability scan...")
    result = run_scanner(state["target"], state["recon_data"])
    state["scan_data"] = result
    state["logs"].append("Scan complete")
    return state

def classifier_node(state: AgentState):
    print("[AEGIS] Classifying threats via AMD GPU...")
    result = run_classifier(state["scan_data"])
    state["classified_data"] = result
    state["logs"].append("Classification complete")
    return state

def reporter_node(state: AgentState):
    print("[AEGIS] Generating report...")
    path = run_reporter(
        state["target"],
        state["recon_data"],
        state["classified_data"]
    )
    state["report_path"] = path
    state["logs"].append(f"Report saved to {path}")
    return state

def build_agent():
    graph = StateGraph(AgentState)
    graph.add_node("recon", recon_node)
    graph.add_node("scanner", scanner_node)
    graph.add_node("classifier", classifier_node)
    graph.add_node("reporter", reporter_node)
    graph.set_entry_point("recon")
    graph.add_edge("recon", "scanner")
    graph.add_edge("scanner", "classifier")
    graph.add_edge("classifier", "reporter")
    graph.add_edge("reporter", END)
    return graph.compile()

if __name__ == "__main__":
    import sys
    target = sys.argv[1] if len(sys.argv) > 1 else "example.com"
    agent = build_agent()
    result = agent.invoke({
        "target": target,
        "recon_data": {},
        "scan_data": {},
        "classified_data": {},
        "report_path": "",
        "logs": []
    })
    print("\n[AEGIS] Done.")
    print(f"Report: {result['report_path']}")
    for log in result["logs"]:
        print(f"  ✔ {log}")
