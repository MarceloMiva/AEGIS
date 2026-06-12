import socket
import whois
import dns.resolver

def run_recon(target: str) -> dict:
    result = {
        "target": target,
        "ip": None,
        "whois": {},
        "subdomains": [],
        "dns_records": []
    }

    # IP resolution
    try:
        result["ip"] = socket.gethostbyname(target)
    except:
        result["ip"] = "unresolved"

    # WHOIS
    try:
        w = whois.whois(target)
        result["whois"] = {
            "registrar": str(w.registrar),
            "creation_date": str(w.creation_date),
            "expiration_date": str(w.expiration_date),
            "country": str(w.country)
        }
    except:
        result["whois"] = {}

    # DNS records
    for record_type in ["A", "MX", "NS", "TXT"]:
        try:
            answers = dns.resolver.resolve(target, record_type)
            for r in answers:
                result["dns_records"].append({
                    "type": record_type,
                    "value": str(r)
                })
        except:
            pass

    # Common subdomains
    common = ["www", "mail", "ftp", "api", "dev", "staging", "admin", "vpn"]
    for sub in common:
        try:
            full = f"{sub}.{target}"
            socket.gethostbyname(full)
            result["subdomains"].append(full)
        except:
            pass

    return result
