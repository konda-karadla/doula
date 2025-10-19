#!/bin/bash

echo "Starting Celery worker..."

celery -A backend.core.celery_app worker --loglevel=info
