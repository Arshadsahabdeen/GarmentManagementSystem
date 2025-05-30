from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class DispatchBase(BaseModel):
    Stitching_Details_Id: int
    Dispatch_Date: date
    Quantity_Dispatched: int
    Price: float
    Receiver_Name: str
    Dispatch_Status: bool
    Remarks: Optional[str] = None

class DispatchCreate(BaseModel):
    Stitching_Details_Id: int
    Dispatch_Date: date
    Quantity_Dispatched: int
    Price: float
    Receiver_Name: str
    Dispatch_Status: bool
    Remarks: Optional[str] = None

class DispatchUpdate(DispatchBase):
    pass

class DispatchOut(DispatchBase):
    Dispatch_Id: int
    Entry_Date: Optional[datetime] 
    Modified_Date: Optional[datetime]

    class Config:
        from_attributes = True
