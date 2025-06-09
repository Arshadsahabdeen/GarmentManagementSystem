from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class StitchingDetailsBase(BaseModel):
    Size: float
    Stitching_Date: date
    Stitching_Status: bool
    Quantity_Stitched: int
    Tailor_Id: int
    Quality_Check_Status: bool

class StitchingDetailsCreate(StitchingDetailsBase):
    Material_Process_Id: int

class StitchingDetailsUpdate(BaseModel):
    Material_Process_Id: Optional[int]
    Size: Optional[float]
    Stitching_Date: Optional[date]
    Stitching_Status: Optional[bool]
    Quantity_Stitched: Optional[int]
    Tailor_Id: Optional[int]
    Quality_Check_Status: Optional[bool]

class StitchingDetailsOut(BaseModel):
    Stitching_Details_Id: int
    Material_Process_Id: int
    Material_Desc: str
    Size: float
    Stitching_Date: date
    Stitching_Status: bool
    Quantity_Stitched: int
    Tailor_Id: int
    Quality_Check_Status: bool
    Entry_Date: datetime
    Modified_Date: datetime

    class Config:
        orm_mode = True
