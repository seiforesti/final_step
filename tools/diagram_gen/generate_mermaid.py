import json
import os
import re
from collections import defaultdict, deque
from typing import Dict, List, Tuple, Set


def sanitize(name: str) -> str:
    return name.replace("\"", "\'")


def to_class_guess(name: str) -> str:
    # normalize targets like "organization.id" or "scan_result" to "Organization" / "ScanResult"
    token = re.split(r"[\W_\.]+", str(name).strip())[0]
    if not token:
        return str(name)
    return token[:1].upper() + token[1:]


def make_class_block(name: str, cls: Dict) -> str:
    lines = [f"  class {name} {{"]
    fields = cls.get("fields", [])
    for f in fields:
        hint = f.get("type") or ""
        lines.append(f"    +{f['name']}: {sanitize(hint)}")
    lines.append("  }")
    return "\n".join(lines)


def build_groups(classes: Dict[str, Dict]) -> Dict[str, List[str]]:
    groups = {
        "AUTH_RBAC": [],
        "DATA_SOURCES": [],
        "SCANS": [],
        "CLASSIFICATION": [],
        "CATALOG": [],
        "COMPLIANCE": [],
        "RACINE": [],
    }
    for name in classes.keys():
        lname = name.lower()
        if any(x in lname for x in ["user", "role", "permission", "session", "auth", "rbac"]):
            groups["AUTH_RBAC"].append(name)
        elif "datasource" in lname or lname.endswith("source") or "connector" in lname:
            groups["DATA_SOURCES"].append(name)
        elif lname.startswith("scan") or "workflow" in lname or "orchestrat" in lname:
            groups["SCANS"].append(name)
        elif "classif" in lname or "taxonomy" in lname:
            groups["CLASSIFICATION"].append(name)
        elif any(x in lname for x in ["catalog", "asset", "lineage", "tag", "glossary"]):
            groups["CATALOG"].append(name)
        elif any(x in lname for x in ["compliance", "policy", "framework", "assessment", "audit"]):
            groups["COMPLIANCE"].append(name)
        elif "racine" in lname or "orchestrationmaster" in lname:
            groups["RACINE"].append(name)
    # sort names for stable output
    for g in groups:
        groups[g] = sorted(set(groups[g]))
    return groups


def emit_group_diagram(group_name: str, class_names: List[str], classes: Dict[str, Dict], edges: List[Tuple[str, str, str]], out_path: str):
    content: List[str] = ["classDiagram"]
    in_group: Set[str] = set(class_names)
    # order classes using degree (hub first) and topo-like fallback
    deg_in = defaultdict(int)
    deg_out = defaultdict(int)
    adj = defaultdict(set)
    rev_adj = defaultdict(set)
    for (src, raw_tgt, _label) in edges:
        tgt = to_class_guess(raw_tgt)
        if src in in_group and tgt in in_group:
            deg_out[src] += 1
            deg_in[tgt] += 1
            adj[src].add(tgt)
            rev_adj[tgt].add(src)
    def score(n: str) -> Tuple[int,int]:
        return (-deg_out[n], deg_in[n])  # hubs first (high out, low in)
    ordered = sorted(in_group, key=score)

    # nodes: all classes with fields
    for name in ordered:
        content.append(make_class_block(name, classes[name]))

    # Build acyclic, cohesive edges (maximum spanning forest rooted at hub)
    # pick center as best-scoring node
    center = ordered[0] if ordered else None
    # candidate directed edges inside group
    cand = []
    for (src, raw_tgt, _label) in edges:
        tgt = to_class_guess(raw_tgt)
        if src in in_group and tgt in in_group and src != tgt:
            cand.append((src, tgt))
    # sort edges to favor from center and high out-degree
    def e_score(e):
        s, t = e
        return (
            0 if s == center else 1,
            -deg_out[s],
            deg_in[t],
            s, t,
        )
    cand.sort(key=e_score)

    # Union-Find to avoid cycles
    parent = {n: n for n in in_group}
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    def union(a, b):
        ra, rb = find(a), find(b)
        if ra == rb:
            return False
        parent[rb] = ra
        return True

    seen = set()
    tree_edges = []
    for (s, t) in cand:
        if (s, t) in seen:
            continue
        # avoid cycles: union-find on undirected pair
        if union(s, t):
            seen.add((s, t))
            tree_edges.append((s, t))

    # attach isolated nodes to center with dashed dependency to signal cohesion
    connected = set([center]) if center else set()
    for (s, t) in tree_edges:
        connected.add(s); connected.add(t)
    inferred_edges = []
    if center:
        for n in in_group:
            if n not in connected and n != center:
                inferred_edges.append((center, n))

    # emit edges
    for (s, t) in tree_edges:
        content.append(f"  {s} \"1\" --> \"0..*\" {t}")
    for (s, t) in inferred_edges:
        content.append(f"  {s} ..> {t}")

    # minimal styling per group for readability
    content.append("  classDef domain fill:#F8FAFF,stroke:#111827,color:#111827")
    if in_group:
        content.append("  class " + ",".join(sorted(in_group)) + " domain")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(content) + "\n")


