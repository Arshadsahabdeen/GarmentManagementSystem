from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.base import Base  # Your declarative base
from app.schemas.notifications import NotificationOut  # Assuming you have a schema for notifications
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    read = Column(Integer, default=0)  # 0 = unread, 1 = read
