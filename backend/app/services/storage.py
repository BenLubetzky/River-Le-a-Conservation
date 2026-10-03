"""Report photos, kept in a public Supabase Storage bucket and accessed with the secret key."""

import uuid

import httpx

from app.core.config import get_settings

ALLOWED_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
}


def _client() -> httpx.Client:
    s = get_settings()
    return httpx.Client(
        base_url=f"{s.supabase_url}/storage/v1",
        headers={"apikey": s.supabase_secret_key, "Authorization": f"Bearer {s.supabase_secret_key}"},
        timeout=30,
    )


def ensure_bucket() -> None:
    """Create the photo bucket if it doesn't exist yet. Safe to call on every startup."""
    s = get_settings()
    with _client() as c:
        if c.get(f"/bucket/{s.photo_bucket}").status_code == 200:
            return
        r = c.post("/bucket", json={
            "id": s.photo_bucket,
            "name": s.photo_bucket,
            "public": True,
            "file_size_limit": s.max_photo_bytes,
            "allowed_mime_types": list(ALLOWED_TYPES),
        })
        r.raise_for_status()


def upload_photo(data: bytes, content_type: str) -> str:
    """Store a photo under a random name and return its path in the bucket."""
    s = get_settings()
    path = f"{uuid.uuid4()}.{ALLOWED_TYPES[content_type]}"
    with _client() as c:
        r = c.post(f"/object/{s.photo_bucket}/{path}", content=data, headers={"Content-Type": content_type})
        r.raise_for_status()
    return path


def public_url(path: str) -> str:
    s = get_settings()
    return f"{s.supabase_url}/storage/v1/object/public/{s.photo_bucket}/{path}"
