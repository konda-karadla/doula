"""
Custom exception classes for the application.
"""
from typing import Any, Dict, Optional


class HealthPlatformException(Exception):
    """Base exception for all application-specific exceptions."""
    
    def __init__(
        self, 
        message: str, 
        details: Optional[Dict[str, Any]] = None,
        status_code: int = 500
    ):
        self.message = message
        self.details = details or {}
        self.status_code = status_code
        super().__init__(self.message)


class ValidationError(HealthPlatformException):
    """Raised when data validation fails."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, details, 422)


class AuthenticationError(HealthPlatformException):
    """Raised when authentication fails."""
    
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status_code=401)


class AuthorizationError(HealthPlatformException):
    """Raised when authorization fails."""
    
    def __init__(self, message: str = "Access denied"):
        super().__init__(message, status_code=403)


class NotFoundError(HealthPlatformException):
    """Raised when a resource is not found."""
    
    def __init__(self, resource: str, identifier: Any):
        message = f"{resource} with id '{identifier}' not found"
        super().__init__(message, status_code=404)


class ConflictError(HealthPlatformException):
    """Raised when a resource conflict occurs."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, details, 409)


class ExternalServiceError(HealthPlatformException):
    """Raised when an external service fails."""
    
    def __init__(self, service: str, message: str):
        full_message = f"External service '{service}' error: {message}"
        super().__init__(full_message, status_code=502)


class DatabaseError(HealthPlatformException):
    """Raised when a database operation fails."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(f"Database error: {message}", details, 500)


class BusinessLogicError(HealthPlatformException):
    """Raised when business logic validation fails."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, details, 400)


# Exception handlers for FastAPI
from fastapi import Request, status
from fastapi.responses import JSONResponse


async def health_platform_exception_handler(request: Request, exc: HealthPlatformException):
    """Handler for custom exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "details": exc.details,
            "path": str(request.url)
        }
    )


async def validation_exception_handler(request: Request, exc: ValidationError):
    """Handler for validation errors"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation error",
            "message": exc.message,
            "details": exc.details,
            "path": str(request.url)
        }
    )


# Export all exception handlers
EXCEPTION_HANDLERS = {
    HealthPlatformException: health_platform_exception_handler,
    ValidationError: validation_exception_handler,
    AuthenticationError: health_platform_exception_handler,
    AuthorizationError: health_platform_exception_handler,
    NotFoundError: health_platform_exception_handler,
    ConflictError: health_platform_exception_handler,
    ExternalServiceError: health_platform_exception_handler,
    DatabaseError: health_platform_exception_handler,
    BusinessLogicError: health_platform_exception_handler,
}

