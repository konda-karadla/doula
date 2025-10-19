# Consultation/Booking System - Implementation Plan

**Feature:** Complete consultation booking and management system  
**Priority:** 🔴 P0 - Revenue Critical  
**Estimated Time:** 2-3 weeks  
**Status:** 🔄 In Progress  
**Started:** October 11, 2025

---

## 📋 Overview

Build a complete consultation booking system that allows users to:
- Browse available doctors/consultants
- View available time slots
- Book consultations
- Manage appointments (reschedule, cancel)
- Receive reminders
- Conduct video consultations
- View consultation history and notes

---

## 🏗️ Architecture Overview

### Components to Build:
1. **Backend API** - Database schema + REST endpoints
2. **Admin Portal** - Doctor management, availability, consultation oversight
3. **Web Portal** - User booking interface
4. **Mobile App** - Mobile booking interface
5. **Notifications** - Email/push notifications for reminders

---

## 📊 Phase Breakdown

### Phase 1: Database Schema (2-3 hours) ✅ COMPLETE
- ✅ Created Prisma models (Doctor, AvailabilitySlot, Consultation)
- ✅ Added enums (ConsultationType, ConsultationStatus)
- ✅ Database synced successfully (3 new tables)
- ✅ Seed test data created:
  - 4 sample doctors with different specializations
  - 17 availability slots across weekdays
  - 1 sample consultation scheduled

### Phase 2: Backend API (6-8 hours) ✅ COMPLETE
- ✅ Created 6 DTOs with validation (create-doctor, update-doctor, create-availability, book-consultation, update-consultation, reschedule)
- ✅ Implemented DoctorsService (CRUD, availability management)
- ✅ Implemented ConsultationsService (booking logic, conflict prevention, availability checking)
- ✅ Created ConsultationsController (user endpoints - 8 routes)
- ✅ Created AdminConsultationsController (admin endpoints - 10 routes)
- ✅ Created ConsultationsModule
- ✅ Registered in AppModule
- ✅ Swagger documentation added to all endpoints
- ✅ Build successful - no TypeScript errors
- ⏸️ Tests (will write after frontend integration)

### Phase 3: Admin Portal (8-10 hours) ✅ COMPLETE
**Step 2A:** ✅ Types & API Client (15 min)
- ✅ Added 8 consultation types to @health-platform/types
- ✅ Added 18 API endpoints to @health-platform/config
- ✅ Added consultation services to @health-platform/api-client

**Step 2B:** ✅ Doctor List Page (30 min)
- ✅ Created React Query hooks (use-admin-doctors.ts)
- ✅ Created doctor list page with table
- ✅ Added search functionality
- ✅ Added CRUD actions (Edit, Delete, Toggle, Set Availability)
- ✅ Added delete confirmation dialog
- ✅ Updated admin navigation with Doctors link
- ✅ Added UI components (Table, Badge, AlertDialog, DropdownMenu)

**Step 2C:** ✅ Add/Edit Doctor Form (45 min)
- ✅ Created Add New Doctor page (/doctors/new)
- ✅ Created Edit Doctor page (/doctors/[id])
- ✅ Form validation (name, specialization, qualifications, experience, fee)
- ✅ Multi-field qualifications with add/remove
- ✅ Image URL with preview
- ✅ Active status toggle
- ✅ Success/error handling

**Step 2D:** ✅ Availability Editor (45 min)
- ✅ Created Set Availability page (/doctors/[id]/availability)
- ✅ Weekly schedule editor with day selection
- ✅ Time pickers for start/end times
- ✅ Add/remove time slots
- ✅ Overlap detection and validation
- ✅ Visual weekly preview
- ✅ Bulk update availability

