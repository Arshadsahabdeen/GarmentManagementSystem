# app/db/models/material_process.py
from sqlalchemy import Column, Integer, ForeignKey, DECIMAL, Date, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class Material_Process(Base):
    __tablename__ = "Material_Process"
    Material_Process_Id = Column(Integer, primary_key=True, index=True)
    Material_Id = Column(Integer, ForeignKey("Material_Master.Material_Id"), nullable=False)
    Quantity_Processed = Column(DECIMAL(10, 2), nullable=False)
    Processed_Date = Column(Date, nullable=False)
    Entry_Date = Column(TIMESTAMP, server_default=func.current_timestamp())
    Modified_Date = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
