#!/usr/bin/env python3
import re
from pathlib import Path
import sys

"""
Merge multiple Mermaid classDiagram .mmd group files into a single diagram.

- Reads all .mmd files under architecture/generated_class_diagrams/groups/
- Each file is expected to contain a Mermaid code fence starting with
  ```mermaid and a `classDiagram` header, followed by classes/relations
- Removes code fences and duplicate `classDiagram` headers
- Concatenates all bodies into one `classDiagram`
- Writes output to architecture/generated_class_diagrams/99_groups_combined.mmd

Batch mode (to avoid Mermaid max size limits in editors):
- Splits output into multiple files when cumulative line count exceeds threshold
- Files: 99_groups_combined_p1.mmd, 99_groups_combined_p2.mmd, ...

Notes:
- `classDiagram` does not support subgraphs; we insert comment separators
  like `%% ===== GROUP NAME =====` to keep visual grouping hints.
- Node/class name collisions across groups will merge by Mermaid semantics
  (this is desired for cross-group references).
"""

ROOT = Path(__file__).resolve().parents[2] / "architecture" / "generated_class_diagrams"
GROUPS_DIR = ROOT / "groups"
OUT_FILE = ROOT / "99_groups_combined.mmd"
MAX_LINES_PER_FILE = 1500  # adjust if your viewer supports larger diagrams

FENCE_RE = re.compile(r"^```\s*mermaid\s*$", re.IGNORECASE)
CLASS_HDR_RE = re.compile(r"^\s*classDiagram\s*$", re.IGNORECASE)


def extract_body(text: str) -> str:
    lines = text.splitlines()
    in_fence = False
    captured = []
    for line in lines:
        if FENCE_RE.match(line):
            in_fence = not in_fence
            continue
        if in_fence:
            captured.append(line)
        else:
            # Some files may be raw without fences; capture all
            captured.append(line)
    # Remove leading/trailing empties
    body = "\n".join(captured).strip()
    # Drop a leading classDiagram header if present
    body_lines = [ln for ln in body.splitlines() if ln is not None]
    if body_lines and CLASS_HDR_RE.match(body_lines[0]):
        body_lines = body_lines[1:]
    # Remove any residual fences or trailing backticks
    body_lines = [ln for ln in body_lines if not ln.strip().startswith('```')]
    return "\n".join(body_lines).strip()


def write_batch(batch_parts, idx):
    if idx == 1:
        out = OUT_FILE
    else:
        out = OUT_FILE.with_name(f"99_groups_combined_p{idx}.mmd")
    out.write_text("\n".join(batch_parts) + "\n", encoding="utf-8")
    print(f"Wrote combined diagram: {out}")


def main():
    if not GROUPS_DIR.exists():
        print(f"Groups directory not found: {GROUPS_DIR}")
        sys.exit(1)

    group_files = sorted(GROUPS_DIR.glob("*.mmd"))
    if not group_files:
        print("No group .mmd files found.")
        sys.exit(1)

    parts = ["classDiagram", "%% Combined groups diagram (auto-generated)"]
    current_lines = len(parts)
    batch_index = 1

    for fp in group_files:
        name = fp.stem
        raw = fp.read_text(encoding="utf-8")
        body = extract_body(raw)
        if not body:
            continue
        chunk = [f"%% ===== {name} =====", body]
        prospective = current_lines + sum(s.count('\n') + 1 for s in chunk)
        if prospective > MAX_LINES_PER_FILE and current_lines > 2:
            # flush current batch and start new
            write_batch(parts, batch_index)
            batch_index += 1
            parts = ["classDiagram", "%% Combined groups diagram (auto-generated)"]
            current_lines = len(parts)
        parts.extend(chunk)
        current_lines += sum(s.count('\n') + 1 for s in chunk)

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    write_batch(parts, batch_index)


if __name__ == "__main__":
    main()


