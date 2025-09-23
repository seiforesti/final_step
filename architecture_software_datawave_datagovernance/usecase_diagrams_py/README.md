# DataWave Use Case Diagrams (Python DSL → PlantUML)

This folder contains a Python DSL to generate advanced Use Case diagrams as PlantUML `.puml` files for the DataWave Data Governance system.

## Quick Start

- Generate all diagrams (global + 7 modules):
```bash
python3 generate_usecase_diagrams.py
```
- Generate and render to SVG (if `plantuml` is installed):
```bash
python3 generate_usecase_diagrams.py --render
```
- Generate a specific diagram:
```bash
python3 generate_usecase_diagrams.py --only classification
```

Outputs are written to `out/` as `.puml` (and `.svg` if `--render`).

## Prerequisites for Rendering (optional)
- PlantUML CLI: `sudo apt-get install plantuml`
  - Or via Docker: `docker run --rm -v $(pwd):/workspace plantuml/plantuml -tsvg /workspace/out/global.puml`

## Diagrams Produced
- `global.puml`: Global system advanced use case
- `datasource.puml`: DataSource module
- `classification.puml`: Classification module
- `compliance.puml`: Compliance module
- `scan_logic.puml`: Scan Logic module
- `scan_rule_sets.puml`: Scan Rule Sets module
- `data_catalog.puml`: Data Catalog module
- `rbac.puml`: RBAC module

## Customization
Use the builder in `uml_usecase_builder.py` to add actors, system boundaries, groups, use cases, and relations (`include`, `extend`, dashed or solid flows`).

