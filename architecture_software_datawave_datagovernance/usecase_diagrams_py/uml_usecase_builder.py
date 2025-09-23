#!/usr/bin/env python3
"""
PlantUML Use Case Diagram Builder for DataWave
Produces advanced, structured use case diagrams (.puml) via Python DSL.

Usage pattern:
  builder = UseCaseDiagramBuilder(title="My System")
  builder.actor("DataSteward", label="👤 Data Steward", stereotype="Governance")
  with builder.system("🏛️ DATAWAVE") as sys:
      group = sys.group("📚 Catalog", stereotype="DataDiscovery")
      group.usecase("UC_Catalog", label="Catalog Data")
  builder.relation("DataSteward", "UC_Catalog", label="Manages")
  builder.write("diagram.puml")
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Iterable


def _indent(lines: Iterable[str], spaces: int = 2) -> List[str]:
    pad = " " * spaces
    return [pad + line if line else line for line in lines]


@dataclass
class Actor:
    id: str
    label: str
    stereotype: Optional[str] = None

    def render(self) -> List[str]:
        ster = f" <<{self.stereotype}>>" if self.stereotype else ""
        return [f"actor \"{self.label}\" as {self.id}{ster}"]


@dataclass
class UseCase:
    id: str
    label: str
    stereotype: Optional[str] = None

    def render(self) -> List[str]:
        ster = f" <<{self.stereotype}>>" if self.stereotype else ""
        return [f"usecase \"{self.label}\" as {self.id}{ster}"]


@dataclass
class Group:
    title: str
    alias: str
    stereotype: Optional[str] = None
    children: List[object] = field(default_factory=list)

    def group(self, title: str, alias: Optional[str] = None, stereotype: Optional[str] = None) -> "Group":
        alias = alias or title.replace(" ", "_").replace("-", "_")
        g = Group(title=title, alias=alias, stereotype=stereotype)
        self.children.append(g)
        return g

    def usecase(self, id: str, label: str, stereotype: Optional[str] = None) -> UseCase:
        uc = UseCase(id=id, label=label, stereotype=stereotype)
        self.children.append(uc)
        return uc

    def render(self) -> List[str]:
        ster = f" as {self.alias}" if self.alias else ""
        header = f"package \"{self.title}\"{ster} {{"
        lines: List[str] = [header]
        for child in self.children:
            if hasattr(child, "render"):
                lines.extend(_indent(child.render(), 2))
        lines.append("}")
        return lines


@dataclass
class SystemBoundary(Group):
    def render(self) -> List[str]:
        ster = f" as {self.alias}" if self.alias else ""
        header = f"rectangle \"{self.title}\"{ster} {{"
        lines: List[str] = [header]
        for child in self.children:
            if hasattr(child, "render"):
                lines.extend(_indent(child.render(), 2))
        lines.append("}")
        return lines


@dataclass
class Relation:
    left: str
    right: str
    kind: str = "-->"  # "..>" for include/extend, "-.->" for external
    label: Optional[str] = None

    def render(self) -> List[str]:
        lbl = f" : \"{self.label}\"" if self.label else ""
        return [f"{self.left} {self.kind} {self.right}{lbl}"]


class UseCaseDiagramBuilder:
    def __init__(self, title: str, theme: str = "awsm"):
        self.title = title
        self.theme = theme
        self.actors: Dict[str, Actor] = {}
        self.groups: List[Group] = []
        self.system_boundary: Optional[SystemBoundary] = None
        self.includes: List[Relation] = []
        self.extends: List[Relation] = []
        self.flows: List[Relation] = []
        self.skinparams: List[str] = []

    # Configuration helpers
    def add_skinparam(self, line: str) -> None:
        self.skinparams.append(line)

    # Actors
    def actor(self, id: str, label: str, stereotype: Optional[str] = None) -> Actor:
        act = Actor(id=id, label=label, stereotype=stereotype)
        self.actors[id] = act
        return act

    # System boundary and grouping
    def system(self, title: str, alias: str = "System") -> SystemBoundary:
        boundary = SystemBoundary(title=title, alias=alias)
        self.system_boundary = boundary
        self.groups.append(boundary)
        return boundary

    # Relationships
    def relation(self, left: str, right: str, label: Optional[str] = None, dashed: bool = False) -> Relation:
        kind = "-.->" if dashed else "-->"
        rel = Relation(left=left, right=right, kind=kind, label=label)
        self.flows.append(rel)
        return rel

    def include(self, from_uc: str, to_uc: str, label: str = "<<includes>>") -> Relation:
        rel = Relation(left=from_uc, right=to_uc, kind="..>", label=label)
        self.includes.append(rel)
        return rel

    def extend(self, from_uc: str, to_uc: str, label: str = "<<extends>>") -> Relation:
        rel = Relation(left=from_uc, right=to_uc, kind="..>", label=label)
        self.extends.append(rel)
        return rel

    # Use case creation shortcut
    def usecase(self, id: str, label: str, stereotype: Optional[str] = None) -> UseCase:
        # Adds directly at root if no system boundary
        uc = UseCase(id=id, label=label, stereotype=stereotype)
        self.groups.append(uc)  # treat as top-level child
        return uc

    # Rendering
    def render(self) -> str:
        lines: List[str] = []
        lines.append(f"@startuml {self.title.replace(' ', '_')}")
        lines.append("!pragma layout smetana")
        lines.append("skinparam backgroundColor #FAFAFA")
        # Optional skinparams
        lines.extend(self.skinparams)

        # Actors
        if self.actors:
            lines.append("")
            lines.append("' Actors")
            for actor in self.actors.values():
                lines.extend(actor.render())

        # Structure
        lines.append("")
        lines.append("' Structure")
        for group in self.groups:
            if hasattr(group, "render"):
                lines.extend(group.render())
            else:
                # UseCase at root
                lines.extend(group.render())  # type: ignore

        # Relations
        def _section(title: str, rels: List[Relation]):
            if not rels:
                return
            lines.append("")
            lines.append(title)
            for rel in rels:
                lines.extend(rel.render())

        _section("' Flows", self.flows)
        _section("' Includes", self.includes)
        _section("' Extends", self.extends)

        lines.append("@enduml")
        return "\n".join(lines)

    def write(self, path: str) -> None:
        content = self.render()
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)

