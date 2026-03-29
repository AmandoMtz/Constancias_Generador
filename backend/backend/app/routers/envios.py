from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pathlib import Path
import shutil
from ..config import LOTES_DIR
from ..database import get_db, Envio
from ..auth import get_current_user, Usuario

router = APIRouter(prefix="/api/envios", tags=["envios"])


@router.get("/")
async def listar_envios(
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(Envio).order_by(Envio.id.desc()))
    return [
        {
            "id":          e.id,
            "plantilla_id": e.plantilla_id,
            "metodo":      e.metodo,
            "estado":      e.estado,
            "total":       e.total,
            "enviados":    e.enviados,
            "errores":     e.errores,
            "zip_listo":   e.zip_listo,
            "created_at":  e.created_at.isoformat() if e.created_at else None,
        }
        for e in result.scalars().all()
    ]


@router.delete("/{envio_id}")
async def eliminar_envio(
    envio_id: int,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(Envio).where(Envio.id == envio_id))
    envio = result.scalar_one_or_none()
    if not envio:
        raise HTTPException(status_code=404, detail="Envío no encontrado")

    if envio.ruta_zip:
        Path(envio.ruta_zip).unlink(missing_ok=True)

    lote_dir = LOTES_DIR / str(envio_id)
    if lote_dir.exists():
        shutil.rmtree(lote_dir, ignore_errors=True)

    await db.delete(envio)
    await db.commit()
    return {"ok": True, "message": "Envío eliminado"}
