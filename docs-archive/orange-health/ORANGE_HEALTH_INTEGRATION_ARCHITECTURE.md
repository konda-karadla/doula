# 🏗️ Orange Health Integration Architecture

**Version:** 1.0  
**Date:** October 9, 2025  
**Status:** Proposed Architecture

---

## 📊 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER APPLICATIONS                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Mobile     │  │   Web App    │  │  Admin Panel │                  │
│  │   (React     │  │   (Next.js)  │  │  (Next.js)   │                  │
│  │   Native)    │  │              │  │              │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
│         │                  │                  │                          │
│         └──────────────────┼──────────────────┘                          │
│                            │                                             │
└────────────────────────────┼─────────────────────────────────────────────┘
                             │
                             │ HTTPS/REST API
                             │
┌────────────────────────────▼─────────────────────────────────────────────┐
│                      YOUR NESTJS BACKEND                                  │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    EXISTING MODULES                              │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │    │
│  │  │   Auth   │  │  Profile │  │ Insights │  │  Action  │        │    │
│  │  │          │  │          │  │          │  │  Plans   │        │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │    │
│  │                                                                  │    │
│  │  ┌──────────┐  ┌────────────────────────────────────┐          │    │
│  │  │   Labs   │  │  NEW: Lab Orders Module            │          │    │
│  │  │ (Upload) │  │  ┌─────────────────────────────┐   │          │    │
│  │  │          │  │  │ LabOrdersController         │   │          │    │
│  │  │          │  │  │  - Check serviceability     │   │          │    │
│  │  │          │  │  │  - List tests               │   │          │    │
│  │  │          │  │  │  - Create order             │   │          │    │
│  │  │          │  │  │  - Track status             │   │          │    │
│  │  │          │  │  │  - Get results              │   │          │    │
│  │  │          │  │  │  - Reschedule/Cancel        │   │          │    │
│  │  └──────────┘  │  └─────────────┬───────────────┘   │          │    │
│  │                │                │                     │          │    │
│  │                │  ┌─────────────▼───────────────┐   │          │    │
│  │                │  │ LabOrdersService            │   │          │    │
│  │                │  │  - Business logic           │   │          │    │
│  │                │  │  - Validation               │   │          │    │
│  │                │  │  - Status management        │   │          │    │
│  │                │  │  - Result processing        │   │          │    │
│  │                │  └─────────────┬───────────────┘   │          │    │
│  │                │                │                     │          │    │
│  │                │  ┌─────────────▼───────────────┐   │          │    │
│  │                │  │ OrangeHealthService         │   │          │    │
│  │                │  │  - API wrapper              │   │          │    │
│  │                │  │  - Error handling           │   │          │    │
│  │                │  │  - Retry logic              │   │          │    │
│  │                │  └─────────────┬───────────────┘   │          │    │
│  │                └────────────────┼───────────────────┘          │    │
│  └───────────────────────────────┼──────────────────────────────────┘    │
│                                  │                                       │
│  ┌──────────────────────────────▼─────────────────────────────────┐    │
│  │                    WEBHOOK HANDLER                              │    │
│  │  ┌──────────────────────────────────────────────────────────┐  │    │
│  │  │  POST /api/webhooks/orange-health                        │  │    │
│  │  │   - Verify signature                                     │  │    │
│  │  │   - Update order status                                  │  │    │
│  │  │   - Trigger notifications                                │  │    │
│  │  │   - Process results                                      │  │    │
│  │  └──────────────────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                  │                                       │
└──────────────────────────────────┼───────────────────────────────────────┘
                                   │
                     ┌─────────────┼──────────────┐
                     │             │              │
          ┌──────────▼─────┐  ┌──▼────────┐  ┌─▼───────────┐
          │   PostgreSQL   │  │  Redis    │  │   AWS S3    │
          │   (Supabase)   │  │  (Queue)  │  │  (Storage)  │
          │                │  │           │  │             │
          │  - lab_orders  │  │  - Jobs   │  │  - PDFs     │
          │  - lab_results │  │  - Cache  │  │             │
          │  - biomarkers  │  │           │  │             │
          └────────────────┘  └───────────┘  └─────────────┘

                             │
                             │ HTTPS
                             │
┌────────────────────────────▼─────────────────────────────────────────────┐
│                    ORANGE HEALTH API                                      │
│                                                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │  Serviceability  │  │  Order Creation  │  │  Status Tracking │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │  Test Catalog    │  │  Results API     │  │    Webhooks      │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Changes

