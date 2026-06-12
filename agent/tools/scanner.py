import requests
import httpx

NVD_API = "https://services.nvd.nist.gov/rest/json/cves/2.0"

def check_headers(target: str) -> list:
    findings = []
    try:
        r = httpx.get(f"http://{target}", timeout=10, follow_redirects=True)
        headers = r.headers
        security_headers = [
            "strict-transport-security",
            "x-content-type-options",
            "x-frame-options",
            "content-security-policy",
            "x-xss-protection"
        ]
        for h in security_headers:
            if h not in headers:
                findings.append({
                    "type": "missing_header",
                    "header": h,
                    "severity": "MEDIUM",
                    "description": f"Missing security header: {h}"
                })
    except Exception as e:
        findings.append({
            "type": "error",
            "description": str(e),
            "severity": "INFO"
        })
    return findings

def lookup_cves(keyword: str) -> list:
    cves = []
    try:
        params = {"keywordSearch": keyword, "resultsPerPage": 5}
        r = requests.get(NVD_API, params=params, timeout=15)
        data = r.json()
        for item in data.get("vulnerabilities", []):
            cve = item.get("cve", {})
            cve_id = cve.get("id", "N/A")
            desc = cve.get("descriptions", [{}])[0].get("value", "")
            metrics = cve.get("metrics", {})
            score = "N/A"
            severity = "N/A"
            if "cvssMetricV31" in metrics:
                cvss = metrics["cvssMetricV31"][0]["cvssData"]
                score = cvss.get("baseScore", "N/A")
                severity = cvss.get("baseSeverity", "N/A")
            cves.append({
                "id": cve_id,
                "description": desc[:200],
                "score": score,
                "severity": severity
            })
    except Exception as e:
        print(f"CVE lookup error: {e}")
    return cves

def run_scanner(target: str, recon_data: dict) -> dict:
    print(f"[SCANNER] Scanning {target}...")
    return {
        "target": target,
        "header_findings": check_headers(target),
        "cves": lookup_cves(target.split(".")[0])
    }
