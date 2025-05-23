from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models.stitching_details import Stitching_Details
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
    new_detail = Stitching_Details(**stitching.dict())
    db.add(new_detail)
    db.commit()
    db.refresh(new_detail)
    return new_detail

# Get all stitching details
@router.get("/", response_model=list[StitchingDetailsOut])
def get_stitching_details(db: Session = Depends(get_db)):
    return db.query(Stitching_Details).all()

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