### New Table: `lab_orders`

```sql
CREATE TABLE lab_orders (
  -- Primary Keys
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  system_id               UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  lab_result_id           UUID REFERENCES lab_results(id),
  
  -- Orange Health Integration
  orange_health_order_id  VARCHAR(255) UNIQUE,
  
  -- Order Details
  tests                   JSONB NOT NULL, -- [{id, name, price}]
  total_amount            DECIMAL(10,2),
  discount_amount         DECIMAL(10,2) DEFAULT 0,
  final_amount            DECIMAL(10,2),
  currency                VARCHAR(3) DEFAULT 'INR',
  
  -- Payment Details
  payment_mode            VARCHAR(50), -- online, cod, prepaid
  payment_status          VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_id              VARCHAR(255),
  payment_gateway         VARCHAR(50),
  
  -- Patient Information
  patient_name            VARCHAR(255) NOT NULL,
  patient_mobile          VARCHAR(20) NOT NULL,
  patient_email           VARCHAR(255),
  patient_age             INTEGER,
  patient_gender          VARCHAR(20),
  
  -- Address Information
  address_line1           TEXT NOT NULL,
  address_line2           TEXT,
  address_city            VARCHAR(100),
  address_state           VARCHAR(100),
  address_pincode         VARCHAR(10) NOT NULL,
  address_latitude        DECIMAL(10,8) NOT NULL,
  address_longitude       DECIMAL(11,8) NOT NULL,
  address_landmark        TEXT,
  
  -- Appointment Details
  scheduled_slot          TIMESTAMP NOT NULL,
  slot_type               VARCHAR(20), -- morning, afternoon, evening
  special_instructions    TEXT,
  
  -- Status Tracking
  order_status            VARCHAR(50) DEFAULT 'pending',
  status_message          TEXT,
  
  -- Phlebotomist Details
  phlebotomist_name       VARCHAR(255),
  phlebotomist_phone      VARCHAR(20),
  phlebotomist_photo_url  TEXT,
  
  -- Timing
  estimated_result_time   TIMESTAMP,
  sample_collected_at     TIMESTAMP,
  result_available_at     TIMESTAMP,
  
  -- Result URLs
  result_pdf_url          TEXT,
  result_data             JSONB, -- Structured biomarker data if available
  
  -- Cancellation/Rescheduling
  cancellation_reason     TEXT,
  cancelled_at            TIMESTAMP,
  rescheduled_from        TIMESTAMP,
  rescheduled_at          TIMESTAMP,
  
  -- Metadata
  notes                   TEXT,
  internal_notes          TEXT, -- Staff notes
  
  -- Timestamps
  created_at              TIMESTAMP DEFAULT NOW(),
  updated_at              TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT valid_amounts CHECK (
    total_amount >= 0 AND 
    discount_amount >= 0 AND 
    final_amount >= 0
  )
);

-- Indexes for performance
CREATE INDEX idx_lab_orders_user_id ON lab_orders(user_id);
CREATE INDEX idx_lab_orders_system_id ON lab_orders(system_id);
CREATE INDEX idx_lab_orders_status ON lab_orders(order_status);
CREATE INDEX idx_lab_orders_scheduled_slot ON lab_orders(scheduled_slot);
CREATE INDEX idx_lab_orders_orange_id ON lab_orders(orange_health_order_id);
CREATE INDEX idx_lab_orders_payment_status ON lab_orders(payment_status);
CREATE INDEX idx_lab_orders_created_at ON lab_orders(created_at DESC);
```

### New Table: `lab_order_status_history`

```sql
CREATE TABLE lab_order_status_history (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lab_order_id      UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
  
  -- Status Change
  previous_status   VARCHAR(50),
  new_status        VARCHAR(50) NOT NULL,
  status_message    TEXT,
  
  -- Source
  changed_by        VARCHAR(50), -- webhook, user, admin, system
  source_data       JSONB, -- Original webhook payload or API response
  
  -- Timing
  created_at        TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT status_changed CHECK (previous_status != new_status)
);

CREATE INDEX idx_lab_order_status_history_order ON lab_order_status_history(lab_order_id);
CREATE INDEX idx_lab_order_status_history_created ON lab_order_status_history(created_at DESC);
```

### New Table: `orange_health_tests` (Cache)

