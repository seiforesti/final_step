import ast
import os
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set
import sys


@dataclass
class FieldInfo:
    name: str
    type_hint: Optional[str] = None
    is_fk: bool = False
    fk_target: Optional[str] = None


@dataclass
class ClassInfo:
    name: str
    module: str
    bases: List[str] = field(default_factory=list)
    fields: List[FieldInfo] = field(default_factory=list)
    relationships: List[tuple] = field(default_factory=list)  # (target, kind)
    is_enum: bool = False
    table_name: Optional[str] = None


@dataclass
class ModelGraph:
    classes: Dict[str, ClassInfo] = field(default_factory=dict)
    edges: List[tuple] = field(default_factory=list)  # (src, dst, label)


def is_enum_base(base: str) -> bool:
    enum_markers = {"Enum", "enum.Enum"}
    return base.split("(")[0] in enum_markers


def normalize_target(raw: str) -> str:
    # Convert strings like "scan_result.id" or "organization" to class-like "ScanResult" / "Organization"
    token = re.split(r"[\W_\.]+", str(raw).strip())[0]
    if not token:
        return str(raw)
    return token[:1].upper() + token[1:]


def extract_fk_target(call_src: str) -> Optional[str]:
    # heuristics for ForeignKey("table.column") or relationship("Model")
    m = re.search(r"ForeignKey\(\s*['\"]([\w\.]+)['\"]\s*\)", call_src)
    if m:
        return normalize_target(m.group(1))
    m = re.search(r"relationship\(\s*['\"]([\w\.]+)['\"]", call_src)
    if m:
        return normalize_target(m.group(1))
    return None


def parse_model_file(path: str) -> List[ClassInfo]:
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()
    try:
        tree = ast.parse(src, filename=path)
    except SyntaxError:
        return []

    module = os.path.relpath(path).replace(os.sep, ".")
    results: List[ClassInfo] = []

    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            bases = [ast.unparse(b) if hasattr(ast, "unparse") else getattr(b, "id", str(b)) for b in node.bases]
            is_enum = any(is_enum_base(b) for b in bases)
            ci = ClassInfo(name=node.name, module=module, bases=bases, is_enum=is_enum)

            # fields (simple targets and Assign annotations)
            for body_item in node.body:
                if isinstance(body_item, ast.AnnAssign) and isinstance(body_item.target, ast.Name):
                    name = body_item.target.id
                    type_hint = None
                    if body_item.annotation is not None:
                        try:
                            type_hint = ast.unparse(body_item.annotation)  # type: ignore[attr-defined]
                        except Exception:
                            type_hint = None
                    value_src = ""
                    if body_item.value is not None:
                        try:
                            value_src = ast.unparse(body_item.value)  # type: ignore[attr-defined]
                        except Exception:
                            value_src = ""
                    fk_target = extract_fk_target(value_src) if value_src else None
                    field_info = FieldInfo(name=name, type_hint=type_hint, is_fk=bool(fk_target), fk_target=fk_target)
                    ci.fields.append(field_info)

                elif isinstance(body_item, ast.Assign):
                    for t in body_item.targets:
                        if isinstance(t, ast.Name):
                            name = t.id
                            value_src = ""
                            if body_item.value is not None:
                                try:
                                    value_src = ast.unparse(body_item.value)  # type: ignore[attr-defined]
                                except Exception:
                                    value_src = ""
                            # capture __tablename__ if string literal
                            if name == "__tablename__":
                                try:
                                    if isinstance(body_item.value, ast.Constant) and isinstance(body_item.value.value, str):
                                        ci.table_name = str(body_item.value.value)
                                except Exception:
                                    pass
                            fk_target = extract_fk_target(value_src) if value_src else None
                            ci.fields.append(FieldInfo(name=name, is_fk=bool(fk_target), fk_target=fk_target))

            results.append(ci)

    return results


def scan_models(root: str) -> ModelGraph:
    graph = ModelGraph()
    total = 0
    for dirpath, _, filenames in os.walk(root):
        for fn in filenames:
            if not fn.endswith(".py"):
                continue
            path = os.path.join(dirpath, fn)
            print(f"Scanning: {os.path.relpath(path)}")
            sys.stdout.flush()
            class_list = parse_model_file(path)
            for ci in class_list:
                key = ci.name
                graph.classes[key] = ci
                # add edges for fk/relationship hints
                for fld in ci.fields:
                    if fld.fk_target:
                        graph.edges.append((ci.name, fld.fk_target, "fk/rel"))
            total += 1
    # Build table_name -> class map
    table_to_class: Dict[str, str] = {}
    for cname, ci in graph.classes.items():
        if ci.table_name:
            table_to_class[ci.table_name.lower()] = cname

    # Normalize existing edges that came from table.column to class names
    norm_edges = []
    for (src, dst, label) in graph.edges:
        key = str(dst).split(".")[0].lower()
        if key in table_to_class:
            norm_edges.append((src, table_to_class[key], label))
        else:
            norm_edges.append((src, normalize_target(dst), label))
    graph.edges = norm_edges

    print(f"Parsed {total} files. Inferring edges from type hints...")
    sys.stdout.flush()
    # Post-process: infer edges from type hints that reference known classes (token-based, no regex per class)
    known: Set[str] = set(graph.classes.keys())
    lower_map: Dict[str, str] = {k.lower(): k for k in known}
    ident_re = re.compile(r"[A-Za-z_][A-Za-z0-9_]*")
    for ci in graph.classes.values():
        for fld in ci.fields:
            if not fld.type_hint:
                continue
            tokens = ident_re.findall(fld.type_hint)
            for tok in tokens:
                # prefer exact match first
                if tok in known and tok != ci.name:
                    graph.edges.append((ci.name, tok, "type_hint"))
                    continue
                # fallback: case-insensitive map
                low = tok.lower()
                if low in lower_map and lower_map[low] != ci.name:
                    graph.edges.append((ci.name, lower_map[low], "type_hint"))
    return graph


def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--models-root", default="app/models", help="Root directory to scan")
    ap.add_argument("--out-json", default="architecture/generated_class_diagrams/models_graph.json")
    args = ap.parse_args()

    os.makedirs(os.path.dirname(args.out_json), exist_ok=True)
    graph = scan_models(args.models_root)
    import json
    with open(args.out_json, "w", encoding="utf-8") as f:
        json.dump({
            "classes": {k: {
                "module": v.module,
                "bases": v.bases,
                "is_enum": v.is_enum,
                "fields": [{"name": fld.name, "type": fld.type_hint, "is_fk": fld.is_fk, "fk_target": fld.fk_target} for fld in v.fields]
            } for k, v in graph.classes.items()},
            "edges": graph.edges
        }, f, indent=2)
    print(f"Wrote graph to {args.out_json}")


if __name__ == "__main__":
    main()


