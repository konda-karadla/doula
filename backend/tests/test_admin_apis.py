#!/usr/bin/env python3
"""
Comprehensive test suite for Admin API endpoints.
Tests all admin functionality including user management, staff management, and analytics.
"""
import pytest
import json
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from models.system import System
from models.user import User
from models.staff import Staff, Department
from core.security import get_password_hash


class TestAdminAPIs:
    """Comprehensive test suite for Admin API endpoints."""
    
    @pytest.fixture
    async def test_system(self, db_session: AsyncSession) -> System:
        """Create a test system."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        system = System(
            name=f"Test System {unique_id}",
            slug=f"test-system-{unique_id}"
        )
        db_session.add(system)
        await db_session.commit()
        await db_session.refresh(system)
        return system
    
    @pytest.fixture
    async def test_admin_user(self, db_session: AsyncSession, test_system: System) -> User:
        """Create a test admin user."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        user = User(
            email=f"admin{unique_id}@example.com",
            username=f"admin{unique_id}",
            password=get_password_hash("adminpassword123"),
            profile_type="admin",
            journey_type="general",
            system_id=test_system.id,
            role="admin"
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        return user
    
    @pytest.fixture
    async def test_regular_user(self, db_session: AsyncSession, test_system: System) -> User:
        """Create a test regular user."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        user = User(
            email=f"user{unique_id}@example.com",
            username=f"user{unique_id}",
            password=get_password_hash("userpassword123"),
            profile_type="patient",
            journey_type="general",
            system_id=test_system.id,
            role="patient"
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        return user
    
    @pytest.fixture
    async def admin_auth_headers(self, client: AsyncClient, test_admin_user: User) -> Dict[str, str]:
        """Get authentication headers for admin user."""
        response = await client.post(
            "/auth/login",
            json={
                "email": test_admin_user.email,
                "password": "adminpassword123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        return {"Authorization": f"Bearer {data['accessToken']}"}
    
    @pytest.fixture
    async def user_auth_headers(self, client: AsyncClient, test_regular_user: User) -> Dict[str, str]:
        """Get authentication headers for regular user."""
        response = await client.post(
            "/auth/login",
            json={
                "email": test_regular_user.email,
                "password": "userpassword123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        return {"Authorization": f"Bearer {data['accessToken']}"}
    
    # ==================== USER MANAGEMENT TESTS ====================
    
    @pytest.mark.asyncio
    async def test_admin_get_all_users(self, client: AsyncClient, admin_auth_headers: Dict[str, str]):
        """Test admin can get all users."""
        response = await client.get("/admin/users", headers=admin_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    @pytest.mark.asyncio
    async def test_admin_create_user(self, client: AsyncClient, admin_auth_headers: Dict[str, str]):
        """Test admin can create a new user."""
        response = await client.post(
            "/admin/users",
            headers=admin_auth_headers,
            json={
                "email": "newuser@example.com",
                "username": "newuser",
                "password": "newpassword123",
                "profileType": "patient",
                "journeyType": "general",
                "role": "patient"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["username"] == "newuser"
        return data["id"]
    
    @pytest.mark.asyncio
    async def test_admin_get_user_by_id(self, client: AsyncClient, admin_auth_headers: Dict[str, str], test_regular_user: User):
        """Test admin can get user by ID."""
        response = await client.get(f"/admin/users/{test_regular_user.id}", headers=admin_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_regular_user.id
        assert data["email"] == test_regular_user.email
    
    @pytest.mark.asyncio
    async def test_admin_update_user(self, client: AsyncClient, admin_auth_headers: Dict[str, str], test_regular_user: User):
        """Test admin can update user."""
        response = await client.put(
            f"/admin/users/{test_regular_user.id}",
            headers=admin_auth_headers,
            json={
                "username": "updatedusername",
                "profileType": "patient",
                "journeyType": "general"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "updatedusername"
    
    @pytest.mark.asyncio
    async def test_admin_search_users(self, client: AsyncClient, admin_auth_headers: Dict[str, str], test_regular_user: User):
        """Test admin can search users."""
        response = await client.get(
            f"/admin/users/search?q={test_regular_user.email}",
            headers=admin_auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if data:  # If results found
            assert any(user["email"] == test_regular_user.email for user in data)
    
    @pytest.mark.asyncio
    async def test_admin_activate_user(self, client: AsyncClient, admin_auth_headers: Dict[str, str], test_regular_user: User):
        """Test admin can activate user."""
        response = await client.post(f"/admin/users/{test_regular_user.id}/activate", headers=admin_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_regular_user.id
    
    @pytest.mark.asyncio
    async def test_admin_deactivate_user(self, client: AsyncClient, admin_auth_headers: Dict[str, str], test_regular_user: User):
        """Test admin can deactivate user."""
        response = await client.post(f"/admin/users/{test_regular_user.id}/deactivate", headers=admin_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_regular_user.id
    
    # ==================== STAFF MANAGEMENT TESTS ====================
    
    @pytest.fixture
    async def test_department(self, db_session: AsyncSession, test_system: System) -> Department:
        """Create a test department."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        department = Department(
            name=f"Test Department {unique_id}",
            description="Test department for testing",
            system_id=test_system.id
        )
        db_session.add(department)
        await db_session.commit()
        await db_session.refresh(department)
        return department
    
    @pytest.mark.asyncio
    async def test_admin_create_department(self, client: AsyncClient, admin_auth_headers: Dict[str, str]):
        """Test admin can create department."""
        response = await client.post(
            "/admin/departments",
            headers=admin_auth_headers,
            json={
                "name": "Test Department",
                "description": "A test department"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Department"
        return data["id"]
    
    @pytest.mark.asyncio
    async def test_admin_get_all_departments(self, client: AsyncClient, admin_auth_headers: Dict[str, str]):
        """Test admin can get all departments."""
        response = await client.get("/admin/departments", headers=admin_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    @pytest.mark.asyncio
    async def test_admin_register_staff(self, client: AsyncClient, admin_auth_headers: Dict[str, str], test_department: Department):
        """Test admin can register staff."""
        response = await client.post(
            "/admin/staff/register",
            headers=admin_auth_headers,
            json={
                "email": "staff@example.com",
                "username": "staffmember",
                "password": "staffpassword123",
                "firstName": "John",
                "lastName": "Doe",
                "staffType": "physician",
                "departmentId": test_department.id,
                "credentials": "MD",
                "specialization": "Internal Medicine",
                "licenseNumber": "MD123456"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["user"]["email"] == "staff@example.com"
        assert data["staff"]["firstName"] == "John"
        return data["staff"]["id"]
    
    @pytest.mark.asyncio
    async def test_admin_get_all_staff(self, client: AsyncClient, admin_auth_headers: Dict[str, str]):
        """Test admin can get all staff."""
        response = await client.get("/admin/staff", headers=admin_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    @pytest.mark.asyncio
    async def test_admin_list_staff_with_filters(self, client: AsyncClient, admin_auth_headers: Dict[str, str]):
        """Test admin can list staff with filters."""
        response = await client.get(
            "/admin/staff/list?staff_type=physician&limit=10",
            headers=admin_auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert isinstance(data["items"], list)
    
    # ==================== SYSTEM CONFIGURATION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_admin_get_system_configs(self, client: AsyncClient, admin_auth_headers: Dict[str, str]):
        """Test admin can get system configurations."""
        response = await client.get("/admin/configs", headers=admin_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    @pytest.mark.asyncio
    async def test_admin_set_system_config(self, client: AsyncClient, admin_auth_headers: Dict[str, str]):
        """Test admin can set system configuration."""
        response = await client.put(
            "/admin/configs/test_config?config_value=test_value&data_type=string",
            headers=admin_auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["configKey"] == "test_config"
        assert data["configValue"] == "test_value"
    
    @pytest.mark.asyncio
    async def test_admin_get_system_config(self, client: AsyncClient, admin_auth_headers: Dict[str, str]):
        """Test admin can get specific system configuration."""
        # First set a config
        await client.put(
            "/admin/configs/test_config_get?config_value=test_value_get&data_type=string",
            headers=admin_auth_headers
        )
        
        # Then get it
        response = await client.get("/admin/configs/test_config_get", headers=admin_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["configKey"] == "test_config_get"
        assert data["configValue"] == "test_value_get"
    
    # ==================== FEATURE FLAGS TESTS ====================
    
    @pytest.mark.asyncio
    async def test_admin_get_feature_flags(self, client: AsyncClient, admin_auth_headers: Dict[str, str]):
        """Test admin can get feature flags."""
        response = await client.get("/admin/feature-flags", headers=admin_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    @pytest.mark.asyncio
    async def test_admin_set_feature_flag(self, client: AsyncClient, admin_auth_headers: Dict[str, str]):
        """Test admin can set feature flag."""
        response = await client.put(
            "/admin/feature-flags/test_feature?is_enabled=true&rollout_percentage=50",
            headers=admin_auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["flagName"] == "test_feature"
        assert data["isEnabled"] is True
        assert data["rolloutPercentage"] == 50
    
    # ==================== ANALYTICS TESTS ====================
    
    @pytest.mark.asyncio
    async def test_admin_get_user_analytics(self, client: AsyncClient, admin_auth_headers: Dict[str, str]):
        """Test admin can get user analytics."""
        response = await client.get("/admin/analytics/users", headers=admin_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "totalUsers" in data
        assert "activeUsers" in data
    
    @pytest.mark.asyncio
    async def test_admin_get_lab_analytics(self, client: AsyncClient, admin_auth_headers: Dict[str, str]):
        """Test admin can get lab analytics."""
        response = await client.get("/admin/analytics/labs", headers=admin_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "totalLabResults" in data
        assert "pendingResults" in data
    
    @pytest.mark.asyncio
    async def test_admin_get_action_plan_analytics(self, client: AsyncClient, admin_auth_headers: Dict[str, str]):
        """Test admin can get action plan analytics."""
        response = await client.get("/admin/analytics/action-plans", headers=admin_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "totalActionPlans" in data
        assert "completedPlans" in data
    
    @pytest.mark.asyncio
    async def test_admin_get_comprehensive_analytics(self, client: AsyncClient, admin_auth_headers: Dict[str, str]):
        """Test admin can get comprehensive analytics."""
        response = await client.get("/admin/analytics/comprehensive", headers=admin_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        # Should contain various analytics data
        assert len(data) > 0
    
    # ==================== PERMISSION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_regular_user_cannot_access_admin_endpoints(self, client: AsyncClient, user_auth_headers: Dict[str, str]):
        """Test regular user cannot access admin endpoints."""
        response = await client.get("/admin/users", headers=user_auth_headers)
        assert response.status_code == 403  # Forbidden
    
    @pytest.mark.asyncio
    async def test_unauthorized_access_to_admin_endpoints(self, client: AsyncClient):
        """Test unauthorized access to admin endpoints."""
        response = await client.get("/admin/users")
        assert response.status_code in [401, 403]  # Unauthorized or Forbidden
    
    # ==================== ERROR HANDLING TESTS ====================
    
    @pytest.mark.asyncio
    async def test_admin_get_nonexistent_user(self, client: AsyncClient, admin_auth_headers: Dict[str, str]):
        """Test admin getting non-existent user returns 404."""
        response = await client.get("/admin/users/non-existent-id", headers=admin_auth_headers)
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_admin_create_user_with_existing_email(self, client: AsyncClient, admin_auth_headers: Dict[str, str], test_regular_user: User):
        """Test admin creating user with existing email returns error."""
        response = await client.post(
            "/admin/users",
            headers=admin_auth_headers,
            json={
                "email": test_regular_user.email,  # Existing email
                "username": "newuser",
                "password": "newpassword123",
                "profileType": "patient",
                "journeyType": "general",
                "role": "patient"
            }
        )
        assert response.status_code == 400  # Bad Request
    
    @pytest.mark.asyncio
    async def test_admin_invalid_json_request(self, client: AsyncClient, admin_auth_headers: Dict[str, str]):
        """Test admin endpoint with invalid JSON."""
        response = await client.post(
            "/admin/users",
            headers=admin_auth_headers,
            data="invalid json"
        )
        assert response.status_code == 422  # Unprocessable Entity
