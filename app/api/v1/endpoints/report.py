from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models.dispatch import Dispatch
from app.db.models.material_master import Material_Master
from sqlalchemy import func

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/price-profit-summary")
def price_profit_summary(db: Session = Depends(get_db)):
    # Example: sum price bought from material_master and sum price sold (dispatch)
    total_price_bought = db.query(func.sum(Material_Master.Price)).scalar() or 0
    total_price_sold = db.query(func.sum(Dispatch.Price)).scalar() or 0
    profit = total_price_sold - total_price_bought
    return {
        "total_price_bought": float(total_price_bought),
        "total_price_sold": float(total_price_sold),
        "profit": float(profit)
    }

@router.get("/stitched-by-material")
def stitched_by_material(db: Session = Depends(get_db)):
    from app.db.models.dispatch import Dispatch
    from app.db.models.stitching_details import Stitching_Details
    from app.db.models.material_process import Material_Process

    result = (
        db.query(
            Material_Master.Material_Desc,
            func.sum(Dispatch.Quantity_Dispatched).label("total_dispatched")
        )
        .join(Stitching_Details, Stitching_Details.Stitching_Details_Id == Dispatch.Stitching_Details_Id)
        .join(Material_Process, Material_Process.Material_Process_Id == Stitching_Details.Material_Process_Id)
        .join(Material_Master, Material_Master.Material_Id == Material_Process.Material_Id)
        .group_by(Material_Master.Material_Desc)
        .all()
    )

    return [
        {"materialDesc": r[0], "quantityStitched": float(r[1])}
        for r in result if r[1] > 0
    ]


