from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from app.api.v1.endpoints import auth, material_master, material_process, stitching_details, tailor_master, dispatch, report

app = FastAPI()

# Serve Angular static files under /static
app.mount("/static", StaticFiles(directory="dist/login-frontend-v1/browser"), name="static")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(material_master.router, prefix="/api/v1/material_master", tags=["Material Master"])
app.include_router(material_process.router, prefix="/material-process", tags=["Material Process"])
app.include_router(stitching_details.router, prefix="/stitching-details", tags=["Stitching Details"])
app.include_router(tailor_master.router, prefix="/tailor-master", tags=["Tailor Master"])
app.include_router(dispatch.router, prefix="/dispatch", tags=["Dispatch"])
app.include_router(report.router, prefix="/report", tags=["Report"])

# Serve index.html for root
@app.get("/")
def serve_root():
    return FileResponse("dist/login-frontend-v1/browser/index.html")

# Serve index.html for Angular client-side routes
@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    return FileResponse("dist/login-frontend-v1/browser/index.html")
