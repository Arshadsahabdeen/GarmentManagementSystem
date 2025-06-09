from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

class MaterialProcessCreate(BaseModel):
    Material_Id: int
    Quantity_Processed: Decimal
    Processed_Date: date

class MaterialProcessUpdate(BaseModel):
    Material_Id: Optional[int]
    Quantity_Processed: Optional[Decimal]
    Processed_Date: Optional[date]

class MaterialProcessOut(BaseModel):
    Material_Process_Id: int
    Material_Id: int    
    Quantity_Processed: float
    Processed_Date: date
    Material_Desc: str
    Color: str
    Entry_Date: datetime
    Modified_Date: datetime

    class Config:
        from_attributes = True
