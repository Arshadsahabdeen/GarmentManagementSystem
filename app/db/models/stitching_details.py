# app/db/models/stitching_details.py
from sqlalchemy import Column, Integer, ForeignKey, Float, Boolean, Date, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class Stitching_Details(Base):
    __tablename__ = "Stitching_Details"
    Stitching_Details_Id = Column(Integer, primary_key=True, index=True)
    Material_Process_Id = Column(Integer, ForeignKey("Material_Process.Material_Process_Id"), nullable=False)
    Size = Column(Float, nullable=False)
    Stitching_Date = Column(Date, nullable=False)
    Stitching_Status = Column(Boolean, nullable=False)
    Quantity_Stitched = Column(Integer, nullable=False)
    Tailor_Id = Column(Integer, ForeignKey("Tailor_Master.Tailor_Id"), nullable=False)
    Quality_Check_Status = Column(Boolean, nullable=False)
    Entry_Date = Column(TIMESTAMP, server_default=func.current_timestamp())
    Modified_Date = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
