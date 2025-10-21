"""
API endpoints for SOAP Notes (Physician clinical documentation)
"""
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user, CurrentUser
from app.core.permissions import require_permission, require_resource_ownership
from app.domains.soap_notes.services.soap_notes_service import SOAPNotesService
from app.domains.soap_notes.schemas.soap_note import (
    SOAPNoteCreate,
    SOAPNoteUpdate,
    SOAPNoteSign,
    SOAPNoteResponse,
    SOAPNoteWithAttachments,
    SOAPNoteWithDetails,
    SOAPNoteListFilter,
    SOAPNoteListResponse,
    SOAPNoteStats,
    SOAPNoteAttachmentCreate,
    SOAPNoteAttachmentResponse
)
from app.shared.schemas.enums import ModuleCategory
from app.core.exceptions import NotFoundError, AuthorizationError, ValidationError

router = APIRouter()


@router.get("/", response_model=SOAPNoteListResponse)
@require_permission(ModuleCategory.PHYSICIAN, "view")
async def list_soap_notes(
    filters: SOAPNoteListFilter = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    List SOAP notes with filters and pagination
    
    **Permissions:** Physicians and Admins can view all notes. Others see only their own.
    """
    service = SOAPNotesService(db)
    
    # Check if user is staff
    is_staff = current_user.role in ["admin", "physician", "nutritionist", "nurse"]
    
    try:
        notes, total = await service.list_soap_notes(filters, current_user.userId, is_staff)
        
        return SOAPNoteListResponse(
            items=notes,
            total=total,
            skip=filters.skip,
            limit=filters.limit,
            has_more=(filters.skip + filters.limit) < total
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats", response_model=SOAPNoteStats)
@require_permission(ModuleCategory.PHYSICIAN, "view")
async def get_soap_notes_stats(
    physician_id: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get SOAP notes statistics
    
    **Permissions:** Physicians can view their own stats, Admins can view any.
    """
    service = SOAPNotesService(db)
    
    # If physician_id not provided, use current user's physician profile
    if not physician_id:
        from app.domains.staff.models.staff import Staff
        from sqlalchemy import select
        result = await db.execute(
            select(Staff).where(Staff.user_id == current_user.userId)
        )
        staff = result.scalar_one_or_none()
        if staff:
            physician_id = staff.id
    
    try:
        stats = await service.get_stats(physician_id)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{note_id}", response_model=SOAPNoteWithDetails)
@require_permission(ModuleCategory.PHYSICIAN, "view")
async def get_soap_note(
    note_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get a specific SOAP note by ID
    
    **Permissions:** Physicians and Admins can view any note. Patients can view their own notes.
    """
    service = SOAPNotesService(db)
    
    try:
        note = await service.get_soap_note(note_id, include_attachments=True)
        
        if not note:
            raise NotFoundError("SOAP Note", note_id)
        
        # Check resource ownership if not staff
        is_staff = current_user.role in ["admin", "physician", "nutritionist", "nurse"]
        if not is_staff:
            # Patient can only view their own notes
            if note.patient_id != current_user.userId:
                raise AuthorizationError("You don't have permission to view this note")
        
        return note
    
    except (NotFoundError, AuthorizationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=SOAPNoteResponse, status_code=status.HTTP_201_CREATED)
@require_permission(ModuleCategory.PHYSICIAN, "create")
async def create_soap_note(
    note_data: SOAPNoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Create a new SOAP note
    
    **Permissions:** Only Physicians and Admins can create SOAP notes.
    """
    service = SOAPNotesService(db)
    
    try:
        note = await service.create_soap_note(note_data, current_user.userId)
        return note
    
    except (NotFoundError, ValidationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{note_id}", response_model=SOAPNoteResponse)
@require_permission(ModuleCategory.PHYSICIAN, "update")
async def update_soap_note(
    note_id: str,
    note_data: SOAPNoteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Update a SOAP note
    
    **Permissions:** Only the creating Physician or Admin can update a note.
    **Note:** Cannot update signed notes.
    """
    service = SOAPNotesService(db)
    
    try:
        note = await service.update_soap_note(note_id, note_data, current_user.userId)
        return note
    
    except (NotFoundError, ValidationError, AuthorizationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{note_id}/sign", response_model=SOAPNoteResponse)
@require_permission(ModuleCategory.PHYSICIAN, "update")
async def sign_soap_note(
    note_id: str,
    sign_data: SOAPNoteSign,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Sign a SOAP note (marks as completed and signed)
    
    **Permissions:** Only the creating Physician can sign their own notes.
    **Note:** Once signed, the note cannot be modified.
    """
    service = SOAPNotesService(db)
    
    try:
        note = await service.sign_soap_note(note_id, sign_data, current_user.userId)
        return note
    
    except (NotFoundError, ValidationError, AuthorizationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{note_id}/attachments", response_model=SOAPNoteWithAttachments, status_code=status.HTTP_201_CREATED)
@require_permission(ModuleCategory.PHYSICIAN, "create")
async def add_attachment(
    note_id: str,
    attachment_data: SOAPNoteAttachmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Add an attachment to a SOAP note
    
    **Permissions:** Only the creating Physician can add attachments.
    """
    service = SOAPNotesService(db)
    
    # Set the soap_note_id from path parameter
    attachment_data.soap_note_id = note_id
    
    try:
        note = await service.add_attachment(note_id, attachment_data, current_user.userId)
        return note
    
    except (NotFoundError, AuthorizationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
@require_permission(ModuleCategory.PHYSICIAN, "delete")
async def delete_soap_note(
    note_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Delete a SOAP note
    
    **Permissions:** Only Admins can delete SOAP notes.
    **Note:** This is for audit trail compliance. Physicians cannot delete their own notes.
    """
    service = SOAPNotesService(db)
    
    try:
        await service.delete_soap_note(note_id, current_user.userId)
        return None
    
    except NotFoundError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
