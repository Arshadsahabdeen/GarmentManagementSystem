from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

class MaterialProcessBase(BaseModel):
    Material_Id: int
    Quantity_Processed: Decimal
    Processed_Date: date

class MaterialProcessCreate(MaterialProcessBase):
    pass

class MaterialProcessUpdate(BaseModel):
    Material_Id: Optional[int]
    Quantity_Processed: Optional[Decimal]
    Processed_Date: Optional[date]

class MaterialProcessOut(MaterialProcessBase):
    Material_Process_Id: int
    Entry_Date: datetime
    Modified_Date: datetime

    class Config:
        orm_mode = True
