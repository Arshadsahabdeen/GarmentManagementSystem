from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models.dispatch import Dispatch
from app.db.models.material_master import Material_Master
from sqlalchemy import func
from app.schemas.report import PriceProfitOverTimeOut
from datetime import date

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

@router.get("/price-profit-over-time", response_model=list[PriceProfitOverTimeOut])
def get_price_profit_over_time(db: Session = Depends(get_db)):
    # Monthly purchase totals from Material_Master
    purchase_data = db.query(
        func.date_format(Material_Master.Purchase_Date, "%Y-%m").label("month"),
        func.sum(Material_Master.Price).label("total_price_bought")
    ).group_by("month").all()

    # Monthly dispatch totals from Dispatch_Details
    dispatch_data = db.query(
        func.date_format(Dispatch.Dispatch_Date, "%Y-%m").label("month"),
        func.sum(Dispatch.Price).label("total_price_sold")
    ).group_by("month").all()

    # Merge and calculate profit
    combined = {}
    for row in purchase_data:
        month = row[0]
        combined[month] = {"date": month, "total_price_bought": float(row[1]), "total_price_sold": 0.0}

    for row in dispatch_data:
        month = row[0]
        if month in combined:
            combined[month]["total_price_sold"] = float(row[1])
        else:
            combined[month] = {"date": month, "total_price_bought": 0.0, "total_price_sold": float(row[1])}

    # Calculate profit
    result = []
    for value in combined.values():
        profit = value["total_price_sold"] - value["total_price_bought"]
        result.append({
            "date": value["date"],
            "total_price_bought": value["total_price_bought"],
            "total_price_sold": value["total_price_sold"],
            "profit": profit
        })

    return sorted(result, key=lambda x: x["date"])

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


