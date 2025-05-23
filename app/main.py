from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import auth, material_master

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(material_master.router, prefix="/api/v1/material_master", tags=["Material Master"])

@app.get("/")
def root():
    return {"message": "Welcome! Use POST /api/v1/auth/login to get token."}
