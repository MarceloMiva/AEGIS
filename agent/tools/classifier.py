import ollama

SYSTEM_PROMPT = """You are a cybersecurity threat analyst.
Given a list of vulnerabilities and CVEs, analyze and return a JSON response with:
- overall_risk: (CRITICAL/HIGH/MEDIUM/LOW)
- summary: brief executive summary
- findings: list of {id, severity, recommendation}
- mitre_techniques: relevant MITRE ATT&CK techniques
Respond ONLY with valid JSON. No extra text."""

def run_classifier(scan_data: dict) -> dict:
    print("[CLASSIFIER] Running GPU inference via Ollama...")

    findings_text = ""

    for h in scan_data.get("header_findings", []):
        findings_text += f"- Missing header: {h.get('header','?')} [{h.get('severity','?')}]\n"

    for cve in scan_data.get("cves", []):
        findings_text += f"- CVE: {cve['id']} | Score: {cve['score']} | {cve['description'][:100]}\n"

    if not findings_text:
        findings_text = "No findings detected."

    prompt = f"""Analyze these security findings for target: {scan_data.get('target', 'unknown')}

{findings_text}

Return JSON analysis."""

    try:
        response = ollama.chat(
            model="mistral",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ]
        )
        import json
        content = response["message"]["content"]
        clean = content.strip().replace("```json","").replace("```","")
        return json.loads(clean)
    except Exception as e:
        print(f"[CLASSIFIER] Error: {e}")
        return {
            "overall_risk": "UNKNOWN",
            "summary": "Classification failed.",
            "findings": [],
            "mitre_techniques": []
        }
