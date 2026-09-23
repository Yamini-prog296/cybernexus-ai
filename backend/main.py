import os
import datetime
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.database import engine, Base, SessionLocal
from app.models import SecurityEventModel
from app.routers import events, incidents, dashboard, analytics, demo
from app.schemas import HealthResponse
from app.services.ai_provider import ai_provider


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)

    # Auto-seed if database is completely empty
    db = SessionLocal()
    try:
        count = db.query(SecurityEventModel).count()
        if count == 0:
            print("[CyberNexus AI] Database empty on startup. Initializing demo seed data...")
            # Trigger demo seed
            await demo.start_demo(db)
            print("[CyberNexus AI] Demo data initialized successfully.")
    except Exception as e:
        print(f"[CyberNexus AI] Startup seed notice: {e}")
    finally:
        db.close()

    yield


app = FastAPI(
    title="CYBERNEXUS AI - Defensive Security Intelligence Center",
    description="AI-powered multi-source log correlation, behavioural anomaly detection, risk prioritization, and explainable threat intelligence.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for seamless local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(events.router)
app.include_router(incidents.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(demo.router)


@app.get("/api/health", response_model=HealthResponse, tags=["health"])
def health_check():
    return HealthResponse(
        status="healthy",
        soc_system="OPERATIONAL",
        ai_provider=ai_provider.get_active_provider_name(),
        database="SQLite (Ready for PostgreSQL migration)",
        version="1.0.0",
        timestamp=datetime.datetime.now(datetime.timezone.utc)
    )


# Mount Frontend Production Build if present
dist_path = Path(__file__).resolve().parent.parent / "frontend" / "dist"
assets_path = dist_path / "assets"

if assets_path.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")

if dist_path.exists():
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/") or full_path == "api" or full_path.startswith("docs") or full_path.startswith("openapi"):
            raise HTTPException(status_code=404, detail="Not Found")
        target_file = dist_path / full_path
        if full_path and target_file.is_file():
            return FileResponse(str(target_file))
        return FileResponse(str(dist_path / "index.html"))
else:
    @app.get("/", tags=["root"])
    def root():
        return {
            "product": "CYBERNEXUS AI",
            "tagline": "From scattered security events to explainable threat intelligence.",
            "status": "● SOC SYSTEM OPERATIONAL",
            "docs_url": "/docs"
        }


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host=host, port=port, reload=True)
