from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Replace with your actual database connection string
SQLALCHEMY_DATABASE_URL = "mysql+mysqlconnector://root:root@localhost:3306/garment_db"

# Create engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
