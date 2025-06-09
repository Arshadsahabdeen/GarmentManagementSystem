from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
from app.db.session import SessionLocal
from app.db.models.material_master import Material_Master
# from app.api.v1.endpoints.notifications import create_low_stock_notification
from app.schemas.material_master import MaterialCreate, MaterialUpdate, MaterialOut
import logging

router = APIRouter(tags=["Materials"])
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/material-names", response_model=List[str])
def get_material_names(db: Session = Depends(get_db)):
    names = db.query(Material_Master.Material_Desc).distinct().all()
    return [name[0] for name in names if name[0]]


@router.get("/check-exists", summary="Check if material exists by name and color")
def check_material_exists(
    name: str = Query(..., min_length=1, max_length=100, description="Material description"),
    color: str = Query(..., min_length=1, max_length=50, description="Material color"),
    db: Session = Depends(get_db)
):
    """Check if a material with given name and color already exists."""
    try:
        exists = db.query(Material_Master).filter(
            Material_Master.Material_Desc == name,
            Material_Master.Color == color
        ).first()
        return {"exists": bool(exists)}
    except SQLAlchemyError as e:
        logger.error(f"Database error in check_material_exists: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")

@router.post("/", response_model=MaterialOut, status_code=status.HTTP_201_CREATED, summary="Create a new material")
def create_material(material: MaterialCreate, db: Session = Depends(get_db)):
    """Create a new material, ensuring unique name and color combination."""
    try:
        # Check for unique Material_Desc and Color combination
        existing_material = db.query(Material_Master).filter(
            Material_Master.Material_Desc == material.Material_Desc,
            Material_Master.Color == material.Color
        ).first()
        if existing_material:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Material with this description and color already exists"
            )

        new_material = Material_Master(**material.dict())
        db.add(new_material)
        db.commit()
        db.refresh(new_material)
        
        # Trigger notification if quantity is 0
        # if new_material.Quantity == 0:
        #     create_low_stock_notification(db, new_material.Material_Desc)
            
        return new_material
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error in create_material: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")

@router.get("/", response_model=List[MaterialOut], summary="Get all materials")
def read_materials(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: Session = Depends(get_db)
):
    """Retrieve a paginated list of materials."""
    try:
        materials = db.query(Material_Master).offset(skip).limit(limit).all()
        return materials
    except SQLAlchemyError as e:
        logger.error(f"Database error in read_materials: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")

@router.get("/dropdown-options", summary="Get material options for dropdown")
def get_material_dropdown_options(db: Session = Depends(get_db)):
    """Retrieve material options for dropdown menus."""
    try:
        materials = db.query(Material_Master).all()
        return [{"Material_Id": m.Material_Id, "description": m.Material_Desc, "color": m.Color, "qty": m.Quantity} for m in materials]
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_material_dropdown_options: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")

@router.get("/{material_id}", response_model=MaterialOut, summary="Get a material by ID")
def read_material(material_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific material by its ID."""
    try:
        material = db.query(Material_Master).filter(Material_Master.Material_Id == material_id).first()
        if not material:
            raise HTTPException(status_code=404, detail="Material not found")
        return material
    except SQLAlchemyError as e:
        logger.error(f"Database error in read_material: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")

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

    # Add this block here to create low stock notification


# @router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a material")
# def delete_material(material_id: int, db: Session = Depends(get_db)):
#     """Delete a material by its ID."""
#     try:
#         material = db.query(Material_Master).filter(Material_Master.Material_Id == material_id).first()
#         if not material:
#             raise HTTPException(status_code=404, detail="Material not found")

#         db.delete(material)
#         db.commit()
#         return None
#     except SQLAlchemyError as e:
#         db.rollback()
#         logger.error(f"Database error in delete_material: {str(e)}")
#         raise HTTPException(status_code=500, detail="Database error")