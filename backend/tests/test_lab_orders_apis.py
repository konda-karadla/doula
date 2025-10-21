#!/usr/bin/env python3
"""
Comprehensive test suite for Lab Orders API endpoints.
Tests lab order creation, management, and workflow.
"""
import pytest
import json
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
from datetime import datetime, timedelta

from models.system import System
from models.user import User
from models.staff import Staff, Department
from core.security import get_password_hash


class TestLabOrdersAPIs:
    """Comprehensive test suite for Lab Orders API endpoints."""
    
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
    async def test_patient_user(self, db_session: AsyncSession, test_system: System) -> User:
        """Create a test patient user."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        user = User(
            email=f"patient{unique_id}@example.com",
            username=f"patient{unique_id}",
            password=get_password_hash("patientpassword123"),
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
    async def test_physician_user(self, db_session: AsyncSession, test_system: System) -> User:
        """Create a test physician user."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        user = User(
            email=f"physician{unique_id}@example.com",
            username=f"physician{unique_id}",
            password=get_password_hash("physicianpassword123"),
            profile_type="physician",
            journey_type="general",
            system_id=test_system.id,
            role="physician"
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        return user
    
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
    
    @pytest.fixture
    async def test_physician_staff(self, db_session: AsyncSession, test_system: System, test_physician_user: User, test_department: Department) -> Staff:
        """Create a test physician staff member."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        staff = Staff(
            id=str(uuid.uuid4()),
            user_id=test_physician_user.id,
            system_id=test_system.id,
            staff_type="physician",
            department_id=test_department.id,
            credentials="MD",
            specialization="Internal Medicine",
            license_number=f"MD{unique_id}",
            is_active=True
        )
        db_session.add(staff)
        await db_session.commit()
        await db_session.refresh(staff)
        return staff
    
    @pytest.fixture
    async def patient_auth_headers(self, client: AsyncClient, test_patient_user: User) -> Dict[str, str]:
        """Get authentication headers for patient user."""
        response = await client.post(
            "/auth/login",
            json={
                "email": test_patient_user.email,
                "password": "patientpassword123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        return {"Authorization": f"Bearer {data['accessToken']}"}
    
    @pytest.fixture
    async def physician_auth_headers(self, client: AsyncClient, test_physician_user: User) -> Dict[str, str]:
        """Get authentication headers for physician user."""
        response = await client.post(
            "/auth/login",
            json={
                "email": test_physician_user.email,
                "password": "physicianpassword123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        return {"Authorization": f"Bearer {data['accessToken']}"}
    
    # ==================== LAB ORDER CREATION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_create_lab_order(self, client: AsyncClient, physician_auth_headers: Dict[str, str], test_patient_user: User, test_physician_staff: Staff):
        """Test creating a lab order."""
        response = await client.post(
            "/lab-orders/",
            headers=physician_auth_headers,
            json={
                "patientId": test_patient_user.id,
                "orderingPhysicianId": test_physician_staff.id,
                "testName": "Complete Blood Count",
                "description": "Routine CBC test to check overall health",
                "priority": "routine",
                "instructions": "Fasting not required",
                "clinicalIndication": "Annual checkup"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["testName"] == "Complete Blood Count"
        assert data["patientId"] == test_patient_user.id
        assert data["orderingPhysicianId"] == test_physician_staff.id
        assert data["status"] == "pending"
        return data["id"]
    
    @pytest.mark.asyncio
    async def test_create_lab_order_urgent_priority(self, client: AsyncClient, physician_auth_headers: Dict[str, str], test_patient_user: User, test_physician_staff: Staff):
        """Test creating an urgent lab order."""
        response = await client.post(
            "/lab-orders/",
            headers=physician_auth_headers,
            json={
                "patientId": test_patient_user.id,
                "orderingPhysicianId": test_physician_staff.id,
                "testName": "Cardiac Enzymes",
                "description": "Emergency cardiac enzyme test",
                "priority": "urgent",
                "instructions": "Stat collection required",
                "clinicalIndication": "Chest pain evaluation"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["priority"] == "urgent"
        assert data["status"] == "pending"
    
    @pytest.mark.asyncio
    async def test_create_lab_order_missing_required_fields(self, client: AsyncClient, physician_auth_headers: Dict[str, str]):
        """Test creating lab order with missing required fields."""
        response = await client.post(
            "/lab-orders/",
            headers=physician_auth_headers,
            json={
                "testName": "Complete Blood Count",
                # Missing patientId and orderingPhysicianId
                "description": "Routine CBC test"
            }
        )
        assert response.status_code == 422  # Unprocessable Entity
    
    @pytest.mark.asyncio
    async def test_create_lab_order_invalid_priority(self, client: AsyncClient, physician_auth_headers: Dict[str, str], test_patient_user: User, test_physician_staff: Staff):
        """Test creating lab order with invalid priority."""
        response = await client.post(
            "/lab-orders/",
            headers=physician_auth_headers,
            json={
                "patientId": test_patient_user.id,
                "orderingPhysicianId": test_physician_staff.id,
                "testName": "Complete Blood Count",
                "description": "Routine CBC test",
                "priority": "invalid_priority"  # Invalid priority
            }
        )
        assert response.status_code == 422  # Unprocessable Entity
    
    # ==================== LAB ORDER RETRIEVAL TESTS ====================
    
    @pytest.mark.asyncio
    async def test_get_lab_orders_list(self, client: AsyncClient, physician_auth_headers: Dict[str, str]):
        """Test getting list of lab orders."""
        response = await client.get("/lab-orders/", headers=physician_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert isinstance(data["items"], list)
    
    @pytest.mark.asyncio
    async def test_get_lab_orders_with_filters(self, client: AsyncClient, physician_auth_headers: Dict[str, str], test_patient_user: User):
        """Test getting lab orders with filters."""
        response = await client.get(
            f"/lab-orders/?patient_id={test_patient_user.id}&status=pending&limit=10",
            headers=physician_auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert isinstance(data["items"], list)
    
    @pytest.mark.asyncio
    async def test_get_lab_order_by_id(self, client: AsyncClient, physician_auth_headers: Dict[str, str], test_patient_user: User, test_physician_staff: Staff):
        """Test getting specific lab order by ID."""
        # First create a lab order
        create_response = await client.post(
            "/lab-orders/",
            headers=physician_auth_headers,
            json={
                "patientId": test_patient_user.id,
                "orderingPhysicianId": test_physician_staff.id,
                "testName": "Blood Glucose",
                "description": "Fasting blood glucose test",
                "priority": "routine"
            }
        )
        assert create_response.status_code == 201
        order_id = create_response.json()["id"]
        
        # Then get it
        response = await client.get(f"/lab-orders/{order_id}", headers=physician_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == order_id
        assert data["testName"] == "Blood Glucose"
    
    @pytest.mark.asyncio
    async def test_get_nonexistent_lab_order(self, client: AsyncClient, physician_auth_headers: Dict[str, str]):
        """Test getting non-existent lab order returns 404."""
        response = await client.get("/lab-orders/non-existent-id", headers=physician_auth_headers)
        assert response.status_code == 404
    
    # ==================== LAB ORDER UPDATE TESTS ====================
    
    @pytest.mark.asyncio
    async def test_update_lab_order(self, client: AsyncClient, physician_auth_headers: Dict[str, str], test_patient_user: User, test_physician_staff: Staff):
        """Test updating a lab order."""
        # First create a lab order
        create_response = await client.post(
            "/lab-orders/",
            headers=physician_auth_headers,
            json={
                "patientId": test_patient_user.id,
                "orderingPhysicianId": test_physician_staff.id,
                "testName": "Lipid Panel",
                "description": "Cholesterol and lipid test",
                "priority": "routine"
            }
        )
        assert create_response.status_code == 201
        order_id = create_response.json()["id"]
        
        # Then update it
        response = await client.put(
            f"/lab-orders/{order_id}",
            headers=physician_auth_headers,
            json={
                "description": "Updated cholesterol and lipid test with fasting requirement",
                "instructions": "12-hour fasting required",
                "priority": "routine"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == order_id
        assert "fasting required" in data["instructions"]
    
    @pytest.mark.asyncio
    async def test_update_nonexistent_lab_order(self, client: AsyncClient, physician_auth_headers: Dict[str, str]):
        """Test updating non-existent lab order."""
        response = await client.put(
            "/lab-orders/non-existent-id",
            headers=physician_auth_headers,
            json={
                "description": "Updated description",
                "priority": "urgent"
            }
        )
        assert response.status_code == 404
    
    # ==================== LAB ORDER WORKFLOW TESTS ====================
    
    @pytest.mark.asyncio
    async def test_mark_sample_collected(self, client: AsyncClient, physician_auth_headers: Dict[str, str], test_patient_user: User, test_physician_staff: Staff):
        """Test marking lab sample as collected."""
        # First create a lab order
        create_response = await client.post(
            "/lab-orders/",
            headers=physician_auth_headers,
            json={
                "patientId": test_patient_user.id,
                "orderingPhysicianId": test_physician_staff.id,
                "testName": "Urinalysis",
                "description": "Complete urinalysis",
                "priority": "routine"
            }
        )
        assert create_response.status_code == 201
        order_id = create_response.json()["id"]
        
        # Then mark sample as collected
        response = await client.post(
            f"/lab-orders/{order_id}/collect?collected_by=lab_technician_001",
            headers=physician_auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == order_id
        assert data["status"] == "collected"
    
    @pytest.mark.asyncio
    async def test_mark_nonexistent_sample_collected(self, client: AsyncClient, physician_auth_headers: Dict[str, str]):
        """Test marking non-existent sample as collected."""
        response = await client.post(
            "/lab-orders/non-existent-id/collect?collected_by=lab_technician_001",
            headers=physician_auth_headers
        )
        assert response.status_code == 404
    
    # ==================== LAB ORDER STATISTICS TESTS ====================
    
    @pytest.mark.asyncio
    async def test_get_lab_stats(self, client: AsyncClient, physician_auth_headers: Dict[str, str]):
        """Test getting lab statistics."""
        response = await client.get("/lab-orders/stats/overview", headers=physician_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "totalOrders" in data
        assert "pendingOrders" in data
        assert "completedOrders" in data
    
    @pytest.mark.asyncio
    async def test_get_patient_lab_summary(self, client: AsyncClient, physician_auth_headers: Dict[str, str], test_patient_user: User):
        """Test getting patient lab summary."""
        response = await client.get(f"/lab-orders/patient/{test_patient_user.id}/summary", headers=physician_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "patientId" in data
        assert "totalOrders" in data
        assert "recentOrders" in data
    
    @pytest.mark.asyncio
    async def test_get_physician_workload(self, client: AsyncClient, physician_auth_headers: Dict[str, str], test_physician_staff: Staff):
        """Test getting physician workload."""
        response = await client.get(f"/lab-orders/physician/{test_physician_staff.id}/workload", headers=physician_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "physicianId" in data
        assert "totalOrders" in data
        assert "pendingReviews" in data
    
    # ==================== LAB ORDER DELETION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_delete_lab_order(self, client: AsyncClient, physician_auth_headers: Dict[str, str], test_patient_user: User, test_physician_staff: Staff):
        """Test deleting a lab order."""
        # First create a lab order
        create_response = await client.post(
            "/lab-orders/",
            headers=physician_auth_headers,
            json={
                "patientId": test_patient_user.id,
                "orderingPhysicianId": test_physician_staff.id,
                "testName": "Thyroid Function Test",
                "description": "TSH, T3, T4 levels",
                "priority": "routine"
            }
        )
        assert create_response.status_code == 201
        order_id = create_response.json()["id"]
        
        # Then delete it
        response = await client.delete(f"/lab-orders/{order_id}", headers=physician_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "deleted successfully" in data["message"]
    
    @pytest.mark.asyncio
    async def test_delete_nonexistent_lab_order(self, client: AsyncClient, physician_auth_headers: Dict[str, str]):
        """Test deleting non-existent lab order."""
        response = await client.delete("/lab-orders/non-existent-id", headers=physician_auth_headers)
        assert response.status_code == 404
    
    # ==================== PERMISSION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_unauthorized_access_to_lab_orders(self, client: AsyncClient):
        """Test unauthorized access to lab order endpoints."""
        response = await client.get("/lab-orders/")
        assert response.status_code in [401, 403]  # Unauthorized or Forbidden
    
    @pytest.mark.asyncio
    async def test_patient_cannot_create_lab_orders(self, client: AsyncClient, patient_auth_headers: Dict[str, str], test_patient_user: User):
        """Test patient cannot create lab orders."""
        response = await client.post(
            "/lab-orders/",
            headers=patient_auth_headers,
            json={
                "patientId": test_patient_user.id,
                "testName": "Complete Blood Count",
                "description": "Routine CBC test",
                "priority": "routine"
            }
        )
        assert response.status_code == 403  # Forbidden
    
    # ==================== ERROR HANDLING TESTS ====================
    
    @pytest.mark.asyncio
    async def test_invalid_json_request(self, client: AsyncClient, physician_auth_headers: Dict[str, str]):
        """Test lab order endpoint with invalid JSON."""
        response = await client.post(
            "/lab-orders/",
            headers=physician_auth_headers,
            data="invalid json"
        )
        assert response.status_code == 422  # Unprocessable Entity
    
    @pytest.mark.asyncio
    async def test_invalid_date_filters(self, client: AsyncClient, physician_auth_headers: Dict[str, str]):
        """Test lab orders with invalid date filters."""
        response = await client.get(
            "/lab-orders/?start_date=invalid-date&end_date=also-invalid",
            headers=physician_auth_headers
        )
        assert response.status_code == 400  # Bad Request
    
    # ==================== INTEGRATION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_full_lab_order_workflow(self, client: AsyncClient, physician_auth_headers: Dict[str, str], test_patient_user: User, test_physician_staff: Staff):
        """Test complete lab order workflow: create -> collect -> complete."""
        # 1. Create lab order
        create_response = await client.post(
            "/lab-orders/",
            headers=physician_auth_headers,
            json={
                "patientId": test_patient_user.id,
                "orderingPhysicianId": test_physician_staff.id,
                "testName": "Comprehensive Metabolic Panel",
                "description": "Complete metabolic panel including glucose, electrolytes, kidney function",
                "priority": "routine",
                "instructions": "Fasting required for 12 hours",
                "clinicalIndication": "Annual health checkup"
            }
        )
        assert create_response.status_code == 201
        order_id = create_response.json()["id"]
        
        # 2. Verify order appears in list
        list_response = await client.get("/lab-orders/", headers=physician_auth_headers)
        assert list_response.status_code == 200
        orders = list_response.json()["items"]
        assert any(order["id"] == order_id for order in orders)
        
        # 3. Get order details
        get_response = await client.get(f"/lab-orders/{order_id}", headers=physician_auth_headers)
        assert get_response.status_code == 200
        order_data = get_response.json()
        assert order_data["testName"] == "Comprehensive Metabolic Panel"
        assert order_data["status"] == "pending"
        
        # 4. Mark sample as collected
        collect_response = await client.post(
            f"/lab-orders/{order_id}/collect?collected_by=lab_tech_001",
            headers=physician_auth_headers
        )
        assert collect_response.status_code == 200
        collected_data = collect_response.json()
        assert collected_data["status"] == "collected"
        
        # 5. Update order with results (if supported)
        update_response = await client.put(
            f"/lab-orders/{order_id}",
            headers=physician_auth_headers,
            json={
                "status": "completed",
                "results": "All values within normal range",
                "notes": "Patient should continue current diet and exercise routine"
            }
        )
        if update_response.status_code == 200:
            updated_data = update_response.json()
            assert updated_data["status"] == "completed"
        
        # 6. Verify patient summary includes this order
        summary_response = await client.get(f"/lab-orders/patient/{test_patient_user.id}/summary", headers=physician_auth_headers)
        assert summary_response.status_code == 200
        summary_data = summary_response.json()
        assert summary_data["totalOrders"] >= 1
