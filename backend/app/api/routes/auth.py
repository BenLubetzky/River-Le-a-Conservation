from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Cookie, HTTPException, Response
from sqlalchemy import delete, select

from app.api.deps import DB, SESSION_COOKIE, CurrentUser
from app.core.config import get_settings
from app.core.security import hash_token, new_session_token, verify_password
from app.models import User, UserSession
from app.schemas import LoginIn, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(db: DB, body: LoginIn, response: Response) -> UserOut:
    # Usernames are case-sensitive, so this is an exact match.
    user = db.scalar(select(User).where(User.username == body.username))
    # The password is checked even for an unknown username; `user is None` only narrows the type.
    if not verify_password(body.password, user.password_hash if user else None) or user is None:
        raise HTTPException(401, "Wrong username or password.")

    settings = get_settings()
    token = new_session_token()
    ttl = timedelta(days=settings.session_ttl_days)
    now = datetime.now(UTC)
    # Expired sessions are cleaned up whenever this user logs in again.
    db.execute(delete(UserSession).where(UserSession.user_id == user.id, UserSession.expires_at <= now))
    db.add(UserSession(user_id=user.id, token_hash=hash_token(token), expires_at=now + ttl))
    db.commit()
    response.set_cookie(
        SESSION_COOKIE, token, max_age=int(ttl.total_seconds()),
        httponly=True, samesite="lax", secure=settings.cookie_secure,
    )
    return UserOut.model_validate(user)


@router.post("/logout", status_code=204)
def logout(db: DB, response: Response, session: Annotated[str | None, Cookie(alias=SESSION_COOKIE)] = None) -> None:
    if session:
        db.execute(delete(UserSession).where(UserSession.token_hash == hash_token(session)))
        db.commit()
    response.delete_cookie(SESSION_COOKIE, httponly=True, samesite="lax", secure=get_settings().cookie_secure)


@router.get("/me")
def me(user: CurrentUser) -> UserOut:
    return UserOut.model_validate(user)