**Step 2E:** ✅ Consultation Management (45 min)
- ✅ Created React Query hooks (use-admin-consultations.ts)
- ✅ Created consultation list page (/consultations)
- ✅ Search and filter by status
- ✅ Created consultation detail page (/consultations/[id])
- ✅ Update status, notes, prescription, meeting link
- ✅ Patient and doctor information display
- ✅ Payment status indicator
- ✅ Updated admin navigation with Consultations link

### Phase 4: Web Portal (6-8 hours) ✅ COMPLETE
- ✅ Created React Query hooks (use-consultations.ts) - 8 hooks
- ✅ Browse Doctors page (/book-consultation)
  - Doctor cards with photos, bios, qualifications
  - Search and filter by specialization
  - Consultation fee display
- ✅ Doctor Detail & Booking page (/book-consultation/[doctorId])
  - Doctor profile with full details
  - Consultation type selector (VIDEO, PHONE, IN_PERSON)
  - Date picker (calendar input)
  - Real-time availability slots (grouped by morning/afternoon/evening)
  - Booking summary with confirmation
  - Success screen with redirect
- ✅ My Consultations page (/my-consultations)
  - Upcoming vs past consultations
  - Consultation cards with doctor info
  - View details and cancel options
  - Empty state with call-to-action
- ✅ Consultation Detail page (/consultation/[id])
  - Full consultation information
  - Doctor profile
  - Meeting link (for video calls)
  - Notes and prescription (after completion)
  - Payment status
  - Metadata display

### Phase 5: Mobile App (6-8 hours) ✅ COMPLETE
- ✅ Created React Query hooks (use-consultations.ts) - 8 hooks
- ✅ Consultations Hub screen (/consultations/index)
  - Stats display (total, upcoming, completed)
  - Two action cards (Book + My Consultations)
  - Next consultation preview
  - How it Works guide
- ✅ Browse Doctors screen (/consultations/browse)
  - Doctor cards with photos and info
  - Search functionality
  - Beautiful mobile-optimized layout
- ✅ Doctor Detail & Booking screen (/consultations/[doctorId])
  - Doctor profile display
  - Consultation type selector (VIDEO/PHONE/IN_PERSON)
  - Native date picker
  - Real-time availability slots
  - Booking summary
  - Success screen with auto-redirect
- ✅ My Consultations screen (/consultations/my-bookings)
  - Upcoming and past consultations separated
  - Consultation cards with doctor info
  - View and cancel actions
  - Empty state with CTA
- ✅ Consultation Detail screen (/consultation-detail/[id])
  - Full consultation information
  - Doctor profile and qualifications
  - Meeting link button (opens in browser)
  - Notes and prescription display (after completion)
  - Payment status
  - Metadata
- ✅ Updated dashboard with consultations quick action
- ✅ Installed @react-native-community/datetimepicker
- ✅ Mobile-optimized UI with touch-friendly components

### Phase 6: Integration & Testing (4-6 hours) ⏳
- Integration testing
- Email notifications
- Bug fixes

---

## 🗄️ Database Schema

### New Tables to Create:

#### 1. **doctors**
```prisma
model Doctor {
  id              String   @id @default(cuid())
  systemId        String   @map("system_id")
  name            String
  specialization  String
  bio             String?  @db.Text
  qualifications  String[] // Array of degrees/certifications
  experience      Int      // Years of experience
  consultationFee Decimal  @map("consultation_fee") @db.Decimal(10, 2)
  imageUrl        String?  @map("image_url")
  isActive        Boolean  @default(true) @map("is_active")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  system              System               @relation(fields: [systemId], references: [id])
  availabilitySlots   AvailabilitySlot[]
  consultations       Consultation[]

  @@map("doctors")
  @@index([systemId])
  @@index([specialization])
}
```

#### 2. **availability_slots**
```prisma
model AvailabilitySlot {
  id        String   @id @default(cuid())
  doctorId  String   @map("doctor_id")
  dayOfWeek Int      @map("day_of_week") // 0 = Sunday, 6 = Saturday
  startTime String   @map("start_time") // "09:00"
  endTime   String   @map("end_time")   // "17:00"
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")

  doctor Doctor @relation(fields: [doctorId], references: [id], onDelete: Cascade)

  @@map("availability_slots")
  @@index([doctorId])
}
```

