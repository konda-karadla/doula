"""
Service layer for SOAP Notes (Physician clinical documentation)
"""
from typing import Optional, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import joinedload

from models.soap_note import SOAPNote, SOAPNoteAttachment
from models.user import User
from models.staff import Staff
from schemas.soap_note import (
    SOAPNoteCreate,
    SOAPNoteUpdate,
    SOAPNoteSign,
    SOAPNoteResponse,
    SOAPNoteWithAttachments,
    SOAPNoteWithDetails,
    SOAPNoteListFilter,
    SOAPNoteStats,
    SOAPNoteAttachmentCreate
)
from schemas.enums import SOAPNoteStatus
from core.exceptions import NotFoundError, AuthorizationError, ValidationError


class SOAPNotesService:
    """Service for managing SOAP notes"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_soap_note(
        self,
        note_data: SOAPNoteCreate,
        current_user_id: str
    ) -> SOAPNoteResponse:
        """Create a new SOAP note"""
        
        # Verify physician exists
        physician = await self._get_staff_by_user_id(current_user_id)
        if not physician:
            raise ValidationError("Current user is not registered as staff")
        
        # Verify patient exists
        patient = await self._get_user(note_data.patient_id)
        if not patient:
            raise NotFoundError("Patient", note_data.patient_id)
        
        # Create SOAP note
        soap_note = SOAPNote(
            patient_id=note_data.patient_id,
            physician_id=note_data.physician_id or physician.id,
            consultation_id=note_data.consultation_id,
            visit_date=note_data.visit_date,
            chief_complaint=note_data.chief_complaint,
            subjective=note_data.subjective,
            objective=note_data.objective,
            assessment=note_data.assessment,
            plan=note_data.plan,
            follow_up_date=note_data.follow_up_date,
            notes=note_data.notes,
            status=SOAPNoteStatus.DRAFT
        )
        
        self.db.add(soap_note)
        await self.db.commit()
        await self.db.refresh(soap_note)
        
        return SOAPNoteResponse.model_validate(soap_note)
    
    async def get_soap_note(
        self,
        note_id: str,
        include_attachments: bool = False
    ) -> Optional[SOAPNoteWithAttachments]:
        """Get a SOAP note by ID"""
        
        query = select(SOAPNote).where(SOAPNote.id == note_id)
        
        if include_attachments:
            query = query.options(joinedload(SOAPNote.attachments))
        
        result = await self.db.execute(query)
        note = result.scalar_one_or_none()
        
        if not note:
            return None
        
        # Get related data
        patient = await self._get_user(note.patient_id)
        physician = await self._get_staff(note.physician_id)
        
        # Build response
        note_dict = {
            **note.__dict__,
            "patient_name": patient.username if patient else "Unknown",
            "patient_email": patient.email if patient else "Unknown",
            "physician_name": physician.user.username if physician and physician.user else "Unknown",
            "physician_credentials": physician.credentials if physician else None,
            "attachments": note.attachments if include_attachments else []
        }
        
        return SOAPNoteWithDetails(**note_dict)
    
    async def list_soap_notes(
        self,
        filters: SOAPNoteListFilter,
        current_user_id: str,
        is_staff: bool = True
    ) -> tuple[List[SOAPNoteWithDetails], int]:
        """
        List SOAP notes with filters
        
        Returns:
            tuple: (list of notes, total count)
        """
        
        # Build query
        query = select(SOAPNote)
        count_query = select(func.count(SOAPNote.id))
        
        # Apply filters
        conditions = []
        
        if filters.patient_id:
            conditions.append(SOAPNote.patient_id == filters.patient_id)
        
        if filters.physician_id:
            conditions.append(SOAPNote.physician_id == filters.physician_id)
        
        if filters.status:
            conditions.append(SOAPNote.status == filters.status)
        
        if filters.consultation_id:
            conditions.append(SOAPNote.consultation_id == filters.consultation_id)
        
        if filters.start_date:
            conditions.append(SOAPNote.visit_date >= filters.start_date)
        
        if filters.end_date:
            conditions.append(SOAPNote.visit_date <= filters.end_date)
        
        if filters.search:
            search_pattern = f"%{filters.search}%"
            conditions.append(
                or_(
                    SOAPNote.chief_complaint.ilike(search_pattern),
                    SOAPNote.notes.ilike(search_pattern)
                )
            )
        
        # If user is not staff, only show their own notes
        if not is_staff:
            physician = await self._get_staff_by_user_id(current_user_id)
            if physician:
                conditions.append(SOAPNote.physician_id == physician.id)
        
        if conditions:
            query = query.where(and_(*conditions))
            count_query = count_query.where(and_(*conditions))
        
        # Get total count
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        query = query.offset(filters.skip).limit(filters.limit)
        query = query.order_by(SOAPNote.visit_date.desc())
        
        # Execute query
        result = await self.db.execute(query)
        notes = result.scalars().all()
        
        # Enrich with details
        enriched_notes = []
        for note in notes:
            patient = await self._get_user(note.patient_id)
            physician = await self._get_staff(note.physician_id)
            
            note_dict = {
                **note.__dict__,
                "patient_name": patient.username if patient else "Unknown",
                "patient_email": patient.email if patient else "Unknown",
                "physician_name": physician.user.username if physician and physician.user else "Unknown",
                "physician_credentials": physician.credentials if physician else None,
                "attachments": []
            }
            
            enriched_notes.append(SOAPNoteWithDetails(**note_dict))
        
        return enriched_notes, total
    
    async def update_soap_note(
        self,
        note_id: str,
        note_data: SOAPNoteUpdate,
        current_user_id: str
    ) -> SOAPNoteResponse:
        """Update a SOAP note"""
        
        note = await self._get_note(note_id)
        if not note:
            raise NotFoundError("SOAP Note", note_id)
        
        # Only allow updates if not signed
        if note.status == SOAPNoteStatus.SIGNED:
            raise ValidationError("Cannot update a signed SOAP note")
        
        # Verify ownership (only creator can update, unless admin)
        physician = await self._get_staff_by_user_id(current_user_id)
        if physician and note.physician_id != physician.id:
            # Allow if admin - this will be checked by permission middleware
            pass
        
        # Update fields
        update_data = note_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(note, field, value)
        
        note.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(note)
        
        return SOAPNoteResponse.model_validate(note)
    
    async def sign_soap_note(
        self,
        note_id: str,
        sign_data: SOAPNoteSign,
        current_user_id: str
    ) -> SOAPNoteResponse:
        """Sign a SOAP note (marks as completed and signed)"""
        
        note = await self._get_note(note_id)
        if not note:
            raise NotFoundError("SOAP Note", note_id)
        
        # Verify ownership
        physician = await self._get_staff_by_user_id(current_user_id)
        if not physician or note.physician_id != physician.id:
            raise AuthorizationError("Only the creating physician can sign this note")
        
        # Check if already signed
        if note.status == SOAPNoteStatus.SIGNED:
            raise ValidationError("SOAP note is already signed")
        
        # Sign the note
        note.status = SOAPNoteStatus.SIGNED
        note.digital_signature = sign_data.digital_signature
        note.signed_by = sign_data.signed_by
        note.signed_at = datetime.utcnow()
        note.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(note)
        
        return SOAPNoteResponse.model_validate(note)
    
    async def delete_soap_note(
        self,
        note_id: str,
        current_user_id: str
    ) -> bool:
        """Delete a SOAP note (admin only - enforced by permission middleware)"""
        
        note = await self._get_note(note_id)
        if not note:
            raise NotFoundError("SOAP Note", note_id)
        
        await self.db.delete(note)
        await self.db.commit()
        
        return True
    
    async def add_attachment(
        self,
        note_id: str,
        attachment_data: SOAPNoteAttachmentCreate,
        current_user_id: str
    ) -> SOAPNoteWithAttachments:
        """Add an attachment to a SOAP note"""
        
        note = await self._get_note(note_id)
        if not note:
            raise NotFoundError("SOAP Note", note_id)
        
        # Verify ownership
        physician = await self._get_staff_by_user_id(current_user_id)
        if not physician or note.physician_id != physician.id:
            raise AuthorizationError("Only the creating physician can add attachments")
        
        # Create attachment
        attachment = SOAPNoteAttachment(
            soap_note_id=note_id,
            file_type=attachment_data.file_type,
            file_url=attachment_data.file_url,
            file_name=attachment_data.file_name,
            description=attachment_data.description
        )
        
        self.db.add(attachment)
        await self.db.commit()
        await self.db.refresh(attachment)
        
        # Return note with attachments
        return await self.get_soap_note(note_id, include_attachments=True)
    
    async def get_stats(self, physician_id: Optional[str] = None) -> SOAPNoteStats:
        """Get SOAP notes statistics"""
        
        # Build queries
        conditions = []
        if physician_id:
            conditions.append(SOAPNote.physician_id == physician_id)
        
        base_query = select(func.count(SOAPNote.id))
        if conditions:
            base_query = base_query.where(and_(*conditions))
        
        # Total notes
        result = await self.db.execute(base_query)
        total_notes = result.scalar()
        
        # Draft notes
        result = await self.db.execute(
            base_query.where(SOAPNote.status == SOAPNoteStatus.DRAFT)
        )
        draft_notes = result.scalar()
        
        # Completed notes
        result = await self.db.execute(
            base_query.where(SOAPNote.status == SOAPNoteStatus.COMPLETED)
        )
        completed_notes = result.scalar()
        
        # Signed notes
        result = await self.db.execute(
            base_query.where(SOAPNote.status == SOAPNoteStatus.SIGNED)
        )
        signed_notes = result.scalar()
        
        # This month
        from datetime import datetime, timedelta
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)
        result = await self.db.execute(
            base_query.where(SOAPNote.created_at >= month_start)
        )
        notes_this_month = result.scalar()
        
        # This week
        week_start = datetime.utcnow() - timedelta(days=7)
        result = await self.db.execute(
            base_query.where(SOAPNote.created_at >= week_start)
        )
        notes_this_week = result.scalar()
        
        return SOAPNoteStats(
            total_notes=total_notes,
            draft_notes=draft_notes,
            completed_notes=completed_notes,
            signed_notes=signed_notes,
            notes_this_month=notes_this_month,
            notes_this_week=notes_this_week
        )
    
    # Helper methods
    
    async def _get_note(self, note_id: str) -> Optional[SOAPNote]:
        """Get SOAP note by ID"""
        result = await self.db.execute(
            select(SOAPNote).where(SOAPNote.id == note_id)
        )
        return result.scalar_one_or_none()
    
    async def _get_user(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def _get_staff(self, staff_id: str) -> Optional[Staff]:
        """Get staff by ID with user loaded"""
        result = await self.db.execute(
            select(Staff)
            .where(Staff.id == staff_id)
            .options(joinedload(Staff.user))
        )
        return result.scalar_one_or_none()
    
    async def _get_staff_by_user_id(self, user_id: str) -> Optional[Staff]:
        """Get staff by user ID"""
        result = await self.db.execute(
            select(Staff)
            .where(Staff.user_id == user_id)
            .options(joinedload(Staff.user))
        )
        return result.scalar_one_or_none()

