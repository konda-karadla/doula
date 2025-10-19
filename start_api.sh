#!/bin/bash

echo "Starting FastAPI Health Platform..."

uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-3000} --reload
