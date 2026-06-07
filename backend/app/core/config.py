from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Examiner Finder SA"
    VERSION: str = "1.0.0"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql://user:password@localhost:5432/examiner_db"
    REDIS_URL: str = "redis://localhost:6379"
    OPENAI_API_KEY: str = ""
    OPENALEX_EMAIL: str = "admin@examiner-finder.ac.za"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    SA_UNIVERSITIES: List[str] = [
        "University of Cape Town", "UCT",
        "Stellenbosch University", "SU",
        "University of Pretoria", "UP",
        "University of Johannesburg", "UJ",
        "University of the Witwatersrand", "Wits",
        "North-West University", "NWU",
        "University of KwaZulu-Natal", "UKZN",
        "Nelson Mandela University", "NMU",
        "Rhodes University", "RU",
        "University of the Western Cape", "UWC",
        "Cape Peninsula University of Technology", "CPUT",
        "Tshwane University of Technology", "TUT",
        "Durban University of Technology", "DUT",
        "Central University of Technology", "CUT",
        "Vaal University of Technology", "VUT",
    ]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()
