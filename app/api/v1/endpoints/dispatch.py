from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.schemas.dispatch import DispatchCreate, DispatchOut, DispatchUpdate
from app.db.models.dispatch import Dispatch
from app.db.models.stitching_details import Stitching_Details
from app.db.models.material_process import Material_Process
from app.db.models.material_master import Material_Master
from app.db.session import SessionLocal
from decimal import Decimal
# from app.db.models.notifications import Notification , NotificationOut
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
    # Verify stitching details exists
    stitching = db.query(Stitching_Details).filter(
        Stitching_Details.Stitching_Details_Id == dispatch.Stitching_Details_Id
    ).first()

    if not stitching:
        raise HTTPException(status_code=404, detail="Stitching Details ID does not exist.")

    # Check stitched quantity
    if dispatch.Quantity_Dispatched > stitching.Quantity_Stitched:
        raise HTTPException(status_code=400, detail="Not enough stitched quantity available for dispatch.")

    # Deduct dispatched quantity
    stitching.Quantity_Stitched -= Decimal(dispatch.Quantity_Dispatched)
    db.add(stitching)

    # Create new dispatch
    new_dispatch = Dispatch(**dispatch.model_dump())
    db.add(new_dispatch)
    db.commit()
    db.refresh(new_dispatch)

    # Build enriched response
    enriched = (
        db.query(
            Dispatch.Dispatch_Id,
            Dispatch.Stitching_Details_Id,
            Material_Master.Material_Desc,
            Dispatch.Quantity_Dispatched,
            Dispatch.Dispatch_Date,
            Dispatch.Price,
            Dispatch.Receiver_Name,
            Dispatch.Remarks,
            Dispatch.Dispatch_Status,
            Dispatch.Entry_Date,
            Dispatch.Modified_Date
        )
        .join(Stitching_Details, Dispatch.Stitching_Details_Id == Stitching_Details.Stitching_Details_Id)
        .join(Material_Process, Stitching_Details.Material_Process_Id == Material_Process.Material_Process_Id)
        .join(Material_Master, Material_Process.Material_Id == Material_Master.Material_Id)
        .filter(Dispatch.Dispatch_Id == new_dispatch.Dispatch_Id)
        .first()
    )

    return enriched._asdict()





@router.get("/", response_model=list[DispatchOut])
def get_all_dispatches(skip: int = 0, limit: int = 100,db: Session = Depends(get_db)):
    results = (
        db.query(
            Dispatch.Dispatch_Id,
            Dispatch.Stitching_Details_Id,
            Material_Master.Material_Desc,
            Dispatch.Dispatch_Date,
            Dispatch.Quantity_Dispatched,
            Dispatch.Price,
            Dispatch.Receiver_Name,
            Dispatch.Dispatch_Status,
            Dispatch.Remarks,
            Dispatch.Entry_Date,
            Dispatch.Modified_Date
        )
        .join(Stitching_Details, Dispatch.Stitching_Details_Id == Stitching_Details.Stitching_Details_Id)
        .join(Material_Process, Stitching_Details.Material_Process_Id == Material_Process.Material_Process_Id)
        .join(Material_Master, Material_Process.Material_Id == Material_Master.Material_Id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        {
            "Dispatch_Id": r[0],
            "Stitching_Details_Id": r[1],  # optional: you can remove this from response if not needed
            "Material_Desc": r[2],
            "Dispatch_Date": r[3],
            "Quantity_Dispatched": r[4],
            "Price": r[5],
            "Receiver_Name": r[6],
            "Dispatch_Status": r[7],
            "Remarks": r[8],
            "Entry_Date": r[9],
            "Modified_Date": r[10]
        }
        for r in results
    ]


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

# @router.get("/notifications", response_model=List[NotificationOut])
# def get_notifications(db: Session = Depends(get_db)):
#     return db.query(Notification).order_by(Notification.created_at.desc()).all()
