from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from decimal import Decimal
from app.db.session import SessionLocal
from app.db.models.stitching_details import Stitching_Details
from app.db.models.material_process import Material_Process
from app.db.models.material_master import Material_Master
from app.schemas.stitching_details import StitchingDetailsCreate, StitchingDetailsOut, StitchingDetailsUpdate

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# Create a new stitching detail
@router.post("/", response_model=StitchingDetailsOut, status_code=status.HTTP_201_CREATED)
def create_stitching_detail(stitching: StitchingDetailsCreate, db: Session = Depends(get_db)):
    material_process = db.query(Material_Process).filter(
        Material_Process.Material_Process_Id == stitching.Material_Process_Id
    ).first()

    if not material_process:
        raise HTTPException(status_code=404, detail="Material Process ID does not exist")

    stitching_size = Decimal(str(stitching.Size))  # convert float to Decimal

    if material_process.Quantity_Processed < stitching_size:
        raise HTTPException(status_code=400, detail="Not enough Quantity Processed available")

    material_process.Quantity_Processed -= stitching_size
    db.add(material_process)

    new_detail = Stitching_Details(**stitching.dict())
    db.add(new_detail)

    db.commit()
    db.refresh(new_detail)

    # Query enriched stitched data for response
    enriched = (
        db.query(
            Stitching_Details.Stitching_Details_Id,
            Stitching_Details.Material_Process_Id,
            Material_Master.Material_Desc,
            Stitching_Details.Size,
            Stitching_Details.Stitching_Date,
            Stitching_Details.Stitching_Status,
            Stitching_Details.Quantity_Stitched,
            Stitching_Details.Tailor_Id,
            Stitching_Details.Quality_Check_Status,
            Stitching_Details.Entry_Date,
            Stitching_Details.Modified_Date
        )
        .join(Material_Process, Stitching_Details.Material_Process_Id == Material_Process.Material_Process_Id)
        .join(Material_Master, Material_Process.Material_Id == Material_Master.Material_Id)
        .filter(Stitching_Details.Stitching_Details_Id == new_detail.Stitching_Details_Id)
        .first()
    )

    return enriched._asdict()



# Get all stitching details
@router.get("/", response_model=list[StitchingDetailsOut])
def get_stitching_details(skip: int = 0, limit: int = 100,db: Session = Depends(get_db)):
    results = (
        db.query(
            Stitching_Details.Stitching_Details_Id,
            Stitching_Details.Material_Process_Id,
            Material_Master.Material_Desc,
            Stitching_Details.Size,
            Stitching_Details.Stitching_Date,
            Stitching_Details.Stitching_Status,
            Stitching_Details.Quantity_Stitched,
            Stitching_Details.Tailor_Id,
            Stitching_Details.Quality_Check_Status,
            Stitching_Details.Entry_Date,
            Stitching_Details.Modified_Date
        )
        .join(Material_Process, Stitching_Details.Material_Process_Id == Material_Process.Material_Process_Id)
        .join(Material_Master, Material_Process.Material_Id == Material_Master.Material_Id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        {
            "Stitching_Details_Id": r[0],
            "Material_Process_Id": r[1],
            "Material_Desc": r[2],
            "Size": r[3],
            "Stitching_Date": r[4],
            "Stitching_Status": r[5],
            "Quantity_Stitched": r[6],
            "Tailor_Id": r[7],
            "Quality_Check_Status": r[8],
            "Entry_Date": r[9],
            "Modified_Date": r[10]

        }
        for r in results
    ]

@router.get("/dropdown-options")
def get_stitching_dropdown_options(db: Session = Depends(get_db)):
    results = (
        db.query(
            Stitching_Details.Stitching_Details_Id,
            Stitching_Details.Quantity_Stitched,
            Material_Master.Material_Desc,
            Material_Master.Color
        )
        .join(Material_Process, Stitching_Details.Material_Process_Id == Material_Process.Material_Process_Id)
        .join(Material_Master, Material_Process.Material_Id == Material_Master.Material_Id)
        .all()
    )

    return [
        {
            "Stitching_Details_Id": r[0],
            "Quantity_Stitched": r[1],
            "Material_Desc": r[2],
            "Color": r[3]
        }
        for r in results
    ]



# Get a specific stitching detail by ID
@router.get("/{id}", response_model=StitchingDetailsOut)
def get_stitching_detail(id: int, db: Session = Depends(get_db)):
    detail = db.query(Stitching_Details).filter(Stitching_Details.Stitching_Details_Id == id).first()
    if not detail:
        raise HTTPException(status_code=404, detail="Stitching detail not found")
    return detail

# Update stitching detail
@router.put("/{id}", response_model=StitchingDetailsOut)
def update_stitching_detail(id: int, updated: StitchingDetailsUpdate, db: Session = Depends(get_db)):
    detail = db.query(Stitching_Details).filter(Stitching_Details.Stitching_Details_Id == id).first()
    if not detail:
        raise HTTPException(status_code=404, detail="Stitching detail not found")

    for key, value in updated.dict(exclude_unset=True).items():
        setattr(detail, key, value)

    db.commit()
    db.refresh(detail)
    return detail

# Delete stitching detail
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stitching_detail(id: int, db: Session = Depends(get_db)):
    detail = db.query(Stitching_Details).filter(Stitching_Details.Stitching_Details_Id == id).first()
    if not detail:
        raise HTTPException(status_code=404, detail="Stitching detail not found")

    db.delete(detail)
    db.commit()
    return
