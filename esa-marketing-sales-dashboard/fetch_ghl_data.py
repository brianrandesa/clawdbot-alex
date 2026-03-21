#!/usr/bin/env python3
"""Fetch all GHL data via curl and output analysis."""
import json
import subprocess
import sys
import time

API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6Imw3SjZ5aEtPSGlVVlBFdGVUY3NxIiwidmVyc2lvbiI6MSwiaWF0IjoxNzczNjk3ODIzMzQ2LCJzdWIiOiJ0NXpPeVhFNU5QSXZZWEZxenVSYiJ9.yjPcwMchtjsxZnusy-Pp8gdopQUy0HDAX8ta-YiTAy8"

def curl_get(url):
    url = url.replace("http://rest.gohighlevel.com", "https://rest.gohighlevel.com")
    result = subprocess.run(
        ["curl", "-sL", url, "-H", f"Authorization: Bearer {API_KEY}"],
        capture_output=True, text=True
    )
    if not result.stdout.strip():
        print(f"  WARNING: empty response from {url[:80]}", file=sys.stderr)
        return {"contacts": [], "meta": {}}
    return json.loads(result.stdout)

def paginate_contacts():
    contacts = []
    url = "https://rest.gohighlevel.com/v1/contacts/?limit=100"
    page = 0
    while url and page < 50:
        data = curl_get(url)
        batch = data.get("contacts", [])
        contacts.extend(batch)
        meta = data.get("meta", {})
        next_url = meta.get("nextPageUrl", "")
        url = next_url if next_url else None
        page += 1
        print(f"  Page {page}: {len(batch)} contacts (total: {len(contacts)})", file=sys.stderr)
        time.sleep(0.3)
    return contacts

def main():
    print("Fetching all contacts...", file=sys.stderr)
    contacts = paginate_contacts()
    print(f"\nTOTAL: {len(contacts)} contacts\n", file=sys.stderr)

    SOURCES = [
        "src-fb-lead-form-ss", "src-vsl", "src-outbound",
        "src-coldcall", "src-organic", "src-brian-direct"
    ]
    STATUSES = [
        "status-new-lead", "status-booked", "status-showed",
        "status-offer-made", "status-contract-sent",
        "status-closed-won", "status-closed-lost", "status-nurture"
    ]

    source_tags = {}
    status_tags = {}
    all_tags = {}
    source_status_matrix = {s: {st: 0 for st in STATUSES} for s in SOURCES}
    untagged_source = {st: 0 for st in STATUSES}

    for c in contacts:
        tags = [t.lower().strip() for t in c.get("tags", [])]
        for t in tags:
            all_tags[t] = all_tags.get(t, 0) + 1
            if t.startswith("src-"):
                source_tags[t] = source_tags.get(t, 0) + 1
            if t.startswith("status-"):
                status_tags[t] = status_tags.get(t, 0) + 1

        src = None
        for s in SOURCES:
            if s in tags:
                src = s
                break

        for st in STATUSES:
            if st in tags:
                if src:
                    source_status_matrix[src][st] += 1
                else:
                    untagged_source[st] += 1

    print("=== SOURCE TAGS ===", file=sys.stderr)
    for t in sorted(source_tags.keys()):
        print(f"  {t}: {source_tags[t]}", file=sys.stderr)

    print("\n=== STATUS TAGS ===", file=sys.stderr)
    for t in sorted(status_tags.keys()):
        print(f"  {t}: {status_tags[t]}", file=sys.stderr)

    print("\n=== SOURCE x STATUS MATRIX ===", file=sys.stderr)
    for src in SOURCES:
        statuses = source_status_matrix[src]
        vals = ", ".join(f"{k.replace('status-','')}: {v}" for k, v in statuses.items() if v > 0)
        if vals:
            print(f"  {src}: {vals}", file=sys.stderr)
    uvals = ", ".join(f"{k.replace('status-','')}: {v}" for k, v in untagged_source.items() if v > 0)
    if uvals:
        print(f"  (no source tag): {uvals}", file=sys.stderr)

    print("\n=== ALL TAGS (top 60) ===", file=sys.stderr)
    for t, c in sorted(all_tags.items(), key=lambda x: -x[1])[:60]:
        print(f"  {t}: {c}", file=sys.stderr)

    output = {
        "totalContacts": len(contacts),
        "sourceTags": source_tags,
        "statusTags": status_tags,
        "sourceStatusMatrix": source_status_matrix,
        "untaggedSource": untagged_source,
        "allTags": dict(sorted(all_tags.items(), key=lambda x: -x[1])[:80])
    }
    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()
