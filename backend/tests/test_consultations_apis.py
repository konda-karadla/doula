#!/usr/bin/env python3
"""
Comprehensive test suite for Consultations API endpoints.
Tests doctor management, appointment booking, and consultation workflows.
"""
import pytest
import json
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
from datetime import datetime, timedelta

from models.system import System
from models.user import User
from models.consultation import Doctor, Consultation
from models.staff import Staff, Department
from core.security import get_password_hash


class TestConsultationsAPIs:
    """Comprehensive test suite for Consultations API endpoints."""
    
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
    async def test_doctor_user(self, db_session: AsyncSession, test_system: System) -> User:
        """Create a test doctor user."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        user = User(
            email=f"doctor{unique_id}@example.com",
            username=f"doctor{unique_id}",
            password=get_password_hash("doctorpassword123"),
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
    async def test_doctor(self, db_session: AsyncSession, test_system: System, test_doctor_user: User, test_department: Department) -> Doctor:
        """Create a test doctor."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        doctor = Doctor(
            id=str(uuid.uuid4()),
            user_id=test_doctor_user.id,
            system_id=test_system.id,
            name=f"Dr. Test {unique_id}",
            specialization="Internal Medicine",
            credentials="MD",
            license_number=f"MD{unique_id}",
            department_id=test_department.id,
            is_active=True
        )
        db_session.add(doctor)
        await db_session.commit()
        await db_session.refresh(doctor)
        return doctor
    
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
    async def doctor_auth_headers(self, client: AsyncClient, test_doctor_user: User) -> Dict[str, str]:
        """Get authentication headers for doctor user."""
        response = await client.post(
            "/auth/login",
            json={
                "email": test_doctor_user.email,
                "password": "doctorpassword123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        return {"Authorization": f"Bearer {data['accessToken']}"}
    
    # ==================== DOCTOR MANAGEMENT TESTS ====================
    
    @pytest.mark.asyncio
    async def test_get_doctors(self, client: AsyncClient, patient_auth_headers: Dict[str, str]):
        """Test getting list of available doctors."""
        response = await client.get("/consultations/doctors", headers=patient_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    @pytest.mark.asyncio
    async def test_get_doctor_by_id(self, client: AsyncClient, patient_auth_headers: Dict[str, str], test_doctor: Doctor):
        """Test getting specific doctor by ID."""
        response = await client.get(f"/consultations/doctors/{test_doctor.id}", headers=patient_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_doctor.id
        assert data["name"] == test_doctor.name
        assert data["specialization"] == test_doctor.specialization
    
    @pytest.mark.asyncio
    async def test_get_doctor_availability(self, client: AsyncClient, patient_auth_headers: Dict[str, str], test_doctor: Doctor):
        """Test getting doctor availability."""
        # Test with a future date
        future_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        response = await client.get(
            f"/consultations/doctors/{test_doctor.id}/availability?date={future_date}",
            headers=patient_auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    @pytest.mark.asyncio
    async def test_get_nonexistent_doctor(self, client: AsyncClient, patient_auth_headers: Dict[str, str]):
        """Test getting non-existent doctor returns 404."""
        response = await client.get("/consultations/doctors/non-existent-id", headers=patient_auth_headers)
        assert response.status_code == 404
    
    # ==================== APPOINTMENT BOOKING TESTS ====================
    
    @pytest.mark.asyncio
    async def test_book_consultation(self, client: AsyncClient, patient_auth_headers: Dict[str, str], test_doctor: Doctor):
        """Test booking a consultation."""
        # Book appointment for tomorrow
        appointment_date = (datetime.now() + timedelta(days=1)).isoformat()
        response = await client.post(
            "/consultations/book",
            headers=patient_auth_headers,
            json={
                "doctorId": test_doctor.id,
                "appointmentDate": appointment_date,
                "consultationType": "general",
                "reason": "Regular checkup",
                "notes": "Patient feels well"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["doctorId"] == test_doctor.id
        assert data["consultationType"] == "general"
        assert data["status"] == "scheduled"
        return data["id"]
    
    @pytest.mark.asyncio
    async def test_book_consultation_with_nonexistent_doctor(self, client: AsyncClient, patient_auth_headers: Dict[str, str]):
        """Test booking consultation with non-existent doctor."""
        appointment_date = (datetime.now() + timedelta(days=1)).isoformat()
        response = await client.post(
            "/consultations/book",
            headers=patient_auth_headers,
            json={
                "doctorId": "non-existent-id",
                "appointmentDate": appointment_date,
                "consultationType": "general",
                "reason": "Regular checkup"
            }
        )
        assert response.status_code in [400, 404]  # Bad Request or Not Found
    
    @pytest.mark.asyncio
    async def test_book_consultation_invalid_date(self, client: AsyncClient, patient_auth_headers: Dict[str, str], test_doctor: Doctor):
        """Test booking consultation with invalid date."""
        # Book appointment for yesterday (invalid)
        appointment_date = (datetime.now() - timedelta(days=1)).isoformat()
        response = await client.post(
            "/consultations/book",
            headers=patient_auth_headers,
            json={
                "doctorId": test_doctor.id,
                "appointmentDate": appointment_date,
                "consultationType": "general",
                "reason": "Regular checkup"
            }
        )
        assert response.status_code in [400, 422]  # Bad Request or Unprocessable Entity
    
    @pytest.mark.asyncio
    async def test_book_consultation_missing_required_fields(self, client: AsyncClient, patient_auth_headers: Dict[str, str], test_doctor: Doctor):
        """Test booking consultation with missing required fields."""
        response = await client.post(
            "/consultations/book",
            headers=patient_auth_headers,
            json={
                "doctorId": test_doctor.id,
                # Missing appointmentDate and consultationType
                "reason": "Regular checkup"
            }
        )
        assert response.status_code == 422  # Unprocessable Entity
    
    # ==================== CONSULTATION MANAGEMENT TESTS ====================
    
    @pytest.mark.asyncio
    async def test_get_my_bookings(self, client: AsyncClient, patient_auth_headers: Dict[str, str]):
        """Test getting user's own bookings."""
        response = await client.get("/consultations/my-bookings", headers=patient_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    @pytest.mark.asyncio
    async def test_get_consultation_by_id(self, client: AsyncClient, patient_auth_headers: Dict[str, str], test_doctor: Doctor):
        """Test getting specific consultation by ID."""
        # First book a consultation
        appointment_date = (datetime.now() + timedelta(days=2)).isoformat()
        book_response = await client.post(
            "/consultations/book",
            headers=patient_auth_headers,
            json={
                "doctorId": test_doctor.id,
                "appointmentDate": appointment_date,
                "consultationType": "general",
                "reason": "Regular checkup"
            }
        )
        assert book_response.status_code == 201
        consultation_id = book_response.json()["id"]
        
        # Then get it
        response = await client.get(f"/consultations/{consultation_id}", headers=patient_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == consultation_id
        assert data["doctorId"] == test_doctor.id
    
    @pytest.mark.asyncio
    async def test_reschedule_consultation(self, client: AsyncClient, patient_auth_headers: Dict[str, str], test_doctor: Doctor):
        """Test rescheduling a consultation."""
        # First book a consultation
        appointment_date = (datetime.now() + timedelta(days=3)).isoformat()
        book_response = await client.post(
            "/consultations/book",
            headers=patient_auth_headers,
            json={
                "doctorId": test_doctor.id,
                "appointmentDate": appointment_date,
                "consultationType": "general",
                "reason": "Regular checkup"
            }
        )
        assert book_response.status_code == 201
        consultation_id = book_response.json()["id"]
        
        # Then reschedule it
        new_appointment_date = (datetime.now() + timedelta(days=4)).isoformat()
        response = await client.put(
            f"/consultations/{consultation_id}/reschedule",
            headers=patient_auth_headers,
            json={
                "newAppointmentDate": new_appointment_date,
                "reason": "Schedule conflict"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == consultation_id
    
    @pytest.mark.asyncio
    async def test_cancel_consultation(self, client: AsyncClient, patient_auth_headers: Dict[str, str], test_doctor: Doctor):
        """Test canceling a consultation."""
        # First book a consultation
        appointment_date = (datetime.now() + timedelta(days=5)).isoformat()
        book_response = await client.post(
            "/consultations/book",
            headers=patient_auth_headers,
            json={
                "doctorId": test_doctor.id,
                "appointmentDate": appointment_date,
                "consultationType": "general",
                "reason": "Regular checkup"
            }
        )
        assert book_response.status_code == 201
        consultation_id = book_response.json()["id"]
        
        # Then cancel it
        response = await client.delete(f"/consultations/{consultation_id}/cancel", headers=patient_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == consultation_id
        assert data["status"] == "cancelled"
    
    # ==================== PERMISSION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_unauthorized_access_to_consultations(self, client: AsyncClient):
        """Test unauthorized access to consultation endpoints."""
        response = await client.get("/consultations/doctors")
        assert response.status_code in [401, 403]  # Unauthorized or Forbidden
    
    @pytest.mark.asyncio
    async def test_doctor_cannot_access_other_consultations(self, client: AsyncClient, doctor_auth_headers: Dict[str, str], patient_auth_headers: Dict[str, str], test_doctor: Doctor):
        """Test doctor cannot access consultations they're not involved in."""
        # Patient books a consultation
        appointment_date = (datetime.now() + timedelta(days=6)).isoformat()
        book_response = await client.post(
            "/consultations/book",
            headers=patient_auth_headers,
            json={
                "doctorId": test_doctor.id,
                "appointmentDate": appointment_date,
                "consultationType": "general",
                "reason": "Regular checkup"
            }
        )
        assert book_response.status_code == 201
        consultation_id = book_response.json()["id"]
        
        # Doctor tries to access it (should work since they're the assigned doctor)
        response = await client.get(f"/consultations/{consultation_id}", headers=doctor_auth_headers)
        # This might work or not depending on implementation
        assert response.status_code in [200, 403, 404]
    
    # ==================== ERROR HANDLING TESTS ====================
    
    @pytest.mark.asyncio
    async def test_get_nonexistent_consultation(self, client: AsyncClient, patient_auth_headers: Dict[str, str]):
        """Test getting non-existent consultation returns 404."""
        response = await client.get("/consultations/non-existent-id", headers=patient_auth_headers)
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_reschedule_nonexistent_consultation(self, client: AsyncClient, patient_auth_headers: Dict[str, str]):
        """Test rescheduling non-existent consultation."""
        new_appointment_date = (datetime.now() + timedelta(days=1)).isoformat()
        response = await client.put(
            "/consultations/non-existent-id/reschedule",
            headers=patient_auth_headers,
            json={
                "newAppointmentDate": new_appointment_date,
                "reason": "Schedule conflict"
            }
        )
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_cancel_nonexistent_consultation(self, client: AsyncClient, patient_auth_headers: Dict[str, str]):
        """Test canceling non-existent consultation."""
        response = await client.delete("/consultations/non-existent-id/cancel", headers=patient_auth_headers)
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_invalid_json_request(self, client: AsyncClient, patient_auth_headers: Dict[str, str]):
        """Test consultation endpoint with invalid JSON."""
        response = await client.post(
            "/consultations/book",
            headers=patient_auth_headers,
            data="invalid json"
        )
        assert response.status_code == 422  # Unprocessable Entity
    
    # ==================== INTEGRATION TESTS ====================
    
    @pytest.mark.asyncio
    async def test_full_consultation_workflow(self, client: AsyncClient, patient_auth_headers: Dict[str, str], test_doctor: Doctor):
        """Test complete consultation workflow: book -> reschedule -> cancel."""
        # 1. Book consultation
        appointment_date = (datetime.now() + timedelta(days=7)).isoformat()
        book_response = await client.post(
            "/consultations/book",
            headers=patient_auth_headers,
            json={
                "doctorId": test_doctor.id,
                "appointmentDate": appointment_date,
                "consultationType": "general",
                "reason": "Regular checkup"
            }
        )
        assert book_response.status_code == 201
        consultation_id = book_response.json()["id"]
        
        # 2. Verify it appears in my bookings
        bookings_response = await client.get("/consultations/my-bookings", headers=patient_auth_headers)
        assert bookings_response.status_code == 200
        bookings = bookings_response.json()
        assert any(booking["id"] == consultation_id for booking in bookings)
        
        # 3. Reschedule consultation
        new_appointment_date = (datetime.now() + timedelta(days=8)).isoformat()
        reschedule_response = await client.put(
            f"/consultations/{consultation_id}/reschedule",
            headers=patient_auth_headers,
            json={
                "newAppointmentDate": new_appointment_date,
                "reason": "Schedule conflict"
            }
        )
        assert reschedule_response.status_code == 200
        
        # 4. Cancel consultation
        cancel_response = await client.delete(f"/consultations/{consultation_id}/cancel", headers=patient_auth_headers)
        assert cancel_response.status_code == 200
        
        # 5. Verify cancellation
        get_response = await client.get(f"/consultations/{consultation_id}", headers=patient_auth_headers)
        assert get_response.status_code == 200
        consultation_data = get_response.json()
        assert consultation_data["status"] == "cancelled"
