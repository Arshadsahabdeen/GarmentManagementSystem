from sqlalchemy import Column, Integer, ForeignKey, Float, Boolean, Date, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship
from app.db.models.material_master import Material_Master


class Stitching_Details(Base):
    __tablename__ = "stitching_details"

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
    Material_Id = Column(Integer, ForeignKey("material_master.Material_Id"), nullable=True)
    material = relationship(Material_Master)