```sql
CREATE TABLE orange_health_tests (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Orange Health Details
  orange_test_id        VARCHAR(255) UNIQUE NOT NULL,
  test_name             VARCHAR(255) NOT NULL,
  test_description      TEXT,
  test_category         VARCHAR(100),
  
  -- Pricing
  test_price            DECIMAL(10,2),
  discounted_price      DECIMAL(10,2),
  currency              VARCHAR(3) DEFAULT 'INR',
  
  -- Test Details
  sample_type           VARCHAR(50), -- blood, urine, etc.
  fasting_required      BOOLEAN DEFAULT false,
  home_collection       BOOLEAN DEFAULT true,
  tat_hours             INTEGER, -- Turnaround time
  
  -- Preparation Instructions
  preparation_notes     TEXT,
  
  -- Metadata
  is_active             BOOLEAN DEFAULT true,
  is_popular            BOOLEAN DEFAULT false,
  display_order         INTEGER DEFAULT 0,
  
  -- Biomarkers Included (for packages)
  biomarkers_included   JSONB, -- Array of biomarker names
  
  -- Timestamps
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW(),
  last_synced_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orange_tests_test_id ON orange_health_tests(orange_test_id);
CREATE INDEX idx_orange_tests_category ON orange_health_tests(test_category);
CREATE INDEX idx_orange_tests_active ON orange_health_tests(is_active);
CREATE INDEX idx_orange_tests_popular ON orange_health_tests(is_popular);
```

### Update Existing Table: `lab_results`

Add fields to link with orders:

```sql
ALTER TABLE lab_results 
ADD COLUMN lab_order_id UUID REFERENCES lab_orders(id),
ADD COLUMN source VARCHAR(50) DEFAULT 'manual_upload', -- manual_upload, orange_health, other_provider
ADD COLUMN provider_result_id VARCHAR(255);

CREATE INDEX idx_lab_results_order_id ON lab_results(lab_order_id);
CREATE INDEX idx_lab_results_source ON lab_results(source);
```

---

## 🔄 Data Flow Diagrams

### Flow 1: User Books Lab Test

```
┌──────┐                                    ┌─────────┐
│ User │                                    │ Backend │
└───┬──┘                                    └────┬────┘
    │                                            │
    │ 1. Enter location                          │
    ├──────────────────────────────────────────>│
    │                                            │
    │         2. Check serviceability            │
    │            with Orange Health              │
    │                                            ├────┐
    │                                            │    │ API Call
    │                                            │<───┘
    │                                            │
    │ 3. Show available slots                    │
    │<──────────────────────────────────────────┤
    │                                            │
    │ 4. Browse tests                            │
    ├──────────────────────────────────────────>│
    │                                            │
    │ 5. Return test catalog (from cache)        │
    │<──────────────────────────────────────────┤
    │                                            │
    │ 6. Select tests & time slot                │
    ├──────────────────────────────────────────>│
    │                                            │
    │         7. Create order in DB              │
    │                                            ├────┐
    │                                            │    │
    │                                            │<───┘
    │                                            │
    │         8. Create order with               │
    │            Orange Health                   │
    │                                            ├────┐
    │                                            │    │ API Call
    │                                            │<───┘
    │                                            │
    │         9. Update order with               │
    │            Orange Health order ID          │
    │                                            ├────┐
    │                                            │    │
    │                                            │<───┘
    │                                            │
    │ 10. Return confirmation                    │
    │<──────────────────────────────────────────┤
    │                                            │
    │ 11. Proceed to payment                     │
    ├──────────────────────────────────────────>│
    │                                            │
```

### Flow 2: Webhook Updates (Real-Time)

```
┌──────────────┐         ┌─────────┐         ┌──────────┐
│ Orange Health│         │ Backend │         │   User   │
└──────┬───────┘         └────┬────┘         └────┬─────┘
       │                      │                   │
       │ 1. Status changed    │                   │
       │   (phlebotomist      │                   │
       │    assigned)         │                   │
       │                      │                   │
       │ 2. Send webhook      │                   │
       ├────────────────────>│                   │
       │                      │                   │
       │      3. Verify       │                   │
       │         signature    │                   │
       │                      ├────┐              │
       │                      │    │              │
       │                      │<───┘              │
       │                      │                   │
       │      4. Update DB    │                   │
       │         (order       │                   │
       │          status)     │                   │
       │                      ├────┐              │
       │                      │    │              │
       │                      │<───┘              │
       │                      │                   │
       │      5. Log status   │                   │
       │         history      │                   │
       │                      ├────┐              │
       │                      │    │              │
       │                      │<───┘              │
       │                      │                   │
       │ 6. Return 200 OK     │                   │
       │<────────────────────┤                   │
       │                      │                   │
       │                      │ 7. Push          │
       │                      │    notification   │
       │                      ├─────────────────>│
       │                      │                   │
       │                      │ 8. Update UI      │
       │                      │    (if app open)  │
       │                      ├─────────────────>│
       │                      │                   │
```

