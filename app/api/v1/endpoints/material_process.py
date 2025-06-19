from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.models.material_master import Material_Master
from app.db.session import SessionLocal
from app.db.models.material_process import Material_Process
from app.schemas.material_process import MaterialProcessCreate, MaterialProcessUpdate, MaterialProcessOut

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=MaterialProcessOut, status_code=status.HTTP_201_CREATED)
def create_material_process(mp: MaterialProcessCreate, db: Session = Depends(get_db)):
    material = db.query(Material_Master).filter(Material_Master.Material_Id == mp.Material_Id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    if material.Quantity is None or material.Quantity < mp.Quantity_Processed:
        raise HTTPException(status_code=400, detail="Insufficient material quantity")
    material.Quantity -= mp.Quantity_Processed
    new_mp = Material_Process(**mp.dict())
    db.add(new_mp)
    db.commit()
    db.refresh(new_mp)
    enriched = (
        db.query(
            Material_Process.Material_Process_Id,
            Material_Process.Material_Id,
            Material_Process.Quantity_Processed,
            Material_Process.Processed_Date,
            Material_Process.Entry_Date,
            Material_Process.Modified_Date,
            Material_Master.Material_Desc,
            Material_Master.Color
        )
        .join(Material_Master, Material_Process.Material_Id == Material_Master.Material_Id)
        .filter(Material_Process.Material_Process_Id == new_mp.Material_Process_Id)
        .first()
    )
    return enriched._asdict()  # convert SQLAlchemy row to dict for FastAPI

@router.get("/", response_model=List[MaterialProcessOut])
def read_material_processes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    results = (
        db.query(
            Material_Process.Material_Process_Id,
            Material_Process.Material_Id,
            Material_Process.Quantity_Processed,
            Material_Process.Processed_Date,
            Material_Master.Material_Desc,
            Material_Master.Color,
            Material_Process.Entry_Date,
            Material_Process.Modified_Date
        )
        .join(Material_Master, Material_Process.Material_Id == Material_Master.Material_Id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "Material_Process_Id": r[0],
            "Material_Id": r[1],  
            "Quantity_Processed": r[2],
            "Processed_Date": r[3],
            "Material_Desc": r[4],
            "Color": r[5],
            "Entry_Date": r[6],
            "Modified_Date": r[7],
        }
        for r in results
    ]

@router.get("/dropdown-options")
def get_material_process_dropdown_options(db: Session = Depends(get_db)):
    options = db.query(
        Material_Process.Material_Process_Id,
        Material_Process.Quantity_Processed,
        Material_Master.Material_Desc,
        Material_Master.Color
    ).join(Material_Master, Material_Process.Material_Id == Material_Master.Material_Id).all()

    return [
        {
            "Material_Process_Id": o[0],
            "Quantity_Processed": float(o[1]),
            "Material_Desc": o[2],
            "Color": o[3]
        }
        for o in options
    ]


@router.get("/{mp_id}", response_model=MaterialProcessOut)
def read_material_process(mp_id: int, db: Session = Depends(get_db)):
    mp = db.query(Material_Process).filter(Material_Process.Material_Process_Id == mp_id).first()
    if not mp:
        raise HTTPException(status_code=404, detail="Material_Process not found")
    return mp

@router.put("/  ", response_model=MaterialProcessOut)
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
