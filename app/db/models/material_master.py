from sqlalchemy import Column, Integer, String, DECIMAL, Date, Text, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship

class Material_Master(Base):
    __tablename__ = "material_master"  # lowercase table name

    Material_Id = Column(Integer, primary_key=True, index=True)
    Material_Desc = Column(String(255), nullable=False)
    Quantity = Column(DECIMAL(10, 2), nullable=True)
    Color = Column(String(50), nullable=True)
    Price = Column(DECIMAL(10, 2), nullable=True)
    Pattern = Column(String(100), nullable=True)
    Purchase_Date = Column(Date, nullable=True)
    Comments = Column(Text, nullable=True)
    Entry_Date = Column(TIMESTAMP, server_default=func.current_timestamp())
    Modified_Date = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    stitchings = relationship("Stitching_Details", back_populates="material")