### Flow 3: Results Available

```
┌──────────────┐         ┌─────────┐         ┌──────────┐
│ Orange Health│         │ Backend │         │   User   │
└──────┬───────┘         └────┬────┘         └────┬─────┘
       │                      │                   │
       │ 1. Results ready     │                   │
       │                      │                   │
       │ 2. Webhook: results  │                   │
       │    available         │                   │
       ├────────────────────>│                   │
       │                      │                   │
       │      3. Fetch        │                   │
       │         results      │                   │
       │         (PDF + JSON) │                   │
       │<─────────────────────┤                   │
       │                      │                   │
       │ 4. Return results    │                   │
       ├────────────────────>│                   │
       │                      │                   │
       │      5. Create       │                   │
       │         LabResult    │                   │
       │         entry        │                   │
       │                      ├────┐              │
       │                      │    │              │
       │                      │<───┘              │
       │                      │                   │
       │      6. Upload PDF   │                   │
       │         to S3        │                   │
       │                      ├────┐              │
       │                      │    │              │
       │                      │<───┘              │
       │                      │                   │
       │      7. Parse        │                   │
       │         biomarkers   │                   │
       │                      ├────┐              │
       │                      │    │              │
       │                      │<───┘              │
       │                      │                   │
       │      8. Link to      │                   │
       │         order        │                   │
       │                      ├────┐              │
       │                      │    │              │
       │                      │<───┘              │
       │                      │                   │
       │      9. Generate     │                   │
       │         insights     │                   │
       │                      ├────┐              │
       │                      │    │              │
       │                      │<───┘              │
       │                      │                   │
       │                      │ 10. Notify user  │
       │                      ├─────────────────>│
       │                      │     "Results     │
       │                      │      Ready!"     │
       │                      │                   │
```

---

## 📁 File Structure

```
backend/
└── src/
    ├── lab-orders/
    │   ├── dto/
    │   │   ├── create-lab-order.dto.ts
    │   │   ├── update-lab-order.dto.ts
    │   │   ├── check-serviceability.dto.ts
    │   │   └── reschedule-order.dto.ts
    │   │
    │   ├── services/
    │   │   ├── orange-health.service.ts      # API wrapper
    │   │   ├── lab-orders.service.ts         # Business logic
    │   │   └── test-catalog.service.ts       # Test cache management
    │   │
    │   ├── processors/
    │   │   └── order-status-processor.ts     # Background job for status sync
    │   │
    │   ├── lab-orders.controller.ts
    │   ├── lab-orders.module.ts
    │   └── lab-orders.controller.spec.ts
    │
    ├── webhooks/
    │   ├── webhooks.controller.ts            # Webhook receiver
    │   ├── webhooks.service.ts
    │   └── webhooks.module.ts
    │
    └── config/
        └── orange-health.config.ts           # Orange Health API config
```

---

## 🔐 Environment Variables

```env
# Orange Health API Configuration
ORANGE_HEALTH_API_KEY=ofC7Ohstd&dc[hjWi[xhY}@Z9!w@6Mi6kyJzmjPp
ORANGE_HEALTH_BASE_URL=https://stag2-partner-api.orangehealth.dev/v1/partner
ORANGE_HEALTH_WEBHOOK_SECRET=<to_be_provided>
ORANGE_HEALTH_WEBHOOK_URL=https://yourdomain.com/api/webhooks/orange-health

# Orange Health Settings
ORANGE_HEALTH_TEST_CACHE_TTL=3600  # 1 hour
ORANGE_HEALTH_RETRY_ATTEMPTS=3
ORANGE_HEALTH_TIMEOUT=30000  # 30 seconds
```

---

## 🎯 API Endpoints to Implement

### Lab Orders Controller

