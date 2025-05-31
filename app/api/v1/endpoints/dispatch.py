from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.schemas.dispatch import DispatchCreate, DispatchOut, DispatchUpdate
from app.db.models.dispatch import Dispatch
from app.db.models.stitching_details import Stitching_Details
from app.db.session import SessionLocal
from decimal import Decimal
from app.db.models.notifications import Notification , NotificationOut
from typing import List

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=DispatchOut, status_code=status.HTTP_201_CREATED)
def create_dispatch(dispatch: DispatchCreate, db: Session = Depends(get_db)):
    # Check if the Stitching Details ID exists
    stitching = db.query(Stitching_Details).filter(Stitching_Details.Stitching_Details_Id == dispatch.Stitching_Details_Id).first()
    
    if not stitching:
        raise HTTPException(status_code=404, detail="Stitching Details ID does not exist.")

    # Check if there is enough quantity stitched
    if dispatch.Quantity_Dispatched > stitching.Quantity_Stitched:
        raise HTTPException(status_code=400, detail="Not enough stitched quantity available for dispatch.")

    # Proceed with dispatch creation
    new_dispatch = Dispatch(**dispatch.model_dump())
    
    # Deduct the dispatched quantity
    stitching.Quantity_Stitched -= Decimal(dispatch.Quantity_Dispatched)

    # Add notification: Shirts dispatched
    dispatch_message = f"{dispatch.Quantity_Dispatched} shirts dispatched to {dispatch.Receiver_Name}."
    notification = Notification(message=dispatch_message)
    db.add(notification)

    # Optional: Add stock low alert
    # This assumes stitching.Material_Id exists and maps to some Material_Stock model
    # Uncomment this block if you want to implement stock alerts
    # stock = db.query(Material_Stock).filter(Material_Stock.Material_Id == stitching.Material_Id).first()
    # if stock and stock.Quantity < 10:
    #     low_stock_msg = f"Low stock alert: Material ID {stock.Material_Id} has only {stock.Quantity} units left."
    #     low_stock_notification = Notification(message=low_stock_msg)
    #     db.add(low_stock_notification)

    db.add(new_dispatch)
    db.commit()
    db.refresh(new_dispatch)

    return new_dispatch




@router.get("/", response_model=list[DispatchOut])
def get_all_dispatches(db: Session = Depends(get_db)):
    return db.query(Dispatch).all()

@router.get("/{dispatch_id}", response_model=DispatchOut)
def get_dispatch(dispatch_id: int, db: Session = Depends(get_db)):
    dispatch = db.query(Dispatch).filter(Dispatch.Dispatch_Id == dispatch_id).first()
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    return dispatch

@router.put("/{dispatch_id}", response_model=DispatchOut)
def update_dispatch(dispatch_id: int, updated: DispatchUpdate, db: Session = Depends(get_db)):
    dispatch = db.query(Dispatch).filter(Dispatch.Dispatch_Id == dispatch_id).first()
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    
    for key, value in updated.model_dump().items():
        setattr(dispatch, key, value)

    db.commit()
    db.refresh(dispatch)
    return dispatch

@router.delete("/{dispatch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dispatch(dispatch_id: int, db: Session = Depends(get_db)):
    dispatch = db.query(Dispatch).filter(Dispatch.Dispatch_Id == dispatch_id).first()
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    db.delete(dispatch)
    db.commit()

@router.get("/notifications", response_model=List[NotificationOut])
def get_notifications(db: Session = Depends(get_db)):
    return db.query(Notification).order_by(Notification.created_at.desc()).all()