def emit_overview_flow(groups: Dict[str, List[str]], out_path: str):
    content = ["flowchart TB", "  classDef hub fill:#1a237e,stroke:#0d133f,stroke-width:2px,color:#ffffff"]
    # subgraphs
    for g in groups:
        content.append(f"  subgraph {g}")
        content.append("    direction TB")
        content.append(f"    {g}_node[{g}]")
        content.append("  end")
    # a simple chain to avoid loops
    keys = [k for k in groups.keys() if groups[k]]
    for i in range(len(keys) - 1):
        content.append(f"  {keys[i]}_node --> {keys[i+1]}_node")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(content) + "\n")


def split_domain_outputs(group: str, names: List[str], classes: Dict[str, Dict]) -> Dict[str, List[str]]:
    entities, enums, bridges = [], [], []
    for n in names:
        if classes[n].get("is_enum"):
            enums.append(n)
        elif any(x in n.lower() for x in ["_link", "_assoc", "association", "bridge", "_map", "mapping"]):
            bridges.append(n)
        else:
            entities.append(n)
    return {"entities": entities, "enums": enums, "bridges": bridges}


def emit_cross_domain_service_edges(groups: Dict[str, List[str]], edges: List[Tuple[str, str, str]], out_path: str):
    # flowchart of domains with edges when src group != tgt group
    domain_of = {}
    for g, names in groups.items():
        for n in names:
            domain_of[n] = g
    content = ["flowchart TB", "  classDef svc fill:#e5e7eb,stroke:#111827,color:#111827"]
    for g in groups:
        content.append(f"  {g}[{g}]")
    seen = set()
    for (src, raw_tgt, _label) in edges:
        sdom = domain_of.get(src)
        tgt = to_class_guess(raw_tgt)
        tdom = domain_of.get(tgt)
        if not sdom or not tdom or sdom == tdom:
            continue
        key = (sdom, tdom)
        if key in seen:
            continue
        seen.add(key)
        content.append(f"  {sdom} --> {tdom}")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(content) + "\n")


def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--graph-json", default="architecture/generated_class_diagrams/models_graph.json")
    ap.add_argument("--out-dir", default="architecture/generated_class_diagrams")
    args = ap.parse_args()

    with open(args.graph_json, "r", encoding="utf-8") as f:
        graph = json.load(f)
    classes: Dict[str, Dict] = graph.get("classes", {})
    edges: List[Tuple[str, str, str]] = graph.get("edges", [])

    groups = build_groups(classes)

    # emit overview flow
    emit_overview_flow(groups, os.path.join(args.out_dir, "00_overview_flow.mmd"))

    # emit per-group class diagrams and splits
    for g, names in groups.items():
        if not names:
            continue
        # split
        split = split_domain_outputs(g, names, classes)
        base_dir = os.path.join(args.out_dir, f"groups")
        os.makedirs(base_dir, exist_ok=True)
        # entities
        if split["entities"]:
            emit_group_diagram(g, split["entities"], classes, edges, os.path.join(base_dir, f"{g}.mmd"))
        # enums
        if split["enums"]:
            emit_group_diagram(g + "_ENUMS", split["enums"], classes, edges, os.path.join(base_dir, f"{g}_ENUMS.mmd"))
        # bridges
        if split["bridges"]:
            emit_group_diagram(g + "_BRIDGES", split["bridges"], classes, edges, os.path.join(base_dir, f"{g}_BRIDGES.mmd"))

    # cross-domain service edges overview
    emit_cross_domain_service_edges(groups, edges, os.path.join(args.out_dir, "98_cross_domain_service_edges.mmd"))

    print(f"Generated diagrams in {args.out_dir}")


if __name__ == "__main__":
    main()