```typescript
// Serviceability
GET    /api/lab-orders/serviceability?lat=12.93&lng=77.62&date=2025-10-10
Response: { serviceable: true, slots: [...] }

// Test Catalog
GET    /api/lab-orders/tests?category=blood&search=vitamin
Response: { tests: [...], total: 100 }

GET    /api/lab-orders/tests/:testId
Response: { id, name, price, description, ... }

// Order Management
POST   /api/lab-orders
Body:  { tests, patientDetails, address, slot }
Response: { orderId, orangeHealthOrderId, confirmationCode }

GET    /api/lab-orders
Query: ?status=confirmed&page=1&limit=10
Response: { orders: [...], total: 50, page: 1 }

GET    /api/lab-orders/:orderId
Response: { order details with full info }

GET    /api/lab-orders/:orderId/status
Response: { status, phlebotomist, estimatedTime, history }

GET    /api/lab-orders/:orderId/results
Response: { pdfUrl, biomarkers, insights }

PUT    /api/lab-orders/:orderId/reschedule
Body:  { newSlot: '2025-10-11T10:00:00' }
Response: { success: true, newSlot }

DELETE /api/lab-orders/:orderId
Response: { success: true, refundAmount }

// Statistics (for dashboard)
GET    /api/lab-orders/stats
Response: { totalOrders, completed, pending, cancelled }
```

### Webhooks Controller

```typescript
// Webhook Receiver
POST   /api/webhooks/orange-health
Headers: { 'X-Orange-Signature': 'signature_here' }
Body:  { event, order_id, status, data }
Response: { received: true }
```

---

## 🔄 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create database migrations
- [ ] Create OrangeHealthService
- [ ] Implement serviceability check
- [ ] Implement test catalog caching
- [ ] Add environment configuration

### Phase 2: Core Booking (Week 2)
- [ ] Implement order creation
- [ ] Implement order listing
- [ ] Implement order details
- [ ] Add payment integration
- [ ] Write unit tests

### Phase 3: Real-Time Updates (Week 3)
- [ ] Implement webhook receiver
- [ ] Add webhook signature verification
- [ ] Implement status update handler
- [ ] Add push notification triggers
- [ ] Test webhook delivery

### Phase 4: Results & Management (Week 4)
- [ ] Implement results fetching
- [ ] Link results to LabResult table
- [ ] Implement reschedule functionality
- [ ] Implement cancel functionality
- [ ] Add admin dashboard features

### Phase 5: Testing & Launch (Week 5)
- [ ] Integration testing
- [ ] Load testing
- [ ] Security audit
- [ ] Production deployment
- [ ] Monitoring setup

---

## 📊 Success Metrics

### Technical Metrics
- API response time < 500ms
- Webhook processing < 1 second
- 99.9% uptime
- < 1% error rate

### Business Metrics
- 10%+ of users book tests (Month 1)
- 30%+ of users book tests (Month 3)
- < 5% cancellation rate
- 90%+ user satisfaction

---

## 🚨 Risk Mitigation

### Technical Risks

**Risk:** Orange Health API downtime  
**Mitigation:** Implement graceful error handling, show maintenance message, store failed requests for retry

**Risk:** Webhook delivery failures  
**Mitigation:** Implement polling fallback, request retry from Orange Health, log all webhook attempts

**Risk:** Data sync issues  
**Mitigation:** Implement idempotent webhook handlers, add reconciliation job to sync status periodically

### Business Risks

**Risk:** High cancellation rate  
**Mitigation:** Clear cancellation policy, send reminders, easy reschedule option

**Risk:** Poor user experience  
**Mitigation:** Thorough testing, soft launch with beta users, gather feedback early

**Risk:** Pricing discrepancies  
**Mitigation:** Sync test catalog daily, show disclaimer about prices, confirm price before payment

---

## 📞 Support & Monitoring

### Monitoring Setup
- [ ] API call logging (all Orange Health requests)
- [ ] Error tracking (Sentry/similar)
- [ ] Webhook delivery monitoring
- [ ] Order funnel analytics
- [ ] Performance metrics (response times)

### Alerts
- [ ] API error rate > 5%
- [ ] Webhook processing failures
- [ ] Order creation failures
- [ ] Payment processing issues

### Support Tools
- [ ] Admin panel for order management
- [ ] Order search and filter
- [ ] Manual status update capability
- [ ] Refund processing interface
- [ ] Support ticket integration

---

**Document Status:** Draft - Pending Orange Health API Documentation  
**Next Update:** After Orange Health Call

---

