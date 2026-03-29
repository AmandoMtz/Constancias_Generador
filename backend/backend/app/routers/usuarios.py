from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from typing import Optional
from ..database import get_db, Usuario
from ..auth import get_current_user, require_admin, hash_password

router = APIRouter(prefix="/api/usuarios", tags=["usuarios"])


class UsuarioCreate(BaseModel):
    nombre:   str
    email:    str
    password: str
    rol:      str = "secretaria"


class UsuarioPatch(BaseModel):
    activo: Optional[bool] = None
    rol:    Optional[str]  = None


@router.get("/")
async def listar_usuarios(
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    result = await db.execute(select(Usuario).order_by(Usuario.id))
    usuarios = result.scalars().all()
    return [
        {
            "id":         u.id,
            "nombre":     u.nombre,
            "email":      u.email,
            "rol":        u.rol,
            "activo":     u.activo,
            "last_login": u.last_login.isoformat() if u.last_login else None,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in usuarios
    ]


@router.post("/", status_code=201)
async def crear_usuario(
    data: UsuarioCreate,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    existing = await db.execute(select(Usuario).where(Usuario.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    user = Usuario(
        nombre    = data.nombre,
        email     = data.email,
        hashed_pw = hash_password(data.password),
        rol       = data.rol,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"id": user.id, "nombre": user.nombre, "email": user.email, "rol": user.rol}


@router.patch("/{user_id}")
async def actualizar_usuario(
    user_id: int,
    data: UsuarioPatch,
    db: AsyncSession = Depends(get_db),
    current: Usuario = Depends(require_admin),
):
    result = await db.execute(select(Usuario).where(Usuario.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if data.activo is not None:
        user.activo = data.activo
    if data.rol is not None:
        user.rol = data.rol

    await db.commit()
    return {"ok": True}
