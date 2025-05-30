from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.schemas.dispatch import DispatchCreate, DispatchOut, DispatchUpdate
from app.db.models.dispatch import Dispatch
from app.db.models.stitching_details import Stitching_Details
from app.db.session import SessionLocal
from decimal import Decimal

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
