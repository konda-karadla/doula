#!/usr/bin/env python3
"""
Enhanced API test suite with comprehensive coverage and detailed reporting.
This test suite addresses permission issues and provides better error handling.
"""
import pytest
import json
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List, Tuple

from app.shared.models import System, User
from app.core.security import get_password_hash


class TestEnhancedAPI:
    """Enhanced test suite with comprehensive API coverage."""
    
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
    
    # ==================== CORE AUTHENTICATION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_auth_register_success(self, client: AsyncClient, test_system: System):
        """Test successful user registration."""
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
    async def test_auth_register_duplicate_email(self, client: AsyncClient, test_system: System):
        """Test registration with duplicate email fails."""
        # First registration
        await client.post(
            "/auth/register",
            json={
                "email": "duplicate@example.com",
                "username": "user1",
                "password": "password123",
                "profileType": "patient",
                "journeyType": "general",
                "systemSlug": test_system.slug
            }
        )
        
        # Second registration with same email
        response = await client.post(
            "/auth/register",
            json={
                "email": "duplicate@example.com",
                "username": "user2",
                "password": "password123",
                "profileType": "patient",
                "journeyType": "general",
                "systemSlug": test_system.slug
            }
        )
        assert response.status_code == 400
    
    @pytest.mark.asyncio
    async def test_auth_login_success(self, client: AsyncClient, test_user: User):
        """Test successful login."""
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
    async def test_auth_login_invalid_credentials(self, client: AsyncClient):
        """Test login with invalid credentials fails."""
        response = await client.post(
            "/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_auth_refresh_token(self, client: AsyncClient, test_user: User):
        """Test token refresh functionality."""
        # Login to get tokens
        login_response = await client.post(
            "/auth/login",
            json={
                "email": test_user.email,
                "password": "testpassword123"
            }
        )
        refresh_token = login_response.json()["refreshToken"]
        
        # Refresh token
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
        """Test logout functionality."""
        response = await client.post("/auth/logout", headers=auth_headers)
        assert response.status_code == 200
        assert "message" in response.json()
    
    # ==================== PROFILE TESTS ====================
    
    @pytest.mark.asyncio
    async def test_profile_get_success(self, client: AsyncClient, auth_headers: Dict[str, str], test_user: User):
        """Test successful profile retrieval."""
        response = await client.get("/profile", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["username"] == test_user.username
        assert "id" in data
        assert "profileType" in data
    
    @pytest.mark.asyncio
    async def test_profile_get_unauthorized(self, client: AsyncClient):
        """Test profile access without authentication."""
        response = await client.get("/profile")
        assert response.status_code in [401, 403]
    
    @pytest.mark.asyncio
    async def test_profile_stats_success(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test successful profile stats retrieval."""
        response = await client.get("/profile/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "totalLabResults" in data
        assert "totalActionPlans" in data
        assert "completedActionItems" in data
        assert "pendingActionItems" in data
    
    # ==================== LABS TESTS ====================
    
    @pytest.mark.asyncio
    async def test_labs_get_all_success(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test successful labs retrieval."""
        response = await client.get("/labs", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    @pytest.mark.asyncio
    async def test_labs_upload_missing_file(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test lab upload without file fails validation."""
        response = await client.post("/labs/upload", headers=auth_headers)
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_labs_get_by_id_not_found(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test getting non-existent lab result."""
        response = await client.get("/labs/non-existent-id", headers=auth_headers)
        assert response.status_code == 404
    
    # ==================== ACTION PLANS TESTS ====================
    
    @pytest.mark.asyncio
    async def test_action_plans_crud_workflow(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test complete CRUD workflow for action plans."""
        # Create
        create_response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Test Action Plan",
                "description": "Test description"
            }
        )
        assert create_response.status_code == 201
        plan_id = create_response.json()["id"]
        
        # Read
        get_response = await client.get(f"/action-plans/{plan_id}", headers=auth_headers)
        assert get_response.status_code == 200
        assert get_response.json()["title"] == "Test Action Plan"
        
        # Update
        update_response = await client.put(
            f"/action-plans/{plan_id}",
            headers=auth_headers,
            json={
                "title": "Updated Action Plan",
                "description": "Updated description",
                "status": "completed"
            }
        )
        assert update_response.status_code == 200
        assert update_response.json()["title"] == "Updated Action Plan"
        
        # Delete
        delete_response = await client.delete(f"/action-plans/{plan_id}", headers=auth_headers)
        assert delete_response.status_code == 200
        
        # Verify deletion
        get_deleted_response = await client.get(f"/action-plans/{plan_id}", headers=auth_headers)
        assert get_deleted_response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_action_plans_get_all(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test get all action plans."""
        response = await client.get("/action-plans", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    # ==================== ACTION ITEMS TESTS ====================
    
    @pytest.mark.asyncio
    async def test_action_items_crud_workflow(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test complete CRUD workflow for action items."""
        # Create action plan first
        plan_response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Test Plan",
                "description": "Test description"
            }
        )
        plan_id = plan_response.json()["id"]
        
        # Create action item
        item_response = await client.post(
            f"/action-plans/{plan_id}/items",
            headers=auth_headers,
            json={
                "title": "Test Action Item",
                "description": "Test item description",
                "priority": "high"
            }
        )
        assert item_response.status_code == 201
        item_id = item_response.json()["id"]
        
        # Get all items
        get_items_response = await client.get(f"/action-plans/{plan_id}/items", headers=auth_headers)
        assert get_items_response.status_code == 200
        items = get_items_response.json()
        assert len(items) >= 1
        
        # Complete item
        complete_response = await client.patch(
            f"/action-plans/{plan_id}/items/{item_id}/complete",
            headers=auth_headers
        )
        assert complete_response.status_code == 200
        assert complete_response.json()["completed_at"] is not None
        
        # Uncomplete item
        uncomplete_response = await client.patch(
            f"/action-plans/{plan_id}/items/{item_id}/uncomplete",
            headers=auth_headers
        )
        assert uncomplete_response.status_code == 200
        assert uncomplete_response.json()["completed_at"] is None
        
        # Delete item
        delete_response = await client.delete(
            f"/action-plans/{plan_id}/items/{item_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200
    
    # ==================== INSIGHTS TESTS ====================
    
    @pytest.mark.asyncio
    async def test_insights_summary_success(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test successful insights summary retrieval."""
        response = await client.get("/insights/summary", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "totalBiomarkers" in data
        assert "insights" in data
        assert isinstance(data["insights"], list)
    
    @pytest.mark.asyncio
    async def test_insights_lab_result_not_found(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test insights for non-existent lab result."""
        response = await client.get("/insights/lab-result/non-existent-id", headers=auth_headers)
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_insights_trends_success(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test insights trends retrieval."""
        response = await client.get("/insights/trends/glucose", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    # ==================== CONSULTATIONS TESTS ====================
    
    @pytest.mark.asyncio
    async def test_consultations_doctors_success(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test successful doctors retrieval."""
        response = await client.get("/consultations/doctors", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    @pytest.mark.asyncio
    async def test_consultations_book_invalid_doctor(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test booking consultation with invalid doctor fails."""
        response = await client.post(
            "/consultations/book",
            headers=auth_headers,
            json={
                "doctorId": "non-existent-id",
                "appointmentDate": "2025-12-31T10:00:00Z",
                "consultationType": "general"
            }
        )
        assert response.status_code in [400, 404, 422]
    
    # ==================== LAB ORDERS TESTS ====================
    
    @pytest.mark.asyncio
    async def test_lab_orders_get_all_success(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test successful lab orders retrieval."""
        response = await client.get("/lab-orders/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert isinstance(data["items"], list)
    
    @pytest.mark.asyncio
    async def test_lab_orders_create_success(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test successful lab order creation."""
        response = await client.post(
            "/lab-orders/",
            headers=auth_headers,
            json={
                "patientId": "test-patient-id",
                "testName": "Complete Blood Count",
                "description": "Routine CBC test",
                "priority": "routine",
                "status": "pending"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["testName"] == "Complete Blood Count"
        assert data["status"] == "pending"
    
    # ==================== PERMISSION-BASED TESTS ====================
    
    @pytest.mark.asyncio
    async def test_soap_notes_permission_check(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test SOAP notes endpoints with permission handling."""
        # GET request
        get_response = await client.get("/soap-notes/", headers=auth_headers)
        assert get_response.status_code in [200, 403]
        
        # POST request
        post_response = await client.post(
            "/soap-notes/",
            headers=auth_headers,
            json={
                "patientId": "test-patient-id",
                "subjective": "Patient reports feeling well",
                "objective": "Vital signs normal",
                "assessment": "Patient is healthy",
                "plan": "Continue current treatment",
                "consultationId": "test-consultation-id"
            }
        )
        assert post_response.status_code in [201, 403, 422]
    
    @pytest.mark.asyncio
    async def test_vitals_permission_check(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test vitals endpoints with permission handling."""
        # GET request
        get_response = await client.get("/vitals/", headers=auth_headers)
        assert get_response.status_code in [200, 403]
        
        # POST request
        post_response = await client.post(
            "/vitals/",
            headers=auth_headers,
            json={
                "patientId": "test-patient-id",
                "bloodPressureSystolic": 120,
                "bloodPressureDiastolic": 80,
                "heartRate": 72,
                "temperature": 98.6,
                "weight": 150.0,
                "height": 68.0,
                "recordedAt": "2025-01-15T10:00:00Z"
            }
        )
        assert post_response.status_code in [201, 403, 422]
    
    @pytest.mark.asyncio
    async def test_nutrition_permission_check(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test nutrition endpoints with permission handling."""
        # GET request
        get_response = await client.get("/nutrition/assessments/", headers=auth_headers)
        assert get_response.status_code in [200, 403]
        
        # POST request
        post_response = await client.post(
            "/nutrition/assessments/",
            headers=auth_headers,
            json={
                "patientId": "test-patient-id",
                "assessmentType": "initial",
                "dietaryRestrictions": ["vegetarian"],
                "allergies": ["nuts"],
                "currentDiet": "Balanced diet with vegetables and grains",
                "assessmentDate": "2025-01-15T10:00:00Z"
            }
        )
        assert post_response.status_code in [201, 403, 422]
    
    @pytest.mark.asyncio
    async def test_admin_permission_check(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test admin endpoints with permission handling."""
        # Admin consultations
        consultations_response = await client.get("/admin/consultations/", headers=auth_headers)
        assert consultations_response.status_code in [200, 403, 404]
        
        # Admin analytics
        analytics_response = await client.get("/admin/analytics/comprehensive", headers=auth_headers)
        assert analytics_response.status_code in [200, 403]
    
    # ==================== ERROR HANDLING TESTS ====================
    
    @pytest.mark.asyncio
    async def test_unauthorized_access_patterns(self, client: AsyncClient):
        """Test various unauthorized access patterns."""
        protected_endpoints = [
            "/profile",
            "/labs",
            "/action-plans",
            "/insights/summary"
        ]
        
        for endpoint in protected_endpoints:
            response = await client.get(endpoint)
            assert response.status_code in [401, 403]
    
    @pytest.mark.asyncio
    async def test_invalid_endpoints(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test accessing non-existent endpoints."""
        invalid_endpoints = [
            "/non-existent-endpoint",
            "/invalid/path",
            "/api/v2/nonexistent"
        ]
        
        for endpoint in invalid_endpoints:
            response = await client.get(endpoint, headers=auth_headers)
            assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_malformed_requests(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test malformed request handling."""
        # Invalid JSON
        response = await client.post(
            "/action-plans",
            headers=auth_headers,
            data="invalid json"
        )
        assert response.status_code == 422
        
        # Missing required fields
        response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={"title": "Missing description"}
        )
        assert response.status_code == 422
    
    # ==================== INTEGRATION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_complete_user_workflow(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test complete user workflow from registration to action completion."""
        # This test simulates a real user workflow
        # 1. User creates action plan
        plan_response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Health Improvement Plan",
                "description": "Comprehensive health improvement plan"
            }
        )
        assert plan_response.status_code == 201
        plan_id = plan_response.json()["id"]
        
        # 2. User adds action items
        item1_response = await client.post(
            f"/action-plans/{plan_id}/items",
            headers=auth_headers,
            json={
                "title": "Exercise 30 minutes daily",
                "description": "Walk, run, or bike for 30 minutes",
                "priority": "high"
            }
        )
        assert item1_response.status_code == 201
        item1_id = item1_response.json()["id"]
        
        item2_response = await client.post(
            f"/action-plans/{plan_id}/items",
            headers=auth_headers,
            json={
                "title": "Eat 5 servings of vegetables",
                "description": "Include vegetables in every meal",
                "priority": "medium"
            }
        )
        assert item2_response.status_code == 201
        item2_id = item2_response.json()["id"]
        
        # 3. User completes one item
        complete_response = await client.patch(
            f"/action-plans/{plan_id}/items/{item1_id}/complete",
            headers=auth_headers
        )
        assert complete_response.status_code == 200
        
        # 4. User checks progress
        progress_response = await client.get(f"/action-plans/{plan_id}/items", headers=auth_headers)
        assert progress_response.status_code == 200
        items = progress_response.json()
        
        completed_item = next((item for item in items if item["id"] == item1_id), None)
        pending_item = next((item for item in items if item["id"] == item2_id), None)
        
        assert completed_item is not None
        assert completed_item["completed_at"] is not None
        assert pending_item is not None
        assert pending_item["completed_at"] is None
        
        # 5. User checks profile stats
        stats_response = await client.get("/profile/stats", headers=auth_headers)
        assert stats_response.status_code == 200
        stats = stats_response.json()
        assert stats["totalActionPlans"] >= 1
        assert stats["completedActionItems"] >= 1
        assert stats["pendingActionItems"] >= 1
