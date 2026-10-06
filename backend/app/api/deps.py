from datetime import UTC, datetime
from typing import Annotated

from fastapi import Cookie, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_token
from app.database.session import get_db
from app.models import User, UserSession

SESSION_COOKIE = "session"

DB = Annotated[Session, Depends(get_db)]


def current_user(db: DB, session: Annotated[str | None, Cookie(alias=SESSION_COOKIE)] = None) -> User:
    """The user whose session cookie came with the request. 401 if there's none, or it has expired."""
    if session:
        user = db.scalar(
            select(User).join(UserSession).where(UserSession.token_hash == hash_token(session), UserSession.expires_at > datetime.now(UTC))
        )
        if user is not None:
            return user
    raise HTTPException(401, "Please log in.")


CurrentUser = Annotated[User, Depends(current_user)]
