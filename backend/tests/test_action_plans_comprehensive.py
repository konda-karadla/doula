#!/usr/bin/env python3
"""
Comprehensive test suite for Action Plans API endpoints.
Tests all CRUD operations, edge cases, validation, error handling, and permissions.
"""
import pytest
import json
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
from datetime import datetime, timedelta
from uuid import uuid4

from models.system import System
from models.user import User
from models.action_plan import ActionPlan, ActionItem
from core.security import get_password_hash
from schemas.enums import Priority, ActionPlanStatus


class TestActionPlansComprehensive:
    """Comprehensive test suite for Action Plans API endpoints."""
    
    @pytest.fixture
    async def test_system(self, db_session: AsyncSession) -> System:
        """Create a test system."""
        unique_id = str(uuid4())[:8]
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
        unique_id = str(uuid4())[:8]
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
    async def another_user(self, db_session: AsyncSession, test_system: System) -> User:
        """Create another test user for permission testing."""
        unique_id = str(uuid4())[:8]
        user = User(
            email=f"another{unique_id}@example.com",
            username=f"anotheruser{unique_id}",
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
    
    @pytest.fixture
    async def another_auth_headers(self, client: AsyncClient, another_user: User) -> Dict[str, str]:
        """Get authentication headers for another test user."""
        response = await client.post(
            "/auth/login",
            json={
                "email": another_user.email,
                "password": "testpassword123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        return {"Authorization": f"Bearer {data['accessToken']}"}
    
    @pytest.fixture
    async def sample_action_plan(self, client: AsyncClient, auth_headers: Dict[str, str]) -> Dict[str, Any]:
        """Create a sample action plan for testing."""
        response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Sample Action Plan",
                "description": "A sample action plan for testing"
            }
        )
        assert response.status_code == 201
        return response.json()
    
    @pytest.fixture
    async def sample_action_item(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Create a sample action item for testing."""
        response = await client.post(
            f"/action-plans/{sample_action_plan['id']}/items",
            headers=auth_headers,
            json={
                "title": "Sample Action Item",
                "description": "A sample action item for testing",
                "priority": "high"
            }
        )
        assert response.status_code == 201
        return response.json()

    # ==================== ACTION PLAN CREATION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_create_action_plan_success(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test successful action plan creation."""
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
        assert data["description"] == "Test description"
        assert data["status"] == "active"
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
    
    @pytest.mark.asyncio
    async def test_create_action_plan_with_status(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test action plan creation with specific status."""
        response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Test Action Plan",
                "description": "Test description",
                "status": "paused"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "paused"
    
    @pytest.mark.asyncio
    async def test_create_action_plan_minimal_data(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test action plan creation with minimal required data."""
        response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Minimal Plan"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Minimal Plan"
        assert data["description"] is None
        assert data["status"] == "active"
    
    @pytest.mark.asyncio
    async def test_create_action_plan_long_title(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test action plan creation with maximum length title."""
        long_title = "A" * 200  # Maximum allowed length
        response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": long_title,
                "description": "Test description"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == long_title
    
    @pytest.mark.asyncio
    async def test_create_action_plan_long_description(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test action plan creation with maximum length description."""
        long_description = "A" * 1000  # Maximum allowed length
        response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Test Plan",
                "description": long_description
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["description"] == long_description

    # ==================== INPUT VALIDATION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_create_action_plan_missing_title(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test action plan creation without title."""
        response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "description": "Test description"
            }
        )
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_create_action_plan_empty_title(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test action plan creation with empty title."""
        response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "",
                "description": "Test description"
            }
        )
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_create_action_plan_title_too_long(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test action plan creation with title exceeding maximum length."""
        long_title = "A" * 201  # Exceeds maximum length
        response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": long_title,
                "description": "Test description"
            }
        )
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_create_action_plan_description_too_long(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test action plan creation with description exceeding maximum length."""
        long_description = "A" * 1001  # Exceeds maximum length
        response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Test Plan",
                "description": long_description
            }
        )
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_create_action_plan_invalid_status(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test action plan creation with invalid status."""
        response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Test Plan",
                "description": "Test description",
                "status": "invalid_status"
            }
        )
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_create_action_plan_invalid_json(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test action plan creation with invalid JSON."""
        response = await client.post(
            "/action-plans",
            headers=auth_headers,
            data="invalid json"
        )
        assert response.status_code == 422

    # ==================== GET ACTION PLANS TESTS ====================
    
    @pytest.mark.asyncio
    async def test_get_all_action_plans_empty(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test getting all action plans when none exist."""
        response = await client.get("/action-plans", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0
    
    @pytest.mark.asyncio
    async def test_get_all_action_plans_with_data(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test getting all action plans with existing data."""
        # Create multiple action plans
        for i in range(3):
            await client.post(
                "/action-plans",
                headers=auth_headers,
                json={
                    "title": f"Test Plan {i}",
                    "description": f"Description {i}"
                }
            )
        
        response = await client.get("/action-plans", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3
        # Should be ordered by created_at desc
        assert data[0]["title"] == "Test Plan 2"
        assert data[1]["title"] == "Test Plan 1"
        assert data[2]["title"] == "Test Plan 0"

    # ==================== GET ACTION PLAN BY ID TESTS ====================
    
    @pytest.mark.asyncio
    async def test_get_action_plan_by_id_success(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test getting action plan by ID."""
        response = await client.get(f"/action-plans/{sample_action_plan['id']}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_action_plan["id"]
        assert data["title"] == sample_action_plan["title"]
    
    @pytest.mark.asyncio
    async def test_get_action_plan_by_id_not_found(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test getting non-existent action plan by ID."""
        fake_id = str(uuid4())
        response = await client.get(f"/action-plans/{fake_id}", headers=auth_headers)
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_get_action_plan_by_id_invalid_uuid(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test getting action plan with invalid UUID."""
        response = await client.get("/action-plans/invalid-uuid", headers=auth_headers)
        assert response.status_code == 404  # API treats invalid UUID as not found

    # ==================== UPDATE ACTION PLAN TESTS ====================
    
    @pytest.mark.asyncio
    async def test_update_action_plan_success(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test successful action plan update."""
        response = await client.put(
            f"/action-plans/{sample_action_plan['id']}",
            headers=auth_headers,
            json={
                "title": "Updated Title",
                "description": "Updated description",
                "status": "completed"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["description"] == "Updated description"
        assert data["status"] == "completed"
    
    @pytest.mark.asyncio
    async def test_update_action_plan_partial(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test partial action plan update."""
        response = await client.put(
            f"/action-plans/{sample_action_plan['id']}",
            headers=auth_headers,
            json={
                "title": "Updated Title Only"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title Only"
        assert data["description"] == sample_action_plan["description"]  # Should remain unchanged
        assert data["status"] == sample_action_plan["status"]  # Should remain unchanged
    
    @pytest.mark.asyncio
    async def test_update_action_plan_not_found(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test updating non-existent action plan."""
        fake_id = str(uuid4())
        response = await client.put(
            f"/action-plans/{fake_id}",
            headers=auth_headers,
            json={
                "title": "Updated Title"
            }
        )
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_update_action_plan_invalid_data(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test updating action plan with invalid data."""
        response = await client.put(
            f"/action-plans/{sample_action_plan['id']}",
            headers=auth_headers,
            json={
                "title": "",  # Empty title
                "status": "invalid_status"
            }
        )
        assert response.status_code == 422

    # ==================== DELETE ACTION PLAN TESTS ====================
    
    @pytest.mark.asyncio
    async def test_delete_action_plan_success(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test successful action plan deletion."""
        response = await client.delete(f"/action-plans/{sample_action_plan['id']}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        
        # Verify it's deleted
        get_response = await client.get(f"/action-plans/{sample_action_plan['id']}", headers=auth_headers)
        assert get_response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_delete_action_plan_not_found(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test deleting non-existent action plan."""
        fake_id = str(uuid4())
        response = await client.delete(f"/action-plans/{fake_id}", headers=auth_headers)
        assert response.status_code == 404

    # ==================== ACTION ITEM CREATION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_create_action_item_success(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test successful action item creation."""
        response = await client.post(
            f"/action-plans/{sample_action_plan['id']}/items",
            headers=auth_headers,
            json={
                "title": "Test Action Item",
                "description": "Test item description",
                "priority": "high",
                "dueDate": (datetime.now() + timedelta(days=7)).isoformat()
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Action Item"
        assert data["description"] == "Test item description"
        assert data["priority"] == "high"
        assert data["action_plan_id"] == sample_action_plan["id"]
        assert "id" in data
        assert "createdAt" in data
    
    @pytest.mark.asyncio
    async def test_create_action_item_minimal_data(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test action item creation with minimal data."""
        response = await client.post(
            f"/action-plans/{sample_action_plan['id']}/items",
            headers=auth_headers,
            json={
                "title": "Minimal Item"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Minimal Item"
        assert data["description"] is None
        assert data["priority"] == "medium"  # Default priority
        assert data["due_date"] is None
    
    @pytest.mark.asyncio
    async def test_create_action_item_all_priorities(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test action item creation with all priority levels."""
        priorities = ["low", "medium", "high", "urgent"]
        for priority in priorities:
            response = await client.post(
                f"/action-plans/{sample_action_plan['id']}/items",
                headers=auth_headers,
                json={
                    "title": f"Item with {priority} priority",
                    "priority": priority
                }
            )
            assert response.status_code == 201
            data = response.json()
            assert data["priority"] == priority

    # ==================== ACTION ITEM VALIDATION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_create_action_item_missing_title(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test action item creation without title."""
        response = await client.post(
            f"/action-plans/{sample_action_plan['id']}/items",
            headers=auth_headers,
            json={
                "description": "Test description",
                "priority": "high"
            }
        )
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_create_action_item_empty_title(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test action item creation with empty title."""
        response = await client.post(
            f"/action-plans/{sample_action_plan['id']}/items",
            headers=auth_headers,
            json={
                "title": "",
                "description": "Test description"
            }
        )
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_create_action_item_title_too_long(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test action item creation with title exceeding maximum length."""
        long_title = "A" * 201  # Exceeds maximum length
        response = await client.post(
            f"/action-plans/{sample_action_plan['id']}/items",
            headers=auth_headers,
            json={
                "title": long_title,
                "description": "Test description"
            }
        )
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_create_action_item_description_too_long(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test action item creation with description exceeding maximum length."""
        long_description = "A" * 1001  # Exceeds maximum length
        response = await client.post(
            f"/action-plans/{sample_action_plan['id']}/items",
            headers=auth_headers,
            json={
                "title": "Test Item",
                "description": long_description
            }
        )
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_create_action_item_invalid_priority(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test action item creation with invalid priority."""
        response = await client.post(
            f"/action-plans/{sample_action_plan['id']}/items",
            headers=auth_headers,
            json={
                "title": "Test Item",
                "priority": "invalid_priority"
            }
        )
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_create_action_item_past_due_date(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test action item creation with past due date."""
        past_date = (datetime.now() - timedelta(days=1)).isoformat()
        response = await client.post(
            f"/action-plans/{sample_action_plan['id']}/items",
            headers=auth_headers,
            json={
                "title": "Test Item",
                "dueDate": past_date
            }
        )
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_create_action_item_invalid_plan_id(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test action item creation with invalid plan ID."""
        fake_plan_id = str(uuid4())
        response = await client.post(
            f"/action-plans/{fake_plan_id}/items",
            headers=auth_headers,
            json={
                "title": "Test Item"
            }
        )
        assert response.status_code == 404

    # ==================== GET ACTION ITEMS TESTS ====================
    
    @pytest.mark.asyncio
    async def test_get_action_items_empty(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test getting action items when none exist."""
        response = await client.get(f"/action-plans/{sample_action_plan['id']}/items", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0
    
    @pytest.mark.asyncio
    async def test_get_action_items_with_data(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test getting action items with existing data."""
        # Create multiple action items
        for i in range(3):
            await client.post(
                f"/action-plans/{sample_action_plan['id']}/items",
                headers=auth_headers,
                json={
                    "title": f"Test Item {i}",
                    "description": f"Description {i}"
                }
            )
        
        response = await client.get(f"/action-plans/{sample_action_plan['id']}/items", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3
        # Should be ordered by created_at desc
        assert data[0]["title"] == "Test Item 2"
        assert data[1]["title"] == "Test Item 1"
        assert data[2]["title"] == "Test Item 0"

    # ==================== GET ACTION ITEM BY ID TESTS ====================
    
    @pytest.mark.asyncio
    async def test_get_action_item_by_id_success(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_item: Dict[str, Any], sample_action_plan: Dict[str, Any]):
        """Test getting action item by ID."""
        response = await client.get(f"/action-plans/{sample_action_plan['id']}/items/{sample_action_item['id']}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_action_item["id"]
        assert data["title"] == sample_action_item["title"]
    
    @pytest.mark.asyncio
    async def test_get_action_item_by_id_not_found(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test getting non-existent action item by ID."""
        fake_id = str(uuid4())
        response = await client.get(f"/action-plans/{sample_action_plan['id']}/items/{fake_id}", headers=auth_headers)
        assert response.status_code == 404

    # ==================== UPDATE ACTION ITEM TESTS ====================
    
    @pytest.mark.asyncio
    async def test_update_action_item_success(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_item: Dict[str, Any], sample_action_plan: Dict[str, Any]):
        """Test successful action item update."""
        response = await client.put(
            f"/action-plans/{sample_action_plan['id']}/items/{sample_action_item['id']}",
            headers=auth_headers,
            json={
                "title": "Updated Item Title",
                "description": "Updated description",
                "priority": "urgent",
                "dueDate": (datetime.now() + timedelta(days=14)).isoformat()
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Item Title"
        assert data["description"] == "Updated description"
        assert data["priority"] == "urgent"
    
    @pytest.mark.asyncio
    async def test_update_action_item_partial(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_item: Dict[str, Any], sample_action_plan: Dict[str, Any]):
        """Test partial action item update."""
        response = await client.put(
            f"/action-plans/{sample_action_plan['id']}/items/{sample_action_item['id']}",
            headers=auth_headers,
            json={
                "title": "Updated Title Only"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title Only"
        assert data["description"] == sample_action_item["description"]  # Should remain unchanged
        assert data["priority"] == sample_action_item["priority"]  # Should remain unchanged

    # ==================== COMPLETE ACTION ITEM TESTS ====================
    
    @pytest.mark.asyncio
    async def test_complete_action_item_success(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_item: Dict[str, Any], sample_action_plan: Dict[str, Any]):
        """Test successful action item completion."""
        response = await client.patch(
            f"/action-plans/{sample_action_plan['id']}/items/{sample_action_item['id']}/complete",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["completed_at"] is not None
        
        # Verify it's completed
        get_response = await client.get(f"/action-plans/{sample_action_plan['id']}/items/{sample_action_item['id']}", headers=auth_headers)
        assert get_response.status_code == 200
        item_data = get_response.json()
        assert item_data["completed_at"] is not None
    
    @pytest.mark.asyncio
    async def test_complete_action_item_not_found(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test completing non-existent action item."""
        fake_id = str(uuid4())
        response = await client.patch(
            f"/action-plans/{sample_action_plan['id']}/items/{fake_id}/complete",
            headers=auth_headers
        )
        assert response.status_code == 404

    # ==================== UNCOMPLETE ACTION ITEM TESTS ====================
    
    @pytest.mark.asyncio
    async def test_uncomplete_action_item_success(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_item: Dict[str, Any], sample_action_plan: Dict[str, Any]):
        """Test successful action item uncompletion."""
        # First complete the item
        await client.patch(
            f"/action-plans/{sample_action_plan['id']}/items/{sample_action_item['id']}/complete",
            headers=auth_headers
        )
        
        # Then uncomplete it
        response = await client.patch(
            f"/action-plans/{sample_action_plan['id']}/items/{sample_action_item['id']}/uncomplete",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["completed_at"] is None

    # ==================== DELETE ACTION ITEM TESTS ====================
    
    @pytest.mark.asyncio
    async def test_delete_action_item_success(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_item: Dict[str, Any], sample_action_plan: Dict[str, Any]):
        """Test successful action item deletion."""
        response = await client.delete(f"/action-plans/{sample_action_plan['id']}/items/{sample_action_item['id']}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        
        # Verify it's deleted
        get_response = await client.get(f"/action-plans/{sample_action_plan['id']}/items/{sample_action_item['id']}", headers=auth_headers)
        assert get_response.status_code == 404

    # ==================== PERMISSION AND AUTHORIZATION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_unauthorized_access(self, client: AsyncClient):
        """Test accessing action plans without authentication."""
        response = await client.get("/action-plans")
        assert response.status_code in [401, 403]
    
    @pytest.mark.asyncio
    async def test_user_cannot_access_other_user_plans(self, client: AsyncClient, auth_headers: Dict[str, str], another_auth_headers: Dict[str, str]):
        """Test that users cannot access other users' action plans."""
        # Create action plan with first user
        create_response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Private Plan",
                "description": "This should be private"
            }
        )
        assert create_response.status_code == 201
        plan_id = create_response.json()["id"]
        
        # Try to access with second user
        response = await client.get(f"/action-plans/{plan_id}", headers=another_auth_headers)
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_user_cannot_update_other_user_plans(self, client: AsyncClient, auth_headers: Dict[str, str], another_auth_headers: Dict[str, str]):
        """Test that users cannot update other users' action plans."""
        # Create action plan with first user
        create_response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Private Plan",
                "description": "This should be private"
            }
        )
        assert create_response.status_code == 201
        plan_id = create_response.json()["id"]
        
        # Try to update with second user
        response = await client.put(
            f"/action-plans/{plan_id}",
            headers=another_auth_headers,
            json={
                "title": "Hacked Plan"
            }
        )
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_user_cannot_delete_other_user_plans(self, client: AsyncClient, auth_headers: Dict[str, str], another_auth_headers: Dict[str, str]):
        """Test that users cannot delete other users' action plans."""
        # Create action plan with first user
        create_response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Private Plan",
                "description": "This should be private"
            }
        )
        assert create_response.status_code == 201
        plan_id = create_response.json()["id"]
        
        # Try to delete with second user
        response = await client.delete(f"/action-plans/{plan_id}", headers=another_auth_headers)
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_user_cannot_access_other_user_action_items(self, client: AsyncClient, auth_headers: Dict[str, str], another_auth_headers: Dict[str, str]):
        """Test that users cannot access other users' action items."""
        # Create action plan and item with first user
        plan_response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Private Plan",
                "description": "This should be private"
            }
        )
        plan_id = plan_response.json()["id"]
        
        item_response = await client.post(
            f"/action-plans/{plan_id}/items",
            headers=auth_headers,
            json={
                "title": "Private Item"
            }
        )
        item_id = item_response.json()["id"]
        
        # Try to access with second user
        response = await client.get(f"/action-plans/{plan_id}/items/{item_id}", headers=another_auth_headers)
        assert response.status_code == 404

    # ==================== EDGE CASES AND ERROR HANDLING ====================
    
    @pytest.mark.asyncio
    async def test_cascade_delete_action_plan_with_items(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test that deleting action plan also deletes its items."""
        # Create action items
        item_ids = []
        for i in range(3):
            response = await client.post(
                f"/action-plans/{sample_action_plan['id']}/items",
                headers=auth_headers,
                json={
                    "title": f"Item {i}"
                }
            )
            item_ids.append(response.json()["id"])
        
        # Delete the action plan
        delete_response = await client.delete(f"/action-plans/{sample_action_plan['id']}", headers=auth_headers)
        assert delete_response.status_code == 200
        
        # Verify items are also deleted
        for item_id in item_ids:
            get_response = await client.get(f"/action-plans/{sample_action_plan['id']}/items/{item_id}", headers=auth_headers)
            assert get_response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_action_plan_with_special_characters(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test action plan creation with special characters."""
        special_title = "Plan with émojis 🎯 and spëcial chars & symbols!"
        special_description = "Description with unicode: αβγδε, 中文, العربية, русский"
        
        response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": special_title,
                "description": special_description
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == special_title
        assert data["description"] == special_description
    
    @pytest.mark.asyncio
    async def test_action_item_with_special_characters(self, client: AsyncClient, auth_headers: Dict[str, str], sample_action_plan: Dict[str, Any]):
        """Test action item creation with special characters."""
        special_title = "Item with émojis 🎯 and spëcial chars & symbols!"
        special_description = "Description with unicode: αβγδε, 中文, العربية, русский"
        
        response = await client.post(
            f"/action-plans/{sample_action_plan['id']}/items",
            headers=auth_headers,
            json={
                "title": special_title,
                "description": special_description
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == special_title
        assert data["description"] == special_description
    
    @pytest.mark.asyncio
    async def test_multiple_action_plan_creation(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test creating multiple action plans sequentially."""
        # Create multiple plans sequentially to avoid database session conflicts
        for i in range(3):
            response = await client.post(
                "/action-plans",
                headers=auth_headers,
                json={
                    "title": f"Sequential Plan {i}",
                    "description": f"Description {i}"
                }
            )
            assert response.status_code == 201
        
        # Verify all were created
        get_response = await client.get("/action-plans", headers=auth_headers)
        assert get_response.status_code == 200
        data = get_response.json()
        assert len(data) >= 3
    
    @pytest.mark.asyncio
    async def test_action_plan_status_transitions(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test action plan status transitions."""
        # Create plan
        create_response = await client.post(
            "/action-plans",
            headers=auth_headers,
            json={
                "title": "Status Test Plan",
                "status": "active"
            }
        )
        plan_id = create_response.json()["id"]
        
        # Test status transitions
        statuses = ["paused", "active", "completed", "cancelled"]
        for status in statuses:
            response = await client.put(
                f"/action-plans/{plan_id}",
                headers=auth_headers,
                json={"status": status}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == status

    # ==================== INTEGRATION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_complete_workflow(self, client: AsyncClient, auth_headers: Dict[str, str]):
        """Test complete workflow: create plan, add items, complete items, update plan."""
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
        
        # Add multiple action items
        item_ids = []
        for i in range(3):
            item_response = await client.post(
                f"/action-plans/{plan_id}/items",
                headers=auth_headers,
                json={
                    "title": f"Workflow Item {i}",
                    "description": f"Description {i}",
                    "priority": ["low", "medium", "high"][i]
                }
            )
            assert item_response.status_code == 201
            item_ids.append(item_response.json()["id"])
        
        # Complete some items
        for i in range(2):  # Complete first 2 items
            complete_response = await client.patch(
                f"/action-plans/{plan_id}/items/{item_ids[i]}/complete",
                headers=auth_headers
            )
            assert complete_response.status_code == 200
        
        # Update the plan status
        update_response = await client.put(
            f"/action-plans/{plan_id}",
            headers=auth_headers,
            json={
                "status": "completed"
            }
        )
        assert update_response.status_code == 200
        
        # Verify final state
        final_response = await client.get(f"/action-plans/{plan_id}", headers=auth_headers)
        assert final_response.status_code == 200
        plan_data = final_response.json()
        assert plan_data["status"] == "completed"
        
        # Verify items
        items_response = await client.get(f"/action-plans/{plan_id}/items", headers=auth_headers)
        assert items_response.status_code == 200
        items = items_response.json()
        assert len(items) == 3
        assert items[0]["completed_at"] is not None  # First item (highest priority)
        assert items[1]["completed_at"] is not None  # Second item
        assert items[2]["completed_at"] is None      # Third item
