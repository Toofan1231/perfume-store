from __future__ import annotations

import json
import tempfile
from pathlib import Path

from app.core.config import settings

firebase_admin = None
firebase_auth = None
firestore = None
storage = None
firebase_app = None
db = None
bucket = None


def init_firebase():
    global firebase_admin, firebase_auth, firestore, storage, firebase_app, db, bucket

    if not settings.USE_FIREBASE:
        return None

    try:
        import firebase_admin as _firebase_admin
        from firebase_admin import auth as _firebase_auth
        from firebase_admin import credentials, firestore as _firestore, storage as _storage
    except Exception as exc:
        print(f"Firebase Admin SDK is not installed or failed to import: {exc}")
        return None

    firebase_admin = _firebase_admin
    firebase_auth = _firebase_auth
    firestore = _firestore
    storage = _storage

    if firebase_admin._apps:
        firebase_app = firebase_admin.get_app()
    else:
        cred = None

        if settings.FIREBASE_SERVICE_ACCOUNT_JSON:
            data = json.loads(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
            temp = tempfile.NamedTemporaryFile(delete=False, suffix=".json", mode="w", encoding="utf-8")
            json.dump(data, temp)
            temp.close()
            cred = credentials.Certificate(temp.name)

        elif settings.GOOGLE_APPLICATION_CREDENTIALS and Path(settings.GOOGLE_APPLICATION_CREDENTIALS).exists():
            cred = credentials.Certificate(settings.GOOGLE_APPLICATION_CREDENTIALS)

        if cred:
            options = {}
            if settings.FIREBASE_STORAGE_BUCKET:
                options["storageBucket"] = settings.FIREBASE_STORAGE_BUCKET
            firebase_app = firebase_admin.initialize_app(cred, options)
        else:
            # Allows local development with Application Default Credentials when available.
            try:
                firebase_app = firebase_admin.initialize_app()
            except Exception as exc:
                print(f"Firebase initialization failed: {exc}")
                return None

    try:
        db = firestore.client()
    except Exception as exc:
        print(f"Firestore client initialization failed: {exc}")
        db = None

    try:
        bucket = storage.bucket() if settings.FIREBASE_STORAGE_BUCKET else None
    except Exception:
        bucket = None

    return firebase_app


init_firebase()
