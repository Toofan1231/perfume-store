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
from app.core.firebase import db


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


class FirebaseStore:
    def __init__(self, firestore_db):
        self.db = firestore_db

    def _doc_id(self, item: dict, id_key: str = "id") -> str:
        return str(item.get(id_key) or item.get("id") or item.get("uid") or new_id("doc"))

    def _clean(self, value):
        return json.loads(json.dumps(value, default=str))

    def read(self) -> dict:
        return {
            "settings": self.get_settings(),
            "categories": self.all("categories"),
            "products": self.all("products"),
            "reviews": self.all("reviews"),
            "users": self.all("users"),
            "orders": self.all("orders"),
            "payments": self.all("payments"),
        }

    def write(self, data: dict) -> None:
        if "settings" in data:
            self.set_settings(data["settings"])

    def get_settings(self) -> dict:
        snapshot = self.db.collection("settings").document("shop").get()
        return snapshot.to_dict() if snapshot.exists else {}

    def set_settings(self, settings_data: dict) -> dict:
        data = self._clean(settings_data)
        self.db.collection("settings").document("shop").set(data)
        return data

    def all(self, collection_name: str) -> list[dict]:
        if collection_name == "settings":
            return [self.get_settings()]
        rows = []
        for snapshot in self.db.collection(collection_name).stream():
            data = snapshot.to_dict() or {}
            if collection_name == "users":
                data.setdefault("uid", snapshot.id)
            else:
                data.setdefault("id", snapshot.id)
            rows.append(data)
        return rows

    def one(self, collection_name: str, item_id: str, id_key: str = "id") -> dict | None:
        if collection_name == "settings":
            return self.get_settings()

        snapshot = self.db.collection(collection_name).document(item_id).get()
        if snapshot.exists:
            data = snapshot.to_dict() or {}
            if collection_name == "users":
                data.setdefault("uid", snapshot.id)
            else:
                data.setdefault("id", snapshot.id)
            return data

        query = self.db.collection(collection_name).where(id_key, "==", item_id).limit(1).stream()
        for row in query:
            data = row.to_dict() or {}
            if collection_name == "users":
                data.setdefault("uid", row.id)
            else:
                data.setdefault("id", row.id)
            return data
        return None

    def insert(self, collection_name: str, item: dict) -> dict:
        data = self._clean(item)
        id_key = "uid" if collection_name == "users" else "id"
        doc_id = self._doc_id(data, id_key)
        data.setdefault(id_key, doc_id)
        self.db.collection(collection_name).document(doc_id).set(data)
        return deepcopy(data)

    def upsert(self, collection_name: str, item_id: str, item: dict, id_key: str = "id") -> dict:
        data = self._clean(item)
        if collection_name == "users":
            id_key = "uid"
        data.setdefault(id_key, item_id)
        self.db.collection(collection_name).document(item_id).set(data)
        return deepcopy(data)

    def patch(self, collection_name: str, item_id: str, updates: dict, id_key: str = "id") -> dict | None:
        current = self.one(collection_name, item_id, id_key=id_key)
        if not current:
            return None
        data = {**current, **self._clean(updates)}
        self.db.collection(collection_name).document(item_id).set(data)
        return data

    def delete(self, collection_name: str, item_id: str, id_key: str = "id") -> bool:
        self.db.collection(collection_name).document(item_id).delete()
        return True


store = FirebaseStore(db) if settings.USE_FIREBASE and db else JsonStore(settings.LOCAL_STORE_PATH)
