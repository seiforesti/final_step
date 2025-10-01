#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / "architecture" / "generated_class_diagrams"
GROUPS_DIR = ROOT / "groups"
OUT_DIR = ROOT / "presentation_groups"

CENTERS = {
    "DATA_SOURCES": "DataSource",
    "AUTH_RBAC": "User",
    "CATALOG": "CatalogItem",
    "SCANS": "Scan",
    "CLASSIFICATION": "ClassificationResult",
    "COMPLIANCE": "ComplianceRule",
    "RACINE": "RacineOrchestrationMaster",
}

CLASS_RE = re.compile(r"^\s*class\s+(\w+)\s*\{", re.MULTILINE)


def extract_classes(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8", errors="ignore")
    return CLASS_RE.findall(text)


def build_diagram(group: str, classes: list[str]) -> str:
    lines = ["classDiagram", f"%% Presentation view for {group} (all classes, acyclic star around center)"]
    center = CENTERS.get(group)
    if center is None or center not in classes:
        # fallback: pick the first class as center
        center = classes[0] if classes else f"{group}Center"
        if center not in classes:
            classes = [center] + classes
    # declare all classes without fields
    for c in classes:
        lines.append(f"  class {c}")
    # add edges from center to others (no loops)
    for c in classes:
        if c == center:
            continue
        lines.append(f"  {center} \"1\" --> \"0..*\" {c}")
    return "\n".join(lines) + "\n"


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for fp in GROUPS_DIR.glob("*.mmd"):
        group = fp.stem.split("_")[0]
        classes = extract_classes(fp)
        if not classes:
            continue
        content = build_diagram(group, classes)
        (OUT_DIR / f"{group}_PRESENTATION.mmd").write_text(content, encoding="utf-8")
    print(f"Wrote presentation diagrams to {OUT_DIR}")


if __name__ == "__main__":
    main()
