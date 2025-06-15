from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

# Replace with your actual database connection string
SQLALCHEMY_DATABASE_URL = (
    "mysql+pymysql://root:nKRFIUfjfvBjcNcsAZGOPgwNzozUOLml@nozomi.proxy.rlwy.net:42054/railway"
)

# Create engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ✅ This is what you were missing:
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()