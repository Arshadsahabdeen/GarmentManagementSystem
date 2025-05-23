from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.models.material_master import Material_Master
from ....db.session import SessionLocal
from ....db.models.material_process import Material_Process
from app.schemas.material_process import MaterialProcessCreate, MaterialProcessUpdate, MaterialProcessOut

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# @router.post("/", response_model=MaterialProcessOut, status_code=status.HTTP_201_CREATED)
# def create_material_process(mp: MaterialProcessCreate, db: Session = Depends(get_db)):
#     new_mp = Material_Process(**mp.dict())
#     db.add(new_mp)
#     db.commit()
#     db.refresh(new_mp)
#     return new_mp

@router.post("/", response_model=MaterialProcessOut, status_code=status.HTTP_201_CREATED)
def create_material_process(mp: MaterialProcessCreate, db: Session = Depends(get_db)):
    # First, fetch the material from Material_Master
    material = db.query(Material_Master).filter(Material_Master.Material_Id == mp.Material_Id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    # Check if enough quantity is available
    if material.Quantity is None or material.Quantity < mp.Quantity_Processed:
        raise HTTPException(status_code=400, detail="Insufficient material quantity")

    # Deduct the quantity
    material.Quantity -= mp.Quantity_Processed

    # Create the Material_Process record
    new_mp = Material_Process(**mp.dict())

    db.add(new_mp)
    db.commit()
    db.refresh(new_mp)

    return new_mp

@router.get("/", response_model=List[MaterialProcessOut])
def read_material_processes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    mps = db.query(Material_Process).offset(skip).limit(limit).all()
    return mps

@router.get("/{mp_id}", response_model=MaterialProcessOut)
def read_material_process(mp_id: int, db: Session = Depends(get_db)):
    mp = db.query(Material_Process).filter(Material_Process.Material_Process_Id == mp_id).first()
    if not mp:
        raise HTTPException(status_code=404, detail="Material_Process not found")
    return mp

@router.put("/{mp_id}", response_model=MaterialProcessOut)
def update_material_process(mp_id: int, updated_mp: MaterialProcessUpdate, db: Session = Depends(get_db)):
    mp = db.query(Material_Process).filter(Material_Process.Material_Process_Id == mp_id).first()
    if not mp:
        raise HTTPException(status_code=404, detail="Material_Process not found")
    for key, value in updated_mp.dict(exclude_unset=True).items():
        setattr(mp, key, value)
    db.commit()
    db.refresh(mp)
    return mp

@router.delete("/{mp_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material_process(mp_id: int, db: Session = Depends(get_db)):
    mp = db.query(Material_Process).filter(Material_Process.Material_Process_Id == mp_id).first()
    if not mp:
        raise HTTPException(status_code=404, detail="Material_Process not found")
    db.delete(mp)
    db.commit()
    return None
