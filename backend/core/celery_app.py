from celery import Celery

from backend.core.config import settings

celery_app = Celery(
    "health_platform",
    broker=settings.celery_broker,
    backend=settings.celery_backend,
    include=["app.tasks.ocr_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,
    task_soft_time_limit=25 * 60,
)
