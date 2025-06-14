from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import auth, material_master, material_process,  stitching_details, tailor_master, dispatch, report

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://garmentmanagementsystem-frontend.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(material_master.router, prefix="/material_master", tags=["Material Master"])
app.include_router(material_process.router, prefix="/material-process/", tags=["Material Process"])
app.include_router(stitching_details.router, prefix="/stitching-details", tags=["Stitching Details"])
app.include_router(tailor_master.router, prefix="/tailor-master", tags=["Tailor Master"])
app.include_router(dispatch.router, prefix="/dispatch", tags=["Dispatch"])
app.include_router(report.router, prefix="/report", tags=["Report"])

@app.get("/")
def root():
    return {"message": "Welcome! Use POST /auth/login to get token."}
