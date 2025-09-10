import os
import json
from typing import Dict, Any, Optional


class SelectionManifestService:
    """Persist and load datasource selection manifests.

    Storage: filesystem JSON under ./app/static/selection_manifests/{data_source_id}.json
    In production, swap with DB table if desired.
    """

    def __init__(self, base_dir: Optional[str] = None) -> None:
        self.base_dir = base_dir or os.path.join(os.path.dirname(__file__), "..", "static", "selection_manifests")
        self.base_dir = os.path.abspath(self.base_dir)
        os.makedirs(self.base_dir, exist_ok=True)

    def _path(self, data_source_id: int) -> str:
        return os.path.join(self.base_dir, f"{data_source_id}.json")

    def save_manifest(self, data_source_id: int, manifest: Dict[str, Any]) -> Dict[str, Any]:
        path = self._path(data_source_id)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)
        return {"success": True, "path": path}

    def load_manifest(self, data_source_id: int) -> Dict[str, Any]:
        path = self._path(data_source_id)
        if not os.path.exists(path):
            return {"success": True, "data": None}
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return {"success": True, "data": data}


