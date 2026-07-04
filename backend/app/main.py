from fastapi import FastAPI

from app.auth import router as auth_router
from app.core.config import get_settings
from app.routers import health
from app.users import router as users_router


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        debug=settings.debug,
    )

    app.include_router(health.router)
    app.include_router(auth_router.router)
    app.include_router(users_router.router)
    return app


app = create_app()
