from sqlalchemy import Column, Integer, String, Text, Date, DECIMAL, Boolean, TIMESTAMP, ForeignKey, func
from app.database import Base

class Dispatch(Base):
    __tablename__ = "Dispatch_Details"

    Dispatch_Id = Column(Integer, primary_key=True, index=True)
    Stitching_Details_Id = Column(Integer, ForeignKey("stitching_details.Stitching_Details_Id"), nullable=False)
    Dispatch_Date = Column(Date, nullable=False)
    Quantity_Dispatched = Column(Integer, nullable=False)
    Price = Column(DECIMAL(10, 2), nullable=False)
    Receiver_Name = Column(String(100), nullable=False)
    Dispatch_Status = Column(Boolean, nullable=False)
    Remarks = Column(Text)
    Entry_Date = Column(TIMESTAMP, server_default=func.now())
    Modified_Date = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