#### 3. **consultations**
```prisma
enum ConsultationType {
  VIDEO
  PHONE
  IN_PERSON
}

enum ConsultationStatus {
  SCHEDULED
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

model Consultation {
  id           String             @id @default(cuid())
  userId       String             @map("user_id")
  doctorId     String             @map("doctor_id")
  scheduledAt  DateTime           @map("scheduled_at")
  duration     Int                @default(30) // Minutes
  type         ConsultationType   @default(VIDEO)
  status       ConsultationStatus @default(SCHEDULED)
  meetingLink  String?            @map("meeting_link")
  notes        String?            @db.Text
  prescription String?            @db.Text
  fee          Decimal            @db.Decimal(10, 2)
  isPaid       Boolean            @default(false) @map("is_paid")
  createdAt    DateTime           @default(now()) @map("created_at")
  updatedAt    DateTime           @updatedAt @map("updated_at")

  user   User   @relation(fields: [userId], references: [id])
  doctor Doctor @relation(fields: [doctorId], references: [id])

  @@map("consultations")
  @@index([userId])
  @@index([doctorId])
  @@index([scheduledAt])
  @@index([status])
}
```

---

## 🔌 API Endpoints to Build

### Doctor Management (Admin)
```
POST   /admin/doctors              - Create doctor
GET    /admin/doctors              - List all doctors
GET    /admin/doctors/:id          - Get doctor details
PUT    /admin/doctors/:id          - Update doctor
DELETE /admin/doctors/:id          - Delete doctor
POST   /admin/doctors/:id/availability - Set availability
PUT    /admin/doctors/:id/toggle   - Activate/deactivate doctor
```

### Consultation Management (User)
```
GET    /consultations/doctors                    - List available doctors
GET    /consultations/doctors/:id                - Get doctor details
GET    /consultations/doctors/:id/availability   - Get available slots
POST   /consultations/book                       - Book consultation
GET    /consultations/my-bookings                - Get user's consultations
GET    /consultations/:id                        - Get consultation details
PUT    /consultations/:id/reschedule             - Reschedule consultation
DELETE /consultations/:id/cancel                 - Cancel consultation
```

### Consultation Management (Admin)
```
GET    /admin/consultations                  - List all consultations
GET    /admin/consultations/:id              - Get consultation details
PUT    /admin/consultations/:id/status       - Update status
PUT    /admin/consultations/:id/notes        - Add notes/prescription
POST   /admin/consultations/:id/meeting-link - Generate meeting link
```

---

## 📝 Implementation Steps

### Step 1: Database Schema ✅ NEXT
1. Create Prisma models in `backend/prisma/schema.prisma`
2. Run migration: `npx prisma migrate dev --name add_consultation_system`
3. Update seed file with test doctors and availability
4. Verify schema in database

### Step 2: Backend DTOs & Types
1. Create `backend/src/consultations/dto/` folder
2. Create DTOs:
   - `create-doctor.dto.ts`
   - `update-doctor.dto.ts`
   - `create-availability.dto.ts`
   - `book-consultation.dto.ts`
   - `update-consultation.dto.ts`
3. Add validation decorators

### Step 3: Backend Services
1. Create `DoctorsService` in `consultations/services/doctors.service.ts`
2. Create `ConsultationsService` in `consultations/services/consultations.service.ts`
3. Implement business logic:
   - Availability checking
   - Slot booking algorithm
   - Conflict prevention
   - Status transitions

### Step 4: Backend Controllers
1. Create `DoctorsController` (admin endpoints)
2. Create `ConsultationsController` (user endpoints)
3. Add authentication guards
4. Add role-based access control
5. Add Swagger documentation

