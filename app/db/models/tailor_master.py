from sqlalchemy import Column, Integer, String, Text, Date, TIMESTAMP, func
from app.database import Base

class Tailor_Master(Base):
    __tablename__ = "Tailor_Master"

    Tailor_Id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Tailor_Name = Column(String(100), nullable=False)
    Age = Column(Integer, nullable=False)
    Gender = Column(String(10), nullable=False)
    Contact = Column(String(20), nullable=False)
    Experience = Column(Integer, nullable=False)
    Address = Column(Text, nullable=True)
    Date_of_Joining = Column(Date, nullable=False)
    Entry_Date = Column(TIMESTAMP, server_default=func.now())
    Modified_Date = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())