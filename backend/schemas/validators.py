"""
Custom Pydantic validators for the health platform
"""
from datetime import datetime
from typing import Any
from pydantic import field_validator


def validate_future_datetime(value: datetime) -> datetime:
    """Validate that a datetime is in the future"""
    if value < datetime.now():
        raise ValueError('Date cannot be in the past')
    return value


def validate_past_datetime(value: datetime) -> datetime:
    """Validate that a datetime is in the past"""
    if value > datetime.now():
        raise ValueError('Date cannot be in the future')
    return value


def validate_positive_number(value: float) -> float:
    """Validate that a number is positive"""
    if value <= 0:
        raise ValueError('Value must be positive')
    return value


def validate_percentage(value: float) -> float:
    """Validate that a value is a valid percentage (0-100)"""
    if not 0 <= value <= 100:
        raise ValueError('Percentage must be between 0 and 100')
    return value


def validate_phone_number(value: str) -> str:
    """Validate phone number format"""
    import re
    # Basic phone number validation - adjust regex as needed
    phone_pattern = r'^\+?[\d\s\-\(\)]{10,20}$'
    if not re.match(phone_pattern, value):
        raise ValueError('Invalid phone number format')
    return value


def validate_username(value: str) -> str:
    """Validate username format"""
    import re
    # Username should be alphanumeric with underscores, 3-50 chars
    username_pattern = r'^[a-zA-Z0-9_]{3,50}$'
    if not re.match(username_pattern, value):
        raise ValueError('Username must be 3-50 characters, alphanumeric with underscores only')
    return value


def validate_password_strength(value: str) -> str:
    """Validate password strength"""
    if len(value) < 8:
        raise ValueError('Password must be at least 8 characters long')
    
    has_upper = any(c.isupper() for c in value)
    has_lower = any(c.islower() for c in value)
    has_digit = any(c.isdigit() for c in value)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in value)
    
    if not (has_upper and has_lower and has_digit):
        raise ValueError('Password must contain at least one uppercase letter, one lowercase letter, and one digit')
    
    return value
