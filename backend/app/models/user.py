import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func

from app.database import Base


def gen_id():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_id)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(String(20), nullable=False, default="individual")  # individual | family
    created_at = Column(DateTime(timezone=True), server_default=func.now())
