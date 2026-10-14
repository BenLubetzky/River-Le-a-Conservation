"""Admin page for Monitorização Leça: manage the accounts people use to log in to the website, delete
reports, and set how long until each species' reports are checked again.

Run from the backend folder with `uv run python -m streamlit run admin.py` (or `npm run admin` from
the project root). It talks to the database directly with the backend's own models, so it needs the
same .env. It has no login of its own and only listens on localhost (see .streamlit/config.toml).
"""
import streamlit as st
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError

from app.core.security import hash_password
from app.database.session import SessionLocal
from app.models import Report, Species, User, UserSession
from app.services import storage

MIN_PASSWORD = 8
MAX_PASSWORD = 200  # matches the API's login form
REPORTS_SHOWN = 50

st.set_page_config(page_title="Monitorização Leça · Admin", page_icon="🌿", layout="wide")
# Wide layout, capped at a readable width, so the rows have room for their buttons; and button
# labels never wrap or get cut off.
st.html("""<style>
  [data-testid="stMainBlockContainer"] { max-width: 1040px; }
  [data-testid="stPopover"] button, [data-testid="stPopover"] button * { white-space: nowrap; text-overflow: clip; overflow: visible; }
  [data-testid="stPopover"] { flex-shrink: 0; }
</style>""")


def md(text: str) -> str:
    """Text safe to put inside Markdown, e.g. a username with * or _ in it."""
    return "".join("\\" + c if c in "\\`*_{}[]()<>#+-.!|~" else c for c in text)


def fmt_time(dt) -> str:
    local = dt.astimezone()
    return f"{local.day} {local:%b %Y, %H:%M}"

st.title("Monitorização Leça")
st.caption("Admin · users, reports and checkups")


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
    for u in users:
        with st.container(border=True):
            # A row that sizes the buttons to their labels and gives the rest of the space to the text.
            row = st.container(horizontal=True, vertical_alignment="center")
            info = row.container(width="stretch", gap=None)
            info.markdown(f"**{md(u.username)}**")
            info.caption(f"Created {fmt_time(u.created_at)} · {u.reports} {'report' if u.reports == 1 else 'reports'}")
            # The buttons in their own group, so on a narrow screen they move below the text together.
            actions = row.container(horizontal=True, width="content", gap="small")
            password_box = actions.popover("Password", icon=":material/key:")
            remove_box = actions.popover("Delete", icon=":material/delete:")
        with password_box:
            st.markdown(f"New password for **{md(u.username)}**")
            st.text_input("New password", key=f"pw_{u.id}", type="password", max_chars=MAX_PASSWORD)
            st.text_input("Repeat new password", key=f"pw2_{u.id}", type="password", max_chars=MAX_PASSWORD)
            st.caption("They'll be logged out everywhere and have to log in with the new password.")
            st.button("Change password", key=f"change_{u.id}", type="primary", on_click=change_password, args=(u.id, u.username))
        with remove_box:
            st.markdown(f"Delete **{md(u.username)}**?")
            st.caption(
                f"They'll be logged out and can't log in again. Reports they made ({u.reports}) stay on the "
                "website, no longer linked to a user. This can't be undone."
            )
            st.button("Delete user", key=f"delete_{u.id}", type="primary", on_click=delete_user, args=(u.username,))
else:
    st.info("No users yet.")


def delete_report(report_id: int) -> None:
    with SessionLocal() as db:
        photo = db.scalar(select(Report.photo_path).where(Report.id == report_id))
        deleted = db.execute(delete(Report).where(Report.id == report_id)).rowcount
        db.commit()
    if not deleted:
        st.session_state.reports_result = ("error", f"Report #{report_id} no longer exists.")
        return
    if photo:
        storage.delete_photos_quietly([photo])
    st.session_state.reports_result = ("success", f"Deleted report #{report_id}.")


st.subheader("Reports")
st.caption("Reports can only be deleted here. On the website, people can edit their own reports but not delete them.")
search = st.text_input("Search", placeholder="Report number, species, reporter or place", label_visibility="collapsed")
with SessionLocal() as db:
    query = (
        select(Report.id, Report.observed_at, Report.reporter_name, Report.location_text, Report.photo_path, Species.common_name)
        .join(Species)
        .order_by(Report.observed_at.desc())
    )
    if term := search.strip().lstrip("#"):
        like = f"%{term}%"
        matches = Species.common_name.ilike(like) | Species.latin_name.ilike(like) | Report.reporter_name.ilike(like) | Report.location_text.ilike(like)
        if term.isdigit():
            matches |= Report.id == int(term)
        query = query.where(matches)
    reports = db.execute(query.limit(REPORTS_SHOWN + 1)).all()

if result := st.session_state.pop("reports_result", None):
    kind, message = result
    (st.success if kind == "success" else st.error)(message)

if reports:
    if len(reports) > REPORTS_SHOWN:
        st.caption(f"Showing the {REPORTS_SHOWN} most recent. Search to find older ones.")
        reports = reports[:REPORTS_SHOWN]
    for r in reports:
        with st.container(border=True):
            row = st.container(horizontal=True, vertical_alignment="center")
            info = row.container(width="stretch", gap=None)
            info.markdown(f"**#{r.id} · {md(r.common_name)}**")
            details = [f"Observed {fmt_time(r.observed_at)}", f"by {r.reporter_name or 'Anonymous'}"]
            if r.location_text:
                details.append(r.location_text)
            info.caption(md(" · ".join(details)))
            remove_box = row.popover("Delete", icon=":material/delete:")
        with remove_box:
            st.markdown(f"Delete report **#{r.id}** ({r.common_name})?")
            st.caption(("Its photo will be deleted too. " if r.photo_path else "") + "This can't be undone.")
            st.button("Delete report", key=f"delete_report_{r.id}", type="primary", on_click=delete_report, args=(r.id,))
elif search.strip():
    st.info("No reports match that search.")
else:
    st.info("No reports yet.")


def save_checkup_days() -> None:
    with SessionLocal() as db:
        for sp in db.scalars(select(Species)):
            sp.checkup_days = int(st.session_state[f"checkup_days_{sp.id}"])
        db.commit()
    st.session_state.checkup_result = ("success", "Saved. New reports will suggest these.")


st.subheader("Checkup intervals")
st.caption(
    "How many days after a report its checkup is suggested, per species. People can still choose "
    "another date, or none, when they submit. Changing these doesn't move checkups already planned."
)
with SessionLocal() as db:
    all_species = db.execute(select(Species.id, Species.common_name, Species.latin_name, Species.checkup_days).order_by(Species.display_order)).all()
with st.form("checkup-days"):
    for sp in all_species:
        st.number_input(f"{sp.common_name} ({sp.latin_name})", key=f"checkup_days_{sp.id}", min_value=1, max_value=3650, step=1, value=sp.checkup_days)
    st.form_submit_button("Save intervals", type="primary", on_click=save_checkup_days)
if result := st.session_state.pop("checkup_result", None):
    kind, message = result
    (st.success if kind == "success" else st.error)(message)
