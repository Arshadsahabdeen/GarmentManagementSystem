from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from typing import List
from app.db.models.tailor_master import Tailor_Master
from app.schemas.tailor_master import TailorCreate, TailorOut

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@router.post("/", response_model=TailorOut, status_code=status.HTTP_201_CREATED)
def create_tailor(tailor: TailorCreate, db: Session = Depends(get_db)):
    new_tailor = Tailor_Master(**tailor.dict())
    db.add(new_tailor)
    db.commit()
    db.refresh(new_tailor)
    return new_tailor

@router.get("/", response_model=List[TailorOut])
def get_tailors(db: Session = Depends(get_db)):
    return db.query(Tailor_Master).all()

@router.get("/{tailor_id}", response_model=TailorOut)
def get_tailor(tailor_id: int, db: Session = Depends(get_db)):
    tailor = db.query(Tailor_Master).filter(Tailor_Master.Tailor_Id == tailor_id).first()
    if not tailor:
        raise HTTPException(status_code=404, detail="Tailor not found")
    return tailor

@router.put("/{tailor_id}", response_model=TailorOut)
def update_tailor(tailor_id: int, updated_data: TailorCreate, db: Session = Depends(get_db)):
    tailor = db.query(Tailor_Master).filter(Tailor_Master.Tailor_Id == tailor_id).first()
    if not tailor:
        raise HTTPException(status_code=404, detail="Tailor not found")
    for key, value in updated_data.dict().items():
        setattr(tailor, key, value)
    db.commit()
    db.refresh(tailor)
    return tailor

@router.delete("/{tailor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tailor(tailor_id: int, db: Session = Depends(get_db)):
    tailor = db.query(Tailor_Master).filter(Tailor_Master.Tailor_Id == tailor_id).first()
    if not tailor:
        raise HTTPException(status_code=404, detail="Tailor not found")
    db.delete(tailor)
    db.commit()