### Step 5: Backend Module
1. Create `ConsultationsModule`
2. Register services and controllers
3. Import in `AppModule`

### Step 6: Frontend Types
1. Add types to `frontend/packages/types/src/index.ts`:
   - `Doctor`
   - `AvailabilitySlot`
   - `Consultation`
   - `ConsultationType`
   - `ConsultationStatus`

### Step 7: Frontend API Client
1. Add services to `frontend/packages/api-client/src/services.ts`
2. Add API endpoints to `frontend/packages/config/src/index.ts`

### Step 8: Web App - User Booking
1. Create hooks in `frontend/apps/web/src/hooks/`:
   - `use-doctors.ts`
   - `use-consultations.ts`
   - `use-available-slots.ts`
2. Create pages:
   - `/book-consultation` - Doctor listing
   - `/book-consultation/[doctorId]` - Booking page
   - `/my-consultations` - User's bookings
   - `/consultation/[id]` - Consultation details
3. Create components:
   - `DoctorCard.tsx`
   - `BookingCalendar.tsx`
   - `ConsultationCard.tsx`
   - `TimeSlotPicker.tsx`

### Step 9: Admin Portal - Management
1. Create pages in `frontend/apps/admin/src/app/`:
   - `/doctors` - Doctor management
   - `/doctors/new` - Add doctor
   - `/doctors/[id]` - Edit doctor
   - `/consultations` - All consultations
   - `/consultations/[id]` - Consultation details
2. Create components:
   - `DoctorForm.tsx`
   - `AvailabilityEditor.tsx`
   - `ConsultationTable.tsx`
   - `ConsultationNotes.tsx`

### Step 10: Mobile App - Booking
1. Create screens in `frontend/apps/mobile/app/`:
   - `/book-consultation/index.tsx` - Doctor listing
   - `/book-consultation/[doctorId].tsx` - Booking
   - `/my-consultations.tsx` - User's bookings
   - `/consultation-detail/[id].tsx` - Details
2. Add to tab navigation if needed
3. Add hooks (reuse from web)

### Step 11: Notifications
1. Add email templates:
   - Consultation confirmed
   - Reminder (24 hours before)
   - Reminder (1 hour before)
   - Consultation completed
   - Consultation cancelled
2. Trigger emails on status changes
3. Add to notifications service

### Step 12: Testing
1. Test all API endpoints
2. Test booking flow end-to-end
3. Test availability algorithm
4. Test conflict prevention
5. Test cancellation/rescheduling
6. Test email notifications

---

## 🎯 Success Criteria

- [ ] Doctors can be created and managed by admins
- [ ] Doctors have availability schedules
- [ ] Users can view available doctors
- [ ] Users can see available time slots
- [ ] Users can book consultations
- [ ] Double-booking is prevented
- [ ] Users can view their consultations
- [ ] Users can cancel consultations
- [ ] Users can reschedule consultations
- [ ] Admins can view all consultations
- [ ] Admins can add notes/prescriptions
- [ ] Email notifications are sent
- [ ] All features work on web and mobile

---

## 🚨 Things to Avoid (Don't Break)

1. **Don't modify existing tables** - Only add new ones
2. **Don't change existing API routes** - Only add new ones
3. **Don't modify auth system** - Use existing guards
4. **Don't change shared packages** - Only extend them
5. **Test incrementally** - Verify each step works before moving on

---

## 📦 Dependencies Needed

### Backend
- ✅ Already have: Prisma, NestJS, class-validator
- May need: Date manipulation library (`date-fns`)

### Frontend
- ✅ Already have: React Query, Zustand, forms
- May need: Calendar component (`react-day-picker`)

---

## 🔄 Current Status

**Phase:** Phase 1 - Database Schema  
**Next Action:** Create Prisma models  
**Estimated Time Remaining:** 2-3 weeks

---

**Let's start with Phase 1: Database Schema!** 🚀

