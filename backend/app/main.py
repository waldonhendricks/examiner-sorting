import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import examiners, health, reports, search
from app.core.config import settings
from app.core.database import Base, engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Examiner Finder SA API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(search.router)
app.include_router(examiners.router)
app.include_router(reports.router)


@app.on_event("startup")
async def startup_event() -> None:
    logger.info("%s started", settings.APP_NAME)


@app.get("/")
async def root() -> dict:
    return {"message": "Examiner Finder SA API", "version": "1.0.0"}
