from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.api.v1.endpoints.notifications import create_low_stock_notification
from app.db.session import SessionLocal
from app.db.models.material_master import Material_Master
from app.schemas.material_master import MaterialCreate, MaterialUpdate, MaterialOut

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/check-exists")
def check_material_exists(
    name: str = Query(...),
    db: Session = Depends(get_db)
):
    exists = db.query(Material_Master).filter(
        Material_Master.Material_Desc == name
    ).first()
    return {"exists": bool(exists)}

@router.post("/", response_model=MaterialOut, status_code=status.HTTP_201_CREATED)
def create_material(material: MaterialCreate, db: Session = Depends(get_db)):
    # Ensure unique material description
    existing = db.query(Material_Master).filter(Material_Master.Material_Desc == material.Material_Desc).first()
    if existing:
        raise HTTPException(status_code=400, detail="Material description already exists")

    new_material = Material_Master(Material_Desc=material.Material_Desc)
    db.add(new_material)
    db.commit()
    db.refresh(new_material)
    return new_material

@router.get("/", response_model=List[MaterialOut])
def read_materials(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Material_Master).offset(skip).limit(limit).all()

@router.get("/dropdown-options")
def get_material_dropdown_options(db: Session = Depends(get_db)):
    materials = db.query(Material_Master).all()
    return [{"id": m.Material_Id, "description": m.Material_Desc} for m in materials]

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

    if updated_material.Material_Desc:
        material.Material_Desc = updated_material.Material_Desc

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

@router.put("/materials/{material_id}")
def update_material_quantity(material_id: int, new_qty: int, db: Session = Depends(get_db)):
    material = db.query(Material_Master).filter(Material_Master.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    material.quantity = new_qty
    db.commit()

    if new_qty == 0:
        create_low_stock_notification(db, material.material_name)

    return {"message": "Material updated"}