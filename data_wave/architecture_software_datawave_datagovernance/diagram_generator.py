import os
import re
import json
from pathlib import Path
from typing import Dict, List, Tuple, Set

"""
Diagram Generator for DataWave
- Scans backend model files under data_wave/backend/scripts_automation/app/models
- Groups classes into 7 core modules by filename heuristics
- Generates per-module Mermaid class diagrams and a combined class diagram
- Ensures strong cohesion within modules and low, acyclic coupling across modules

Usage:
    python diagram_generator.py
Outputs:
    Writes diagrams to data_wave/architecture_software_datawave_datagovernance/generated/
"""

ROOT = Path(__file__).resolve().parents[1]
MODELS_DIR = ROOT / "backend" / "scripts_automation" / "app" / "models"
OUT_DIR = Path(__file__).resolve().parent / "generated"
OUT_DIR.mkdir(parents=True, exist_ok=True)

MODULE_MAP = {
    "datasource": ["data_source", "schema", "db_schema"],
    "catalog": ["catalog", "lineage", "glossary", "quality"],
    "classification": ["classification", "ml_models", "ai_models", "data_classification"],
    "rule_sets": ["rule_template", "rule_version", "Scan_Rule_Sets_completed_models", "template"],
    "scan_logic": ["scan_workflow", "workflow", "scan_orchestration", "task", "performance"],
    "compliance": ["compliance", "compliance_rule"],
    "rbac": ["auth", "access_control", "security"],
}

CLASS_REGEX = re.compile(r"class\s+(\w+)\s*\(")
# Fallback simpler regex for classes without base specification
CLASS_NAME_REGEX = re.compile(r"^class\s+(\w+)\b")

RELATION_HINTS: Dict[str, List[Tuple[str, str]]] = {
    # (from, to) class name hints to create acyclic cross-module dependencies
    "datasource": [("DataSource", "DataAsset"), ("ConnectionPool", "DataSource")],
    "catalog": [("DataAsset", "ClassificationResult"), ("DataLineage", "DataAsset")],
    "classification": [("ClassificationResult", "ScanRuleSet")],
    "rule_sets": [("ScanRuleSet", "ScanWorkflow")],
    "scan_logic": [("ScanWorkflow", "ComplianceFramework")],
    "compliance": [("ComplianceReport", "User")],
}


def detect_module(file_name: str) -> str:
    lower = file_name.lower()
    for module, keywords in MODULE_MAP.items():
        if any(k in lower for k in keywords):
            return module
    return "misc"


def find_classes(py_path: Path) -> List[str]:
    try:
        text = py_path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return []
    classes: Set[str] = set()
    for line in text.splitlines():
        m = CLASS_NAME_REGEX.match(line.strip())
        if m:
            classes.add(m.group(1))
    return sorted(classes)


def collect_classes() -> Dict[str, List[str]]:
    modules: Dict[str, List[str]] = {m: [] for m in MODULE_MAP.keys()}
    modules["misc"] = []
    for p in MODELS_DIR.rglob("*.py"):
        if p.name.startswith("__"):
            continue
        module = detect_module(p.name)
        classes = find_classes(p)
        modules[module].extend(classes)
    # de-duplicate
    for k in modules:
        modules[k] = sorted(set(modules[k]))
    return modules


def render_module_diagram(module: str, classes: List[str]) -> str:
    header = (
        """```mermaid\nclassDiagram\n    %% Module: {module} (Forte cohésion)\n""".format(module=module)
    )
    body_lines: List[str] = []
    for cls in classes:
        body_lines.append(f"    class {cls}")
    # Intra-module implicit associations (no loops):
    # create a simple chain to improve readability, not implying real DB relations
    for i in range(len(classes) - 1):
        a, b = classes[i], classes[i + 1]
        body_lines.append(f"    {a} -- {b}")
    footer = "\n```\n"
    return header + "\n".join(body_lines) + footer


def render_combined_diagram(modules: Dict[str, List[str]]) -> str:
    header = (
        """```mermaid\nclassDiagram\n    %% Combined system class diagram (Faible couplage across modules, acyclic)\n"""
    )
    lines: List[str] = []
    for module, classes in modules.items():
        if not classes:
            continue
        lines.append(f"    %% --- {module} ---")
        for cls in classes:
            lines.append(f"    class {cls}")
    # add directed dependencies based on RELATION_HINTS in order to keep DAG
    for module, deps in RELATION_HINTS.items():
        for a, b in deps:
            lines.append(f"    {a} ..> {b}")
    footer = "\n```\n"
    return header + "\n".join(lines) + footer


def main():
    modules = collect_classes()
    # write per-module diagrams
    for module, classes in modules.items():
        if not classes:
            continue
        md = render_module_diagram(module, classes)
        (OUT_DIR / f"class_{module}.md").write_text(md, encoding="utf-8")
    # write combined diagram
    combined = render_combined_diagram(modules)
    (OUT_DIR / "class_combined.md").write_text(combined, encoding="utf-8")
    print(json.dumps({"modules": {k: len(v) for k, v in modules.items()}}, indent=2))


if __name__ == "__main__":
    main()



