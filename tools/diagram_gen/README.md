# Diagram Generation Toolkit

Generates high-cohesion, low-coupling Mermaid diagrams from `app/models/**`.

## Usage

```
python tools/diagram_gen/run.py
```

Outputs are written to:
- `architecture/generated_class_diagrams/models_graph.json`
- `architecture/generated_class_diagrams/00_overview_flow.mmd`
- `architecture/generated_class_diagrams/groups/<GROUP>.mmd`

## Design
- Extractor parses Python model classes (AST) and heuristically detects FK/relationship hints.
- Generator groups classes into 7 domains and emits per-group Mermaid class diagrams using valid multiplicities ("1", "0..*").
- Overview flow is a loop-free chain to keep coupling low; cross-domain arrows can be adjusted later.

## Notes
- This is heuristic; for perfect FK targets, add explicit `relationship("ModelName")` or `ForeignKey("Model.table")` hints in models.
- Mermaid class diagrams do not support subgraphs; grouping is produced as separate files and a flowchart overview.
