"""
NAVORA FastAPI Application - Main Entry Point
Full-stack AI-powered Travel Operating Platform
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import Base, engine

# --- Import all models so SQLAlchemy sees them for table creation ---
import app.models  # noqa: F401

# --- Import all routers ---
from app.routers.auth import router as auth_router, register, login
from app.routers.destinations import router as destinations_router, list_destinations, get_destination_details
from app.routers.trips import router as trips_router
from app.routers.planning import router as planning_router
from app.routers.itinerary import router as itinerary_router
from app.routers.compare import router as compare_router
from app.routers.bookings import router as bookings_router
from app.routers.payments import router as payments_router
from app.routers.groups import router as groups_router
from app.routers.expenses import router as expenses_router
from app.routers.monitor import router as monitor_router
from app.routers.weather import router as weather_router
from app.routers.replanning import router as replanning_router
from app.routers.coins import router as coins_router
from app.routers.ai import router as ai_router
from app.routers.safety import router as safety_router
from app.routers.packing import router as packing_router
from app.routers.documents import router as documents_router
from app.routers.community import router as community_router
from app.routers.reviews import router as reviews_router
from app.routers.notifications import router as notifications_router
from app.routers.profile import router as profile_router
from app.routers.currency import router as currency_router

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("navora.main")


def _init_database():
    """Create all DB tables and seed demo data on first boot."""
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created / verified.")

    from sqlalchemy.orm import Session
    from app.database import SessionLocal
    from app.models.catalog import Destination
    from app.seed import seed_demo_data

    db: Session = SessionLocal()
    try:
        from app.models.auth import User
        demo_user = db.query(User).filter(User.email == "demo@navora.ai").first()
        if db.query(Destination).count() < 5 or not demo_user:
            logger.info("Seeding / refreshing demo catalog and verified demo user...")
            seed_demo_data(db)
    except Exception as exc:
        logger.error(f"Seed error (non-fatal): {exc}", exc_info=True)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup / shutdown lifecycle."""
    logger.info(f"NAVORA API starting — ENV={settings.APP_ENV} DEMO={settings.DEMO_MODE}")
    _init_database()
    yield
    logger.info("NAVORA API shutting down.")


# ── Create FastAPI App ──────────────────────────────────────────────────────
app = FastAPI(
    title="NAVORA API",
    description=(
        "NAVORA — AI-powered end-to-end Travel Operating Platform. "
        "Manage the complete travel lifecycle: Discover → Plan → Book → Travel → Return."
    ),
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# ── Middleware ──────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)


# ── Global exception handler ────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "path": str(request.url)},
    )


# ── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(destinations_router)
app.include_router(trips_router)
app.include_router(planning_router)
app.include_router(itinerary_router)
app.include_router(compare_router)
app.include_router(bookings_router)
app.include_router(payments_router)
app.include_router(groups_router)
app.include_router(expenses_router)
app.include_router(monitor_router)
app.include_router(weather_router)
app.include_router(replanning_router)
app.include_router(coins_router)
app.include_router(ai_router)
app.include_router(safety_router)
app.include_router(packing_router)
app.include_router(documents_router)
app.include_router(community_router)
app.include_router(reviews_router)
app.include_router(notifications_router)
app.include_router(profile_router)
app.include_router(currency_router)

# ── Compatibility Aliases for /api/v1 and root /auth ─────────────────────────
from fastapi import APIRouter
from app.routers.auth import (
    register, login, send_otp, resend_otp, verify_otp,
    forgot_password, reset_password, logout, get_current_user_profile
)

v1_compat_router = APIRouter(prefix="/api/v1", tags=["API v1 Compatibility"])
v1_compat_router.add_api_route("/auth/register", register, methods=["POST"])
v1_compat_router.add_api_route("/auth/login", login, methods=["POST"])
v1_compat_router.add_api_route("/auth/send-otp", send_otp, methods=["POST"])
v1_compat_router.add_api_route("/auth/resend-otp", resend_otp, methods=["POST"])
v1_compat_router.add_api_route("/auth/verify-otp", verify_otp, methods=["POST"])
v1_compat_router.add_api_route("/auth/forgot-password", forgot_password, methods=["POST"])
v1_compat_router.add_api_route("/auth/reset-password", reset_password, methods=["POST"])
v1_compat_router.add_api_route("/auth/me", get_current_user_profile, methods=["GET"])
v1_compat_router.add_api_route("/auth/logout", logout, methods=["POST"])
v1_compat_router.add_api_route("/catalog/destinations", list_destinations, methods=["GET"])
v1_compat_router.add_api_route("/catalog/destinations/{slug_or_id}", get_destination_details, methods=["GET"])
app.include_router(v1_compat_router)

# Direct root /auth aliases to prevent 404 if called without /api prefix
root_auth_router = APIRouter(prefix="/auth", tags=["Root Auth Aliases"])
root_auth_router.add_api_route("/register", register, methods=["POST"])
root_auth_router.add_api_route("/login", login, methods=["POST"])
root_auth_router.add_api_route("/send-otp", send_otp, methods=["POST"])
root_auth_router.add_api_route("/resend-otp", resend_otp, methods=["POST"])
root_auth_router.add_api_route("/verify-otp", verify_otp, methods=["POST"])
root_auth_router.add_api_route("/forgot-password", forgot_password, methods=["POST"])
root_auth_router.add_api_route("/reset-password", reset_password, methods=["POST"])
root_auth_router.add_api_route("/me", get_current_user_profile, methods=["GET"])
root_auth_router.add_api_route("/logout", logout, methods=["POST"])
app.include_router(root_auth_router)


# ── Health / Root ───────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "env": settings.APP_ENV,
        "demo_mode": settings.DEMO_MODE,
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to NAVORA API — More Than Travel.",
        "docs": "/docs",
        "health": "/health",
    }
