import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

from core.config import settings
from core.database import Base

# Import all models to ensure they are registered with SQLAlchemy
from models import (
    System,
    User,
    RefreshToken,
    SystemConfig,
    FeatureFlag,
    LabResult,
    Biomarker,
    ActionPlan,
    ActionItem,
    Doctor,
    AvailabilitySlot,
    Consultation,
    Staff,
    Department,
    SOAPNote,
    SOAPNoteAttachment,
    VitalsRecord,
    VitalsAlert,
    NutritionAssessment,
    MealPlan,
    MealPlanDay,
    MealPlanMeal,
    NutritionFeedback,
    LabTestOrder,
    MedicalHistory,
    Medication,
    AuditLog,
    ModulePermission,
    ApplicationAccess,
)

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# Escape % in URL for ConfigParser (% needs to be %%)
# Also remove sslmode parameter as asyncpg handles SSL differently
db_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
# Remove sslmode query parameter for asyncpg
if "?sslmode=" in db_url:
    db_url = db_url.split("?sslmode=")[0]
db_url = db_url.replace("%", "%%")
config.set_main_option("sqlalchemy.url", db_url)


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    # For asyncpg, we need to handle SSL context manually
    import ssl
    config_section = config.get_section(config.config_ini_section, {})
    
    # Add SSL context for asyncpg
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    config_section["connect_args"] = {"ssl": ssl_context}
    
    connectable = async_engine_from_config(
        config_section,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
