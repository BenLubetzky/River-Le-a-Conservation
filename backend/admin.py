"""Admin page for Guardiões do Leça: create the accounts people use to log in to the website.

Run from the backend folder with `uv run python -m streamlit run admin.py` (or `npm run admin` from
the project root). It talks to the database directly with the backend's own models, so it needs the
same .env. It has no login of its own and only listens on localhost (see .streamlit/config.toml).
"""
import streamlit as st
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.core.security import hash_password
from app.database.session import SessionLocal
from app.models import User

MIN_PASSWORD = 8
MAX_PASSWORD = 200  # matches the API's login form

st.set_page_config(page_title="Guardiões do Leça · Admin", page_icon="🌿")
st.title("Guardiões do Leça")
st.caption("Admin · user accounts")


def validate(username: str, password: str, confirm: str) -> str | None:
    """A message for the first problem with the form, or None if it's fine."""
    if not username:
        return "Enter a username."
    if username != username.strip():
        return "The username can't start or end with a space."
    if len(username) > 50:
        return "The username can be at most 50 characters."
    if len(password) < MIN_PASSWORD:
        return f"The password needs at least {MIN_PASSWORD} characters."
    if len(password) > MAX_PASSWORD:
        return f"The password can be at most {MAX_PASSWORD} characters."
    if password != confirm:
        return "The passwords don't match."
    return None


def add_user() -> None:
    """Runs when the form is submitted, before the page reruns, so it can still clear the fields."""
    username, password, confirm = st.session_state.username, st.session_state.password, st.session_state.confirm
    if problem := validate(username, password, confirm):
        st.session_state.result = ("error", problem)
        return
    with SessionLocal() as db:
        db.add(User(username=username, password_hash=hash_password(password)))
        try:
            db.commit()
        except IntegrityError:
            st.session_state.result = ("error", f"There's already a user called “{username}”.")
            return
    st.session_state.result = ("success", f"Added “{username}”. They can log in to the website now.")
    # Clear the form only on success, so a typo doesn't mean retyping everything.
    for key in ("username", "password", "confirm"):
        st.session_state[key] = ""


st.subheader("Add a user")
with st.form("add-user"):
    st.text_input("Username", key="username", max_chars=50, help="Case-sensitive: “Ana” and “ana” are different users.")
    st.text_input("Password", key="password", type="password", max_chars=MAX_PASSWORD)
    st.text_input("Repeat password", key="confirm", type="password", max_chars=MAX_PASSWORD)
    st.form_submit_button("Add user", type="primary", on_click=add_user)

if result := st.session_state.pop("result", None):
    kind, message = result
    (st.success if kind == "success" else st.error)(message)

st.subheader("Users")
with SessionLocal() as db:
    users = db.execute(select(User.username, User.created_at).order_by(User.created_at.desc())).all()
if users:
    st.dataframe(
        [{"Username": u.username, "Created": u.created_at} for u in users],
        hide_index=True,
        column_config={"Created": st.column_config.DatetimeColumn(format="D MMM YYYY, HH:mm")},
    )
else:
    st.info("No users yet.")
