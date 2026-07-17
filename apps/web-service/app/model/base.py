# model/base.py
from datetime import datetime

from sqlalchemy import DateTime, Identity
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column
from sqlalchemy.sql.functions import now


class Base(DeclarativeBase):
    __tablename__ = declared_attr.directive(lambda cls: cls.__name__.lower())


class IDMixin:
    id: Mapped[int] = mapped_column(Identity(), primary_key=True)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=now(), onupdate=now()
    )
