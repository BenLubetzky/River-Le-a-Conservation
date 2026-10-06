"""Report photos, kept in a private Supabase Storage bucket and accessed with the secret key.

Photos are only viewable through signed URLs, which this API hands out and which expire.
"""

import logging
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
    """Create the photo bucket, or bring an existing one in line (private, size and type limits).
    Safe to call on every startup."""
    s = get_settings()
    settings = {"public": False, "file_size_limit": s.max_photo_bytes, "allowed_mime_types": list(ALLOWED_TYPES)}
    with _client() as c:
        if c.get(f"/bucket/{s.photo_bucket}").status_code == 200:
            r = c.put(f"/bucket/{s.photo_bucket}", json={"id": s.photo_bucket, **settings})
        else:
            r = c.post("/bucket", json={"id": s.photo_bucket, "name": s.photo_bucket, **settings})
        r.raise_for_status()


def upload_photo(data: bytes, content_type: str) -> str:
    """Store a photo under a random name and return its path in the bucket."""
    s = get_settings()
    path = f"{uuid.uuid4()}.{ALLOWED_TYPES[content_type]}"
    with _client() as c:
        r = c.post(f"/object/{s.photo_bucket}/{path}", content=data, headers={"Content-Type": content_type})
        r.raise_for_status()
    return path


def delete_photos(paths: list[str]) -> None:
    """Remove photos from the bucket. Paths that don't exist are ignored."""
    s = get_settings()
    paths = [p for p in paths if p]
    if not paths:
        return
    with _client() as c:
        r = c.request("DELETE", f"/object/{s.photo_bucket}", json={"prefixes": paths})
        r.raise_for_status()


def delete_photos_quietly(paths: list[str]) -> None:
    """delete_photos, for when the database change has already been made: a failure only leaves
    an unused file behind, so it's logged rather than raised."""
    try:
        delete_photos(paths)
    except Exception:
        logging.getLogger("uvicorn.error").exception("Could not delete photos %s", paths)


def signed_urls(paths: list[str]) -> dict[str, str]:
    """Temporary viewing URLs for photos in the bucket, by path. Paths that can't be signed are left out."""
    s = get_settings()
    paths = list(dict.fromkeys(p for p in paths if p))
    if not paths:
        return {}
    with _client() as c:
        r = c.post(f"/object/sign/{s.photo_bucket}", json={"expiresIn": s.signed_url_ttl_seconds, "paths": paths})
        r.raise_for_status()
    urls = {}
    for item in r.json():
        url = item.get("signedURL")
        if url and not item.get("error"):
            # Supabase returns the URL relative to the storage API.
            urls[item["path"]] = url if url.startswith("http") else f"{s.supabase_url}/storage/v1{url}"
    return urls
