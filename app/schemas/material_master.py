from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

class MaterialBase(BaseModel):
    Material_Desc: str
    Quantity: Optional[Decimal]
    Color: Optional[str]
    Price: Optional[Decimal]
    Pattern: Optional[str]
    Purchase_Date: Optional[date]
    Comments: Optional[str]

class MaterialCreate(MaterialBase):
    pass

class MaterialUpdate(BaseModel):
    Material_Desc: Optional[str]
    Quantity: Optional[Decimal]
    Color: Optional[str]
    Price: Optional[Decimal]
    Pattern: Optional[str]
    Purchase_Date: Optional[date]
    Comments: Optional[str]

class MaterialOut(MaterialBase):
    Material_Id: int
    Entry_Date: datetime
    Modified_Date: datetime

    class Config:
        from_attributes = True
