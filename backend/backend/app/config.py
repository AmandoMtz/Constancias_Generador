from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

APP_ENV = os.getenv("APP_ENV", "development")
APP_DATA_DIR = Path(os.getenv("APP_DATA_DIR", "./data")).resolve()
APP_DATA_DIR.mkdir(parents=True, exist_ok=True)

UPLOADS_DIR = APP_DATA_DIR / "uploads"
UPLOADS_EXCEL_DIR = APP_DATA_DIR / "uploads_excels"
LOTES_DIR = APP_DATA_DIR / "lotes"

for directory in (UPLOADS_DIR, UPLOADS_EXCEL_DIR, LOTES_DIR):
    directory.mkdir(parents=True, exist_ok=True)

def get_database_url() -> str:
    default_db_path = (APP_DATA_DIR / "constancias.db").as_posix()
    return os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{default_db_path}")

def get_cors_origins() -> list[str]:
    raw = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,https://constancias.tudominio.com",
    )
    return [origin.strip() for origin in raw.split(",") if origin.strip()]
