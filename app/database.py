from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = (
    "mysql+pymysql://root:nKRFIUfjfvBjcNcsAZGOPgwNzozUOLml@nozomi.proxy.rlwy.net:42054/railway"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
