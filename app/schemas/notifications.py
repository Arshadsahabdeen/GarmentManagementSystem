from pydantic import BaseModel
from datetime import datetime

class NotificationBase(BaseModel):
    message: str
    read: int = 0

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    message: str | None = None
    read: int | None = None

class NotificationOut(BaseModel):
    id: int
    message: str
    created_at: datetime
    read: int

    class Config:
        orm_mode = True
