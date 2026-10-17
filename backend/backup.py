"""Back up the database and the report photos to a Cloudflare R2 bucket.

Run daily by .github/workflows/backup.yml; can also be run by hand from backend/:

    uv run --group backup python backup.py

Needs pg_dump 17+ on the PATH (the database is Postgres 17), the backend's settings (backend/.env or
environment variables), and these environment variables for R2 (Cloudflare → R2 → Manage API tokens,
with Object Read & Write on the backup bucket):

    R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET

What goes in the bucket:

    db/<UTC time>.dump   pg_dump of the `public` schema (all the site's tables), custom format.
                         Kept for BACKUP_KEEP_DAYS days (30 by default). Restore with
                         pg_restore --no-owner --no-privileges --clean --if-exists -d <url> <file>
    photos/<path>        every file in the photo bucket, photos and thumbnails. Uploads never
                         change once stored, so only new ones are copied; deleted ones are kept.
"""

import os
import subprocess
import sys
import tempfile
from datetime import UTC, datetime, timedelta
from pathlib import Path

import boto3

from app.core.config import get_settings
from app.services import storage


def r2():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{os.environ['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com",
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        region_name="auto",
    )


def keys(client, bucket: str, prefix: str) -> dict[str, datetime]:
    """Objects under a prefix, with when they were stored."""
    found = {}
    for page in client.get_paginator("list_objects_v2").paginate(Bucket=bucket, Prefix=prefix):
        found.update({o["Key"]: o["LastModified"] for o in page.get("Contents", [])})
    return found


def dump_database(out: Path) -> None:
    # pg_dump wants a plain postgresql:// URL, not SQLAlchemy's postgresql+psycopg://.
    url = get_settings().database_url.replace("postgresql+psycopg://", "postgresql://", 1)
    r = subprocess.run(["pg_dump", "--format=custom", "--schema=public", "--no-owner", "--no-privileges", f"--file={out}", f"--dbname={url}"])
    if r.returncode:
        # Not CalledProcessError: its message would include the command, and so the password.
        raise RuntimeError(f"pg_dump exited with {r.returncode} (its error is above)")


def back_up_database(client, bucket: str) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "db.dump"
        dump_database(out)
        key = f"db/{datetime.now(UTC):%Y-%m-%dT%H%MZ}.dump"
        client.upload_file(str(out), bucket, key)
        print(f"Database: {key} ({out.stat().st_size / 1024:.0f} KB)")

    keep = timedelta(days=int(os.environ.get("BACKUP_KEEP_DAYS") or 30))
    old = [k for k, when in keys(client, bucket, "db/").items() if when < datetime.now(UTC) - keep and k != key]
    for k in old:
        client.delete_object(Bucket=bucket, Key=k)
    if old:
        print(f"Database: removed {len(old)} dumps older than {keep.days} days")


def back_up_photos(client, bucket: str) -> None:
    have = keys(client, bucket, "photos/")
    new = [p for p in storage.list_photos() if f"photos/{p}" not in have]
    for p in new:
        data, content_type = storage.download_photo(p)
        client.put_object(Bucket=bucket, Key=f"photos/{p}", Body=data, ContentType=content_type)
    print(f"Photos: copied {len(new)} new, {len(have)} already backed up")


def main() -> None:
    client, bucket = r2(), os.environ["R2_BUCKET"]
    # Photos too even if the database dump fails, and the other way round; fail at the end.
    failed = False
    for step in (back_up_database, back_up_photos):
        try:
            step(client, bucket)
        except Exception as e:
            failed = True
            print(f"{step.__name__} failed: {type(e).__name__}: {e}", file=sys.stderr)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
