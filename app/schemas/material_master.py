from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from typing import Union

class MaterialBase(BaseModel):
    Material_Desc: str
    Quantity: Union[Decimal, float, int]
    Color: str
    Price: Union[Decimal, float, int]
    Pattern: str
    Purchase_Date: date
    Comments: Optional[str]


class MaterialCreate(MaterialBase):
    pass

class MaterialUpdate(BaseModel):
    Material_Desc: str
    Quantity: Decimal
    Color: str
    Price: Decimal
    Pattern: str
    Purchase_Date: date
    Comments: Optional[str]

class MaterialOut(MaterialBase):
    Material_Id: int
    Entry_Date: datetime
    Modified_Date: datetime

    class Config:
        from_attributes = True
