import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from .auth import hash_password
from .config import get_cors_origins
from .database import init_db, AsyncSessionLocal, Usuario


async def crear_admin_default():
    """Crea el usuario administrador por defecto si no existe ninguno."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Usuario).where(Usuario.rol == "admin"))
        admin = result.scalar_one_or_none()
        if not admin:
            admin_name = os.getenv("DEFAULT_ADMIN_NAME", "Administrador General")
            admin_email = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@tu-dominio.com")
            admin_password = os.getenv("DEFAULT_ADMIN_PASSWORD", "CambiaEstoYa123!")

            admin = Usuario(
                nombre=admin_name,
                email=admin_email,
                hashed_pw=hash_password(admin_password),
                rol="admin",
                activo=True,
            )
            db.add(admin)
            await db.commit()
            print(f"✅  Admin creado: {admin_email}")
        else:
            print(f"✅  Admin ya existe: {admin.email}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await crear_admin_default()
    yield


app = FastAPI(
    title="Constancias UAT - FI Tampico",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .routers import auth, usuarios, personas, plantillas, constancias, envios, excel

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(personas.router)
app.include_router(plantillas.router)
app.include_router(constancias.router)
app.include_router(envios.router)
app.include_router(excel.router)


@app.get("/api")
async def root():
    return {"status": "ok", "app": "Constancias UAT"}
