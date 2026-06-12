import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

const RISK_COLORS = {
  CRITICAL: "#ED1C24",
  HIGH: "#FF6B35",
  MEDIUM: "#F59E0B",
  LOW: "#22C55E",
  UNKNOWN: "#888",
};

export default function App() {
  const [target, setTarget] = useState("");
  const [jobId, setJobId] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const startScan = async () => {
    if (!target) return;
    setLoading(true);
    setJob(null);
    setLogs([`[${time()}] Initiating scan on ${target}...`]);
    try {
      const res = await axios.post(`${API}/scan`, { target });
      setJobId(res.data.job_id);
      setLogs(l => [...l, `[${time()}] Job queued: ${res.data.job_id}`]);
    } catch (e) {
      setLogs(l => [...l, `[${time()}] Error: ${e.message}`]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/scan/${jobId}`);
        const data = res.data;
        if (data.status === "running") {
          setLogs(l => l[l.length-1]?.includes("Running") ? l :
            [...l, `[${time()}] Running agent pipeline...`]);
        }
        if (data.status === "done") {
          setJob(data.result);
          setLogs(l => [...l, `[${time()}] ✔ Scan complete`]);
          setLoading(false);
          clearInterval(interval);
        }
        if (data.status === "error") {
          setLogs(l => [...l, `[${time()}] ✘ Error: ${data.error}`]);
          setLoading(false);
          clearInterval(interval);
        }
      } catch(e) {}
    }, 2000);
    return () => clearInterval(interval);
  }, [jobId]);

  const time = () => new Date().toLocaleTimeString();
  const risk = job?.classified_data?.overall_risk || null;
  const findings = job?.classified_data?.findings || [];
  const cves = job?.scan_data?.cves || [];
  const subdomains = job?.recon_data?.subdomains || [];

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logo}>⚔️ AEGIS</div>
        <div style={s.subtitle}>Autonomous AI Security Triage · AMD GPU</div>
      </div>

      {/* Scan input */}
      <div style={s.card}>
        <div style={s.label}>TARGET DOMAIN</div>
        <div style={s.row}>
          <input
            style={s.input}
            value={target}
            onChange={e => setTarget(e.target.value)}
            onKeyDown={e => e.key === "Enter" && startScan()}
            placeholder="e.g. example.com"
          />
          <button
            style={{...s.btn, opacity: loading ? 0.6 : 1}}
            onClick={startScan}
            disabled={loading}
          >
            {loading ? "SCANNING..." : "SCAN"}
          </button>
        </div>
      </div>

      {/* Terminal log */}
      {logs.length > 0 && (
        <div style={s.terminal}>
          {logs.map((l, i) => (
            <div key={i} style={s.logLine}>{l}</div>
          ))}
          {loading && <div style={s.cursor}>▊</div>}
        </div>
      )}

      {/* Results */}
      {job && (
        <>
          {/* Risk badge */}
          <div style={s.card}>
            <div style={s.label}>OVERALL RISK</div>
            <div style={{
              ...s.riskBadge,
              background: RISK_COLORS[risk] || "#888"
            }}>
              {risk || "UNKNOWN"}
            </div>
            <p style={s.summary}>
              {job.classified_data?.summary || "No summary."}
            </p>
          </div>

          {/* Recon */}
          <div style={s.card}>
            <div style={s.label}>RECONNAISSANCE</div>
            <div style={s.statRow}>
              <Stat label="IP" value={job.recon_data?.ip || "N/A"} />
              <Stat label="Subdomains" value={subdomains.length} />
              <Stat label="DNS Records"
                value={job.recon_data?.dns_records?.length || 0} />
            </div>
            {subdomains.length > 0 && (
              <div style={s.tagWrap}>
                {subdomains.map((s,i) => (
                  <span key={i} style={s2.tag}>{s}</span>
                ))}
              </div>
            )}
          </div>

          {/* CVEs */}
          {cves.length > 0 && (
            <div style={s.card}>
              <div style={s.label}>CVEs DETECTED</div>
              {cves.map((c, i) => (
                <div key={i} style={s.cveRow}>
                  <span style={{
                    ...s.severityTag,
                    background: RISK_COLORS[c.severity] || "#888"
                  }}>{c.severity}</span>
                  <span style={s.cveId}>{c.id}</span>
                  <span style={s.cveScore}>Score: {c.score}</span>
                  <p style={s.cveDesc}>{c.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Findings */}
          {findings.length > 0 && (
            <div style={s.card}>
              <div style={s.label}>FINDINGS & RECOMMENDATIONS</div>
              {findings.map((f, i) => (
                <div key={i} style={s.findingRow}>
                  <span style={{
                    ...s.severityTag,
                    background: RISK_COLORS[f.severity] || "#888"
                  }}>{f.severity}</span>
                  <div>
                    <div style={s.findingId}>{f.id}</div>
                    <div style={s.findingRec}>{f.recommendation}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MITRE */}
          {job.classified_data?.mitre_techniques?.length > 0 && (
            <div style={s.card}>
              <div style={s.label}>MITRE ATT&CK</div>
              <div style={s.tagWrap}>
                {job.classified_data.mitre_techniques.map((t,i) => (
                  <span key={i} style={s2.mitreTag}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Report */}
          <div style={{...s.card, textAlign:"center"}}>
            <div style={s.label}>REPORT</div>
            <p style={s.summary}>
              PDF saved to: <code>{job.report_path}</code>
            </p>
          </div>
        </>
      )}

      <div style={s.footer}>
        AEGIS · Built by YSIM MARCELO · MarceloMiva · AMD Developer Hackathon ACT II
      </div>
    </div>
  );
}

const Stat = ({label, value}) => (
  <div style={s.stat}>
    <div style={s.statVal}>{value}</div>
    <div style={s.statLabel}>{label}</div>
  </div>
);

const s = {
  root: { background:"#0a0a0a", minHeight:"100vh", color:"#fff",
    fontFamily:"'Courier New', monospace", padding:"0 0 40px" },
  header: { background:"#111", borderBottom:"2px solid #ED1C24",
    padding:"24px 24px 16px", marginBottom:24 },
  logo: { fontSize:28, fontWeight:"bold", color:"#ED1C24",
    letterSpacing:4 },
  subtitle: { fontSize:12, color:"#666", letterSpacing:2,
    marginTop:4 },
  card: { background:"#111", border:"1px solid #222",
    borderRadius:6, margin:"0 16px 16px", padding:20 },
  label: { fontSize:10, color:"#ED1C24", letterSpacing:3,
    marginBottom:12 },
  row: { display:"flex", gap:8 },
  input: { flex:1, background:"#000", border:"1px solid #333",
    borderRadius:4, padding:"10px 14px", color:"#fff",
    fontSize:14, fontFamily:"inherit" },
  btn: { background:"#ED1C24", border:"none", borderRadius:4,
    padding:"10px 20px", color:"#fff", fontWeight:"bold",
    fontSize:13, cursor:"pointer", letterSpacing:2 },
  terminal: { background:"#000", border:"1px solid #1a1a1a",
    margin:"0 16px 16px", padding:16, borderRadius:6,
    fontSize:12, color:"#22C55E" },
  logLine: { marginBottom:4, lineHeight:1.6 },
  cursor: { color:"#ED1C24", animation:"blink 1s infinite" },
  riskBadge: { display:"inline-block", padding:"8px 24px",
    borderRadius:4, fontWeight:"bold", fontSize:20,
    letterSpacing:4, marginBottom:12 },
  summary: { fontSize:13, color:"#aaa", lineHeight:1.6,
    marginTop:8 },
  statRow: { display:"flex", gap:16, marginBottom:12 },
  stat: { background:"#0a0a0a", border:"1px solid #222",
    borderRadius:4, padding:"12px 16px", flex:1,
    textAlign:"center" },
  statVal: { fontSize:22, fontWeight:"bold", color:"#ED1C24" },
  statLabel: { fontSize:10, color:"#666", marginTop:4,
    letterSpacing:2 },
  tagWrap: { display:"flex", flexWrap:"wrap", gap:8 },
  cveRow: { background:"#0a0a0a", border:"1px solid #1a1a1a",
    borderRadius:4, padding:12, marginBottom:8 },
  cveId: { fontWeight:"bold", fontSize:13, marginLeft:8 },
  cveScore: { fontSize:12, color:"#888", marginLeft:8 },
  cveDesc: { fontSize:11, color:"#666", marginTop:6,
    lineHeight:1.5 },
  severityTag: { fontSize:10, padding:"2px 8px", borderRadius:3,
    fontWeight:"bold", letterSpacing:1 },
  findingRow: { display:"flex", gap:12, alignItems:"flex-start",
    background:"#0a0a0a", border:"1px solid #1a1a1a",
    borderRadius:4, padding:12, marginBottom:8 },
  findingId: { fontSize:13, fontWeight:"bold", marginBottom:4 },
  findingRec: { fontSize:12, color:"#aaa", lineHeight:1.5 },
  footer: { textAlign:"center", fontSize:10, color:"#333",
    letterSpacing:2, marginTop:40, padding:"0 16px" },
};

const s2 = {
  tag: { background:"#1a1a1a", border:"1px solid #333",
    borderRadius:3, padding:"3px 8px", fontSize:11,
    color:"#aaa" },
  mitreTag: { background:"#1a0000", border:"1px solid #ED1C24",
    borderRadius:3, padding:"3px 8px", fontSize:11,
    color:"#ED1C24" },
};
