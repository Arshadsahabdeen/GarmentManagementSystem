from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = (
    "mysql+pymysql://uf8nqwceg7hen4ls:fABMZigVfzcUCaXG758Z@bh9pddrgykbwbuzywtdb-mysql.services.clever-cloud.com:3306/bh9pddrgykbwbuzywtdb"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
