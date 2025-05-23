from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class TailorBase(BaseModel):
    Tailor_Name: str
    Age: int
    Gender: str
    Contact: str
    Experience: int
    Address: Optional[str] = None
    Date_of_Joining: date

class TailorCreate(TailorBase):
    pass

class TailorOut(TailorBase):
    Tailor_Id: int
    Entry_Date: Optional[datetime]
    Modified_Date: Optional[datetime]

    class Config:
        from_attributes = True
