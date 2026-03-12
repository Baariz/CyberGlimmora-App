"""
Dependencies for FastAPI: DB session, optional auth, Family-only gating.
For now auth is a stub (dev): use header X-User-Id and X-User-Role; later replace with JWT.
"""
from typing import Annotated

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User

# Type alias for injectable DB session
DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(
    db: DbSession,
    x_user_id: str | None = Header(None, alias="X-User-Id"),
    x_user_role: str | None = Header(None, alias="X-User-Role"),
):
    """Return current user. Dev: from headers X-User-Id, X-User-Role; or default family user."""
    if x_user_id:
        user = db.query(User).filter(User.id == x_user_id).first()
        if user:
            return user
    # Dev fallback: first family user or first user
    user = db.query(User).filter(User.role == "family").first()
    if user:
        return user
    user = db.query(User).first()
    if user:
        return user
    raise HTTPException(status_code=401, detail="No user found. Seed the database or send X-User-Id.")


def require_family(
    current_user: User = Depends(get_current_user),
):
    """Ensure current user has role 'family'. Use on Guardian and Journey routes."""
    if current_user.role != "family":
        raise HTTPException(
            status_code=403,
            detail="This feature requires a Family plan.",
        )
    return current_user


CurrentUser = Annotated[User, Depends(get_current_user)]
FamilyUser = Annotated[User, Depends(require_family)]
