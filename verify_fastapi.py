#!/usr/bin/env python3
"""
Verification script for FastAPI migration
Checks that all required modules can be imported
"""

import sys

def check_imports():
    errors = []

    try:
        print("✓ Checking FastAPI...")
        import fastapi
        print(f"  FastAPI version: {fastapi.__version__}")
    except ImportError as e:
        errors.append(f"✗ FastAPI import failed: {e}")

    try:
        print("✓ Checking SQLAlchemy...")
        import sqlalchemy
        print(f"  SQLAlchemy version: {sqlalchemy.__version__}")
    except ImportError as e:
        errors.append(f"✗ SQLAlchemy import failed: {e}")

    try:
        print("✓ Checking asyncpg...")
        import asyncpg
        print(f"  asyncpg version: {asyncpg.__version__}")
    except ImportError as e:
        errors.append(f"✗ asyncpg import failed: {e}")

    try:
        print("✓ Checking Celery...")
        import celery
        print(f"  Celery version: {celery.__version__}")
    except ImportError as e:
        errors.append(f"✗ Celery import failed: {e}")

    try:
        print("✓ Checking boto3...")
        import boto3
        print(f"  boto3 version: {boto3.__version__}")
    except ImportError as e:
        errors.append(f"✗ boto3 import failed: {e}")

    try:
        print("✓ Checking pydantic...")
        import pydantic
        print(f"  pydantic version: {pydantic.__version__}")
    except ImportError as e:
        errors.append(f"✗ pydantic import failed: {e}")

    try:
        print("✓ Checking jose (JWT)...")
        import jose
    except ImportError as e:
        errors.append(f"✗ jose import failed: {e}")

    try:
        print("✓ Checking passlib...")
        import passlib
    except ImportError as e:
        errors.append(f"✗ passlib import failed: {e}")

    print("\n" + "="*50)

    if errors:
        print("❌ Some dependencies are missing:")
        for error in errors:
            print(f"  {error}")
        print("\nPlease run: pip install -r requirements.txt")
        return False
    else:
        print("✅ All dependencies are installed correctly!")
        return True

def check_project_structure():
    import os

    print("\n" + "="*50)
    print("Checking project structure...")

    required_files = [
        "app/main.py",
        "app/core/config.py",
        "app/core/database.py",
        "app/models/__init__.py",
        "app/api/v1/router.py",
        "requirements.txt",
        "alembic.ini",
    ]

    missing = []
    for file in required_files:
        if os.path.exists(file):
            print(f"✓ {file}")
        else:
            missing.append(file)
            print(f"✗ {file} - MISSING")

    print("\n" + "="*50)

    if missing:
        print(f"❌ Missing {len(missing)} required files")
        return False
    else:
        print("✅ All required files are present!")
        return True

def main():
    print("FastAPI Migration Verification")
    print("="*50)

    deps_ok = check_imports()
    structure_ok = check_project_structure()

    if deps_ok and structure_ok:
        print("\n🎉 FastAPI migration verification PASSED!")
        print("\nNext steps:")
        print("1. Copy .env.fastapi.example to .env and configure")
        print("2. Run database migrations: alembic upgrade head")
        print("3. Start Redis: redis-server")
        print("4. Start API: ./start_api.sh")
        print("5. Start Celery: ./start_celery.sh")
        print("\nAPI docs will be available at: http://localhost:3000/api")
        return 0
    else:
        print("\n❌ Verification failed. Please fix the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
