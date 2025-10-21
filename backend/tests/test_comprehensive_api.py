#!/usr/bin/env python3
"""
Comprehensive API test suite for all endpoints in the health platform.
Tests all API endpoints to ensure they're working as expected.
"""
import pytest
import json
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from models.system import System
from models.user import User
from core.security import get_password_hash


class TestComprehensiveAPI:
    """Comprehensive test suite for all API endpoints."""
    
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
    async def test_user(self, db_session: AsyncSession, test_system: System) -> User:
        """Create a test user."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        user = User(
            email=f"test{unique_id}@example.com",
            username=f"testuser{unique_id}",
            password=get_password_hash("testpassword123"),
            profile_type="patient",
            journey_type="general",
            system_id=test_system.id
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        return user
    
    @pytest.fixture
    async def auth_headers(self, client: AsyncClient, test_user: User) -> Dict[str, str]:
        """Get authentication headers for test user."""
        response = await client.post(
            "/auth/login",
            json={
                "email": test_user.email,
                "password": "testpassword123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        return {"Authorization": f"Bearer {data['accessToken']}"}
    
    # ==================== AUTHENTICATION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_auth_register(self, client: AsyncClient, test_system: System):
        """Test user registration."""
        response = await client.post(
            "/auth/register",
            json={
                "email": "newuser@example.com",
                "username": "newuser",
                "password": "newpassword123",
                "profileType": "patient",
                "journeyType": "general",
                "systemSlug": test_system.slug
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["user"]["email"] == "newuser@example.com"
        assert "accessToken" in data
        assert "refreshToken" in data
    
    @pytest.mark.asyncio
    async def test_auth_login(self, client: AsyncClient, test_user: User):
        """Test user login."""
        response = await client.post(
            "/auth/login",
            json={
                "email": test_user.email,
                "password": "testpassword123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["email"] == test_user.email
        assert "accessToken" in data
        assert "refreshToken" in data
    
    @pytest.mark.asyncio
    async def test_auth_refresh(self, client: AsyncClient, test_user: User):
        """Test token refresh."""
        # First login to get tokens
        login_response = await client.post(
            "/auth/login",
            json={
                "email": test_user.email,
                "password": "testpassword123"
            }
        )
        refresh_token = login_response.json()["refreshToken"]
        
        # Test refresh
        response = await client.post(
            "/auth/refresh",
            json={"refreshToken": refresh_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "accessToken" in data
        assert "refreshToken" in data
    
    @pytest.mark.asyncio
    async def test_auth_logout(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test user logout."""
        response = await client.post(
            "/auth/logout",
            headers=auth_headers
        )
        assert response.status_code == 200
        assert "message" in response.json()
    
    # ==================== PROFILE TESTS ====================
    
    @pytest.mark.asyncio
    async def test_profile_get(self, client: AsyncClient, auth_headers: Dict[str, str], test_user: User):
        """Test get user profile."""
        response = await client.get("/profile", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["username"] == test_user.username
    
    @pytest.mark.asyncio
    async def test_profile_stats(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test get user profile stats."""
        response = await client.get("/profile/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "totalLabResults" in data
        assert "totalActionPlans" in data
        assert "memberSince" in data
    
    # ==================== LABS TESTS ====================
    
    @pytest.mark.asyncio
    async def test_labs_get_all(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test get all lab results."""
        response = await client.get("/labs", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    @pytest.mark.asyncio
    async def test_labs_upload_missing_file(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test lab upload without file (should fail)."""
        response = await client.post("/labs/upload", headers=auth_headers)
        assert response.status_code == 422  # Validation error
    
    # ==================== ACTION PLANS TESTS ====================
    
    @pytest.mark.asyncio
    async def test_action_plans_create(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test create action plan."""
        response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Test Action Plan",
                "description": "Test description"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Action Plan"
        assert data["status"] == "active"
        return data["id"]
    
    @pytest.mark.asyncio
    async def test_action_plans_get_all(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test get all action plans."""
        response = await client.get("/action-plans", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    @pytest.mark.asyncio
    async def test_action_plans_get_by_id(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test get action plan by ID."""
        # First create an action plan
        create_response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Test Action Plan",
                "description": "Test description"
            }
        )
        plan_id = create_response.json()["id"]
        
        # Then get it
        response = await client.get(f"/action-plans/{plan_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == plan_id
        assert data["title"] == "Test Action Plan"
    
    @pytest.mark.asyncio
    async def test_action_plans_update(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test update action plan."""
        # First create an action plan
        create_response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Test Action Plan",
                "description": "Test description"
            }
        )
        plan_id = create_response.json()["id"]
        
        # Then update it
        response = await client.put(
            f"/action-plans/{plan_id}",
            headers=auth_headers,
            json={
                "title": "Updated Action Plan",
                "description": "Updated description",
                "status": "completed"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Action Plan"
        assert data["status"] == "completed"
    
    @pytest.mark.asyncio
    async def test_action_plans_delete(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test delete action plan."""
        # First create an action plan
        create_response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Test Action Plan",
                "description": "Test description"
            }
        )
        plan_id = create_response.json()["id"]
        
        # Then delete it
        response = await client.delete(f"/action-plans/{plan_id}", headers=auth_headers)
        assert response.status_code == 200
        assert "message" in response.json()
    
    # ==================== ACTION ITEMS TESTS ====================
    
    @pytest.mark.asyncio
    async def test_action_items_create(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test create action item."""
        # First create an action plan
        create_response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Test Action Plan",
                "description": "Test description"
            }
        )
        plan_id = create_response.json()["id"]
        
        # Then create an action item
        response = await client.post(
            f"/action-plans/{plan_id}/items",
            headers=auth_headers,
            json={
                "title": "Test Action Item",
                "description": "Test item description",
                "priority": "high"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Action Item"
        assert data["priority"] == "high"
        return plan_id, data["id"]
    
    @pytest.mark.asyncio
    async def test_action_items_get_all(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test get all action items for a plan."""
        # First create an action plan and item
        plan_id, item_id = await self.test_action_items_create(client, auth_headers)
        
        # Then get all items
        response = await client.get(f"/action-plans/{plan_id}/items", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    @pytest.mark.asyncio
    async def test_action_items_complete(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test mark action item as complete."""
        # First create an action plan and item
        plan_id, item_id = await self.test_action_items_create(client, auth_headers)
        
        # Then mark as complete
        response = await client.patch(
            f"/action-plans/{plan_id}/items/{item_id}/complete",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["completed_at"] is not None
    
    # ==================== INSIGHTS TESTS ====================
    
    @pytest.mark.asyncio
    async def test_insights_summary(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test get health insights summary."""
        response = await client.get("/insights/summary", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "totalBiomarkers" in data
        assert "insights" in data
        assert isinstance(data["insights"], list)
    
    # ==================== CONSULTATIONS TESTS ====================
    
    @pytest.mark.asyncio
    async def test_consultations_doctors(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test get available doctors."""
        response = await client.get("/consultations/doctors", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    @pytest.mark.asyncio
    async def test_consultations_book(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test book consultation (should fail without valid doctor)."""
        response = await client.post(
            "/consultations/book",
            headers=auth_headers,
            json={
                "doctorId": "non-existent-id",
                "appointmentDate": "2025-12-31T10:00:00Z",
                "consultationType": "general"
            }
        )
        # Should fail with 404, 400, or 422 since doctor doesn't exist or validation fails
        assert response.status_code in [400, 404, 422]
    
    # ==================== LAB ORDERS TESTS ====================
    
    @pytest.mark.asyncio
    async def test_lab_orders_get_all(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test get all lab orders."""
        response = await client.get("/lab-orders/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert isinstance(data["items"], list)
    
    @pytest.mark.asyncio
    async def test_lab_orders_create(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test create lab order."""
        response = await client.post(
            "/lab-orders/",
            headers=auth_headers,
            json={
                "patientId": "test-patient-id",
                "testName": "Complete Blood Count",
                "description": "Routine CBC test",
                "priority": "routine"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["testName"] == "Complete Blood Count"
        assert data["status"] == "pending"
    
    # ==================== SOAP NOTES TESTS ====================
    
    @pytest.mark.asyncio
    async def test_soap_notes_get_all(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test get all SOAP notes."""
        response = await client.get("/soap-notes/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert isinstance(data["items"], list)
    
    @pytest.mark.asyncio
    async def test_soap_notes_create(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test create SOAP note."""
        response = await client.post(
            "/soap-notes/",
            headers=auth_headers,
            json={
                "patientId": "test-patient-id",
                "subjective": "Patient reports feeling well",
                "objective": "Vital signs normal",
                "assessment": "Patient is healthy",
                "plan": "Continue current treatment"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["subjective"] == "Patient reports feeling well"
        assert data["objective"] == "Vital signs normal"
    
    # ==================== VITALS TESTS ====================
    
    @pytest.mark.asyncio
    async def test_vitals_get_all(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test get all vitals records."""
        response = await client.get("/vitals/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert isinstance(data["items"], list)
    
    @pytest.mark.asyncio
    async def test_vitals_create(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test create vitals record."""
        response = await client.post(
            "/vitals/",
            headers=auth_headers,
            json={
                "patientId": "test-patient-id",
                "bloodPressureSystolic": 120,
                "bloodPressureDiastolic": 80,
                "heartRate": 72,
                "temperature": 98.6,
                "weight": 150.0,
                "height": 68.0
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["bloodPressureSystolic"] == 120
        assert data["heartRate"] == 72
    
    # ==================== NUTRITION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_nutrition_assessments_get_all(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test get all nutrition assessments."""
        response = await client.get("/nutrition/assessments/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert isinstance(data["items"], list)
    
    @pytest.mark.asyncio
    async def test_nutrition_assessments_create(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test create nutrition assessment."""
        response = await client.post(
            "/nutrition/assessments/",
            headers=auth_headers,
            json={
                "patientId": "test-patient-id",
                "assessmentType": "initial",
                "dietaryRestrictions": ["vegetarian"],
                "allergies": ["nuts"],
                "currentDiet": "Balanced diet with vegetables and grains"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["assessmentType"] == "initial"
        assert "vegetarian" in data["dietaryRestrictions"]
    
    # ==================== ADMIN TESTS ====================
    
    @pytest.mark.asyncio
    async def test_admin_consultations_get_all(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test get all consultations (admin view)."""
        response = await client.get("/admin/consultations/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert isinstance(data["items"], list)
    
    @pytest.mark.asyncio
    async def test_admin_stats(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test get admin statistics."""
        response = await client.get("/admin/analytics/comprehensive", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "users" in data or "totalUsers" in data
    
    # ==================== ERROR HANDLING TESTS ====================
    
    @pytest.mark.asyncio
    async def test_unauthorized_access(self, client: AsyncClient):
        """Test accessing protected endpoints without authentication."""
        response = await client.get("/profile")
        assert response.status_code in [401, 403]  # Could be either depending on implementation
    
    @pytest.mark.asyncio
    async def test_invalid_endpoint(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test accessing non-existent endpoint."""
        response = await client.get("/non-existent-endpoint", headers=auth_headers)
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_invalid_json(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test sending invalid JSON."""
        response = await client.post(
            "/action-plans",
            headers=auth_headers,
            data="invalid json"
        )
        assert response.status_code == 422
    
    # ==================== INTEGRATION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_full_workflow(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test a complete workflow: create action plan, add items, complete items."""
        # Create action plan
        plan_response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Workflow Test Plan",
                "description": "Testing complete workflow"
            }
        )
        assert plan_response.status_code == 201
        plan_id = plan_response.json()["id"]
        
        # Add action item
        item_response = await client.post(
            f"/action-plans/{plan_id}/items",
            headers=auth_headers,
            json={
                "title": "Workflow Test Item",
                "description": "Testing workflow item",
                "priority": "high"
            }
        )
        assert item_response.status_code == 201
        item_id = item_response.json()["id"]
        
        # Complete the item
        complete_response = await client.patch(
            f"/action-plans/{plan_id}/items/{item_id}/complete",
            headers=auth_headers
        )
        assert complete_response.status_code == 200
        
        # Verify the item is completed
        get_response = await client.get(f"/action-plans/{plan_id}/items", headers=auth_headers)
        assert get_response.status_code == 200
        items = get_response.json()
        completed_item = next((item for item in items if item["id"] == item_id), None)
        assert completed_item is not None
        assert completed_item["completed_at"] is not None
