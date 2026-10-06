"""Admin page for Guardiões do Leça: add, delete and reset the passwords of the accounts people use to log in to the website.

Run from the backend folder with `uv run python -m streamlit run admin.py` (or `npm run admin` from
the project root). It talks to the database directly with the backend's own models, so it needs the
same .env. It has no login of its own and only listens on localhost (see .streamlit/config.toml).
"""
import streamlit as st
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError

from app.core.security import hash_password
from app.database.session import SessionLocal
from app.models import Report, User, UserSession

MIN_PASSWORD = 8
MAX_PASSWORD = 200  # matches the API's login form

st.set_page_config(page_title="Guardiões do Leça · Admin", page_icon="🌿")
st.title("Guardiões do Leça")
st.caption("Admin · user accounts")


def validate_password(password: str, confirm: str) -> str | None:
    """A message for the first problem with the password, or None if it's fine."""
    if len(password) < MIN_PASSWORD:
        return f"The password needs at least {MIN_PASSWORD} characters."
    if len(password) > MAX_PASSWORD:
        return f"The password can be at most {MAX_PASSWORD} characters."
    if password != confirm:
        return "The passwords don't match."
    return None


def validate(username: str, password: str, confirm: str) -> str | None:
    """A message for the first problem with the new-user form, or None if it's fine."""
    if not username:
        return "Enter a username."
    if username != username.strip():
        return "The username can't start or end with a space."
    if len(username) > 50:
        return "The username can be at most 50 characters."
    return validate_password(password, confirm)


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


def delete_user(username: str) -> None:
    with SessionLocal() as db:
        # The database does the rest: the user's sessions go too (so they're logged out everywhere),
        # and their reports stay, with user_id set to NULL.
        deleted = db.execute(delete(User).where(User.username == username)).rowcount
        db.commit()
    if deleted:
        st.session_state.users_result = ("success", f"Deleted “{username}”.")
    else:
        st.session_state.users_result = ("error", f"“{username}” no longer exists.")


def change_password(user_id: int, username: str) -> None:
    password, confirm = st.session_state[f"pw_{user_id}"], st.session_state[f"pw2_{user_id}"]
    if problem := validate_password(password, confirm):
        st.session_state.users_result = ("error", f"{username}: {problem}")
        return
    with SessionLocal() as db:
        user = db.get(User, user_id)
        if user is None:
            st.session_state.users_result = ("error", f"“{username}” no longer exists.")
            return
        user.password_hash = hash_password(password)
        # Log them out everywhere, so whoever knew the old password loses access too.
        db.execute(delete(UserSession).where(UserSession.user_id == user_id))
        db.commit()
    st.session_state.users_result = ("success", f"Changed the password of “{username}”. They've been logged out and can log in with the new one.")
    st.session_state[f"pw_{user_id}"] = st.session_state[f"pw2_{user_id}"] = ""


st.subheader("Users")
with SessionLocal() as db:
    users = db.execute(
        select(User.id, User.username, User.created_at, func.count(Report.id).label("reports"))
        .outerjoin(Report, Report.user_id == User.id)
        .group_by(User.id)
        .order_by(User.created_at.desc())
    ).all()

if result := st.session_state.pop("users_result", None):
    kind, message = result
    (st.success if kind == "success" else st.error)(message)

# Plain rows rather than st.dataframe: that needs pandas, whose DLLs Windows Smart App Control blocks.
if users:
    widths = [3, 2, 1, 1.3, 1.1]
    for col, label in zip(st.columns(widths), ["Username", "Created", "Reports", "", ""]):
        col.caption(label)
    for u in users:
        name, created, reports, password, remove = st.columns(widths, vertical_alignment="center")
        name.text(u.username)
        local = u.created_at.astimezone()
        created.text(f"{local.day} {local:%b %Y, %H:%M}")
        reports.text(str(u.reports))
        with password.popover("Password", width="stretch"):
            st.markdown(f"New password for **{u.username}**")
            st.text_input("New password", key=f"pw_{u.id}", type="password", max_chars=MAX_PASSWORD)
            st.text_input("Repeat new password", key=f"pw2_{u.id}", type="password", max_chars=MAX_PASSWORD)
            st.caption("They'll be logged out everywhere and have to log in with the new password.")
            st.button("Change password", key=f"change_{u.id}", type="primary", on_click=change_password, args=(u.id, u.username))
        with remove.popover("Delete", width="stretch"):
            st.markdown(f"Delete **{u.username}**?")
            st.caption(
                f"They'll be logged out and can't log in again. Reports they made ({u.reports}) stay on the "
                "website, no longer linked to a user. This can't be undone."
            )
            st.button("Delete user", key=f"delete_{u.id}", type="primary", on_click=delete_user, args=(u.username,))
else:
    st.info("No users yet.")
