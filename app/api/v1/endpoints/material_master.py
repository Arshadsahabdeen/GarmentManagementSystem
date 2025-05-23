from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ....db.session import SessionLocal  # Adjust import if needed
from ....db.models.material_master import Material_Master

from app.schemas.material_master import MaterialCreate, MaterialUpdate, MaterialOut

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=MaterialOut, status_code=status.HTTP_201_CREATED)
def create_material(material: MaterialCreate, db: Session = Depends(get_db)):
    # Check if Material_Desc is unique
    db_material = db.query(Material_Master).filter(Material_Master.Material_Desc == material.Material_Desc).first()
    if db_material:
        raise HTTPException(status_code=400, detail="Material description already exists")

    new_material = Material_Master(**material.dict())
    db.add(new_material)
    db.commit()
    db.refresh(new_material)
    return new_material


@router.get("/", response_model=List[MaterialOut])
def read_materials(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    materials = db.query(Material_Master).offset(skip).limit(limit).all()
    return materials


@router.get("/{material_id}", response_model=MaterialOut)
def read_material(material_id: int, db: Session = Depends(get_db)):
    material = db.query(Material_Master).filter(Material_Master.Material_Id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material


@router.put("/{material_id}", response_model=MaterialOut)
def update_material(material_id: int, updated_material: MaterialUpdate, db: Session = Depends(get_db)):
    material = db.query(Material_Master).filter(Material_Master.Material_Id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    # Update all allowed fields
    for key, value in updated_material.dict(exclude_unset=True).items():
        setattr(material, key, value)

    db.commit()
    db.refresh(material)
    return material


@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material(material_id: int, db: Session = Depends(get_db)):
    material = db.query(Material_Master).filter(Material_Master.Material_Id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    db.delete(material)
    db.commit()
    return None
