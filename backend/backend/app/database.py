from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from .config import APP_DATA_DIR, get_database_url

DATABASE_URL = get_database_url()

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class Usuario(Base):
    __tablename__ = "usuarios"
    id         = Column(Integer, primary_key=True, index=True)
    nombre     = Column(String, nullable=False)
    email      = Column(String, unique=True, nullable=False, index=True)
    hashed_pw  = Column(String, nullable=False)
    rol        = Column(String, default="secretaria")
    activo     = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Persona(Base):
    __tablename__ = "personas"
    id           = Column(Integer, primary_key=True, index=True)
    tipo         = Column(String, nullable=False)
    nombre       = Column(String, nullable=False)
    email        = Column(String, nullable=False)
    programa     = Column(String, nullable=True)
    matricula    = Column(String, nullable=True)
    cargo        = Column(String, nullable=True)
    departamento = Column(String, nullable=True)
    created_at   = Column(DateTime, default=datetime.utcnow)


class Plantilla(Base):
    __tablename__ = "plantillas"
    id           = Column(Integer, primary_key=True, index=True)
    nombre       = Column(String, nullable=False)
    evento       = Column(String, nullable=True)
    fecha_evento = Column(String, nullable=True)
    formato      = Column(String, nullable=False)
    ruta_archivo = Column(String, nullable=False)
    marcadores   = Column(JSON, default=list)
    created_at   = Column(DateTime, default=datetime.utcnow)


class Envio(Base):
    __tablename__ = "envios"
    id           = Column(Integer, primary_key=True, index=True)
    plantilla_id = Column(Integer, ForeignKey("plantillas.id"))
    metodo       = Column(String, nullable=False)
    estado       = Column(String, default="pendiente")
    total        = Column(Integer, default=0)
    enviados     = Column(Integer, default=0)
    errores      = Column(Integer, default=0)
    zip_listo    = Column(Boolean, default=False)
    ruta_zip     = Column(String, nullable=True)
    created_at   = Column(DateTime, default=datetime.utcnow)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    APP_DATA_DIR.mkdir(parents=True, exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
