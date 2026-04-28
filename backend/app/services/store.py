from __future__ import annotations

import json
import os
import tempfile
import threading
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from app.core.config import settings


def now() -> str:
    return datetime.utcnow().isoformat()


def new_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:12]}"


class JsonStore:
    def __init__(self, path: str):
        self.path = Path(path)
        if not self.path.is_absolute():
            self.path = Path.cwd() / self.path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.RLock()
        if not self.path.exists():
            self.write(self._empty())

    def _empty(self) -> dict:
        return {
            "settings": {},
            "categories": [],
            "products": [],
            "reviews": [],
            "users": [],
            "orders": [],
            "payments": [],
        }

    def read(self) -> dict:
        with self._lock:
            try:
                return json.loads(self.path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                backup = self.path.with_suffix(".corrupt.json")
                backup.write_text(self.path.read_text(encoding="utf-8"), encoding="utf-8")
                data = self._empty()
                self.write(data)
                return data

    def write(self, data: dict) -> None:
        with self._lock:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.NamedTemporaryFile("w", delete=False, dir=self.path.parent, encoding="utf-8") as handle:
                json.dump(data, handle, ensure_ascii=False, indent=2, default=str)
                temp_name = handle.name
            os.replace(temp_name, self.path)

    def all(self, collection: str) -> list[dict]:
        return deepcopy(self.read().get(collection, []))

    def one(self, collection: str, item_id: str, id_key: str = "id") -> dict | None:
        for item in self.read().get(collection, []):
            if item.get(id_key) == item_id:
                return deepcopy(item)
        return None

    def insert(self, collection: str, item: dict) -> dict:
        with self._lock:
            data = self.read()
            data.setdefault(collection, []).append(item)
            self.write(data)
            return deepcopy(item)

    def upsert(self, collection: str, item_id: str, item: dict, id_key: str = "id") -> dict:
        with self._lock:
            data = self.read()
            rows = data.setdefault(collection, [])
            for index, existing in enumerate(rows):
                if existing.get(id_key) == item_id:
                    rows[index] = item
                    self.write(data)
                    return deepcopy(item)
            rows.append(item)
            self.write(data)
            return deepcopy(item)

    def patch(self, collection: str, item_id: str, updates: dict, id_key: str = "id") -> dict | None:
        with self._lock:
            data = self.read()
            rows = data.setdefault(collection, [])
            for index, existing in enumerate(rows):
                if existing.get(id_key) == item_id:
                    rows[index] = {**existing, **updates}
                    self.write(data)
                    return deepcopy(rows[index])
            return None

    def delete(self, collection: str, item_id: str, id_key: str = "id") -> bool:
        with self._lock:
            data = self.read()
            rows = data.setdefault(collection, [])
            new_rows = [item for item in rows if item.get(id_key) != item_id]
            data[collection] = new_rows
            self.write(data)
            return len(new_rows) != len(rows)


store = JsonStore(settings.LOCAL_STORE_PATH)
