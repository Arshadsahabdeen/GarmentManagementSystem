# app/api/v1/endpoints/notifications.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.notifications import Notification
from datetime import datetime
router = APIRouter()

@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db)):
    return db.query(Notification).filter_by(read=0).all()

@router.post("/notifications/mark-read/{notification_id}")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter_by(id=notification_id).first()
    if notif:
        notif.read = 1
        db.commit()
    return {"status": "success"}

@router.put("/notifications/{notification_id}/read")
def mark_notification_as_read(notification_id: int, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.read = 1
    db.commit()
    return {"message": "Marked as read"}

def create_low_stock_notification(db: Session, material_name: str):
    message = f"Material '{material_name}' is out of stock!"
    notification = Notification(
        message=message,
        created_at=datetime.utcnow(),
        read=0
    )
    db.add(notification)
    db.commit()