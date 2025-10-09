# 📞 Orange Health Call - Q&A Guide with Expected Answers

**Purpose:** Detailed questions with possible answers and what to listen for  
**Date:** October 9, 2025

---

## 🔴 CRITICAL QUESTIONS (Must Answer Today)

---

### 1. TEST CATALOG & DISCOVERY

#### Q1.1: "How do we access your complete test catalog?"

**Why Important:** Can't build test selection UI without knowing how to get test list

**Possible Answers:**
- ✅ **IDEAL:** "We have a `/v1/partner/tests` endpoint that returns all tests"
- ✅ **GOOD:** "We'll provide a JSON/CSV file that you can import to your database"
- ⚠️ **OKAY:** "We'll give you an Excel sheet of tests, update it monthly"
- ❌ **BAD:** "You need to manually select tests we support per order"

**Follow-up Questions:**
- Can you share the endpoint URL or sample file right now?
- How often does the catalog update?
- Do you notify partners of catalog changes?

---

#### Q1.2: "How do we get test IDs needed for order creation?"

**Why Important:** Order creation requires test IDs in the API payload

**Possible Answers:**
- ✅ **IDEAL:** "Each test in the catalog has a unique `test_id` field"
- ✅ **GOOD:** "Tests have stable IDs like 'CBC001', 'VIT_D_001'"
- ⚠️ **CONCERN:** "We use database auto-increment IDs" (can change)
- ❌ **BAD:** "You need to contact us for each test ID"

**What to Listen For:**
- Are IDs stable across environments (staging vs. production)?
- Are IDs human-readable or random UUIDs?
- Do IDs change when tests are updated?

---

#### Q1.3: "Are test prices included in the API response?"

**Why Important:** Need to show prices to users before booking

**Possible Answers:**
- ✅ **IDEAL:** "Yes, each test has `price`, `discounted_price`, and `currency` fields"
- ✅ **GOOD:** "Yes, we include MRP and partner price in the response"
- ⚠️ **OKAY:** "We provide a separate price list that syncs daily"
- ❌ **BAD:** "Prices are negotiated per order"

**Follow-up Questions:**
- Do prices vary by location/pincode?
- Do you offer volume discounts?
- What's the partner pricing vs. retail pricing?
- Can we show promotional pricing?

---

#### Q1.4: "Do you offer test packages or panels?"

**Why Important:** Users often want comprehensive packages (e.g., "Full Body Checkup")

**Possible Answers:**
- ✅ **IDEAL:** "Yes, packages are in the catalog with included tests listed"
- ✅ **GOOD:** "Yes, we have packages. They work like regular tests in the API"
- ⚠️ **OKAY:** "We have packages but you need to create them in your system"
- ❌ **CONCERN:** "No packages, users must select individual tests"

**What to Look For:**
- How are packages structured in the response?
- Can we see which individual tests are in a package?
- Are package prices discounted vs. individual tests?

---

#### Q1.5: "Can we cache the test catalog, or must we fetch real-time?"

**Why Important:** Affects app performance and API usage

**Possible Answers:**
- ✅ **IDEAL:** "Cache for 24 hours, we rarely change it"
- ✅ **GOOD:** "Cache for 1 hour, check ETag header for updates"
- ⚠️ **OKAY:** "Real-time fetch recommended, but caching is fine"
- ❌ **CONCERN:** "Must fetch real-time every time" (performance issue)

**Implementation Impact:**
- ✅ Can cache → Better performance, lower API usage
- ❌ Real-time only → Slower app, more API calls

---

#### Q1.6: "Do test prices vary by location?"

**Why Important:** Affects pricing display and order creation logic

**Possible Answers:**
- ✅ **SIMPLE:** "No, prices are same across all serviceable areas"
- ⚠️ **COMPLEX:** "Yes, prices vary by city/region"
- ⚠️ **VERY COMPLEX:** "Prices vary by exact pincode"

**Implementation Impact:**
- Same price → Simple, show price immediately
- Location-based → Need to fetch price after location selection

---

---

### 2. ORDER CREATION & PAYMENT FLOW

#### Q2.1: "What is the complete order creation API endpoint and response structure?"

**Why Important:** Core functionality - need exact API structure

**Possible Answers:**
- ✅ **IDEAL:** "POST `/v1/partner/order` - we'll share full spec"
  ```json
  {
    "order_id": "ORG123456",
    "status": "confirmed",
    "amount": 1500,
    "slot_datetime": "2025-10-10T08:30:00",
    "booking_code": "ABC123"
  }
  ```
- ✅ **GOOD:** They share documentation or Postman collection
- ⚠️ **CONCERN:** "We'll email documentation later" (need it now)

**What You Need:**
- Exact endpoint URL
- Required vs. optional fields
- Sample request and response
- Error response format

---

#### Q2.2: "What payment modes do you support?"

**Why Important:** Determines payment integration complexity

**Possible Answers:**
- ✅ **IDEAL:** "We support: online (Razorpay), COD, and prepaid credits"
- ✅ **GOOD:** "Online and COD - we handle payment gateway"
- ⚠️ **COMPLEX:** "You collect payment, transfer to us later"
- ❌ **CONCERN:** "Only online payment via our checkout page" (poor UX)

**Common Options:**
- `online` - Credit/debit card, UPI, net banking
- `cod` - Cash on delivery / Pay to phlebotomist
- `prepaid` - Wallet/credits system
- `insurance` - Insurance billing

---

#### Q2.3: "Do you provide payment gateway integration, or do we handle payments?"

**Why Important:** Determines if you need separate payment gateway

**Possible Answers:**
- ✅ **IDEAL:** "We provide payment gateway - you just pass `payment_mode: 'online'`"
- ✅ **GOOD:** "We return a payment link, user completes payment"
- ⚠️ **COMPLEX:** "You collect payment, confirm to us via API"
- ⚠️ **VERY COMPLEX:** "You integrate your own payment gateway"

**Follow-up Questions:**
- What payment gateways do you use? (Razorpay, Stripe, etc.)
- Do you provide webhook for payment status?
- What happens if payment fails?
- Can we use our own payment gateway?

---

#### Q2.4: "Can we get the order total before creating the order?"

**Why Important:** Need to show final price to user before confirmation

**Possible Answers:**
- ✅ **IDEAL:** "Yes, use POST `/v1/partner/order/calculate` with test IDs"
- ✅ **GOOD:** "Test prices include everything, just sum them up"
- ⚠️ **OKAY:** "Calculate from test prices, add home collection fee"
- ❌ **CONCERN:** "Create order to see price, then confirm/cancel"

**What to Listen For:**
- Are there additional fees? (home collection, urgent processing)
- Are there discounts? (first time, promotional codes)
- Do you apply taxes/GST?

**Expected Cost Structure:**
```
Test Cost:           ₹1,200
Home Collection:     ₹100
Discount:            -₹150
Subtotal:            ₹1,150
GST (5%):           ₹58
Total:               ₹1,208
```

---

#### Q2.5: "Is there a 'validate order' or 'dry run' endpoint?"

**Why Important:** Want to validate order before actual creation

**Possible Answers:**
- ✅ **IDEAL:** "Yes, POST `/v1/partner/order/validate` checks everything"
- ✅ **GOOD:** "Serviceability check covers most validation"
- ⚠️ **OKAY:** "No separate endpoint, but order creation validates"
- ❌ **CONCERN:** "No validation - order might fail after creation"

**What It Should Validate:**
- Location serviceability
- Slot availability
- Test IDs validity
- Price calculation
- Patient information format

---

#### Q2.6: "What are your refund policies?"

**Why Important:** Need to communicate this to users

**Possible Answers:**
- ✅ **CLEAR:** "Full refund if cancelled 4+ hours before slot"
- ✅ **TYPICAL:** "100% refund before sample collection, 0% after"
- ⚠️ **COMPLEX:** "Depends on cancellation reason and timing"
- ❌ **CONCERN:** "No refunds, only rescheduling allowed"

**Key Details to Get:**
- Cancellation deadline (hours before appointment)
- Refund percentage based on timing
- Refund processing time (instant, 3-5 days, etc.)
- Who initiates refund - you or Orange Health?
- Refund method (original payment method, wallet, etc.)

**Example Policy:**
```
Cancelled >24 hours before: 100% refund
Cancelled 12-24 hours before: 50% refund
Cancelled <12 hours before: No refund
Sample collection failed (our fault): 100% refund
```

---

---

### 3. WEBHOOKS (Real-Time Updates)

#### Q3.1: "What webhook events are available?"

**Why Important:** Determines how real-time your user experience can be

**Possible Answers:**
- ✅ **IDEAL:** 
  ```
  - order.created
  - order.confirmed
  - phlebotomist.assigned
  - phlebotomist.on_route
  - sample.collected
  - sample.received_at_lab
  - results.processing
  - results.ready
  - payment.completed
  - payment.failed
  - order.cancelled
  ```

- ✅ **GOOD:** 
  ```
  - order.status_changed (covers all status changes)
  - results.ready
  - payment.updated
  ```

- ⚠️ **MINIMAL:** 
  ```
  - results.ready (only)
  ```

- ❌ **NONE:** "No webhooks, you need to poll status"

**Follow-up:** Can you share the webhook event list with payload examples?

---

#### Q3.2: "How do we register our webhook URL?"

**Why Important:** Need to know setup process

**Possible Answers:**
- ✅ **IDEAL:** "Provide your URL, we'll configure it immediately"
- ✅ **GOOD:** "Use our dashboard to register webhook URLs"
- ⚠️ **OKAY:** "Email us your URL, we'll set it up in 24 hours"
- ❌ **CONCERN:** "Contact support for each webhook registration"

**Your Webhook URL:**
```
https://yourdomain.com/api/webhooks/orange-health
```

**What to Ask:**
- Can we have different URLs for staging and production?
- Can we update the webhook URL ourselves?
- How do we test webhooks before going live?

---

#### Q3.3: "What is the webhook payload structure?"

**Why Important:** Need to parse webhooks correctly

**Possible Answers:**
- ✅ **IDEAL:** Shares detailed structure:
  ```json
  {
    "event": "order.status_changed",
    "timestamp": "2025-10-10T12:30:00Z",
    "data": {
      "order_id": "ORG123456",
      "previous_status": "confirmed",
      "new_status": "sample_collected",
      "phlebotomist": {
        "name": "John Doe",
        "phone": "9876543210"
      }
    }
  }
  ```

- ✅ **GOOD:** "We'll share documentation with examples"
- ⚠️ **CONCERN:** "Basic structure only, you'll figure it out"

**What to Request:**
- Sample webhook payload for each event type
- Which fields are always present vs. conditional
- Data types for each field

---

#### Q3.4: "Do you sign webhook payloads for security verification?"

**Why Important:** Security - need to verify webhooks are from Orange Health

**Possible Answers:**
- ✅ **IDEAL:** "Yes, HMAC-SHA256 signature in `X-Orange-Signature` header"
- ✅ **GOOD:** "Yes, we sign with your webhook secret key"
- ⚠️ **OKAY:** "We use API key in header for verification"
- ❌ **CONCERN:** "No signature, just verify IP address"
- ❌ **BAD:** "No security verification"

**Implementation:**
```javascript
// Expected verification method
const crypto = require('crypto');
const signature = req.headers['x-orange-signature'];
const payload = JSON.stringify(req.body);
const expectedSig = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');
  
if (signature !== expectedSig) {
  throw new Error('Invalid webhook signature');
}
```

**What You Need:**
- Webhook secret key
- Signature algorithm (HMAC-SHA256, etc.)
- Header name for signature
- Verification example in your language

---

#### Q3.5: "How do you handle webhook delivery failures and retries?"

**Why Important:** Ensures you don't miss important updates

**Possible Answers:**
- ✅ **IDEAL:** "We retry 5 times with exponential backoff (1min, 5min, 30min, 2h, 6h)"
- ✅ **GOOD:** "We retry 3 times over 24 hours"
- ⚠️ **OKAY:** "We retry once after 10 minutes"
- ❌ **CONCERN:** "No retries, you need to poll if you miss a webhook"

**What to Ask:**
- What is your retry schedule?
- How long do you keep trying?
- Do you notify us of failed webhook deliveries?
- Can we request a webhook replay?
- Should we implement our own polling as backup?

**Best Practice:**
- Your server should return 200 OK quickly
- Process webhook asynchronously (queue it)
- Return 200 even if processing fails (avoid retries)

---

#### Q3.6: "Is there a webhook testing tool or sandbox?"

**Why Important:** Need to test webhooks before going live

**Possible Answers:**
- ✅ **IDEAL:** "Yes, we have a dashboard where you can trigger test webhooks"
- ✅ **GOOD:** "Use tools like webhook.site to test, then provide your URL"
- ⚠️ **OKAY:** "Create test orders in staging to trigger webhooks"
- ❌ **CONCERN:** "No testing, just use production carefully"

**Testing Approach:**
1. Use webhook.site or RequestBin initially
2. See actual payload structure
3. Implement your endpoint
4. Test with staging API
5. Move to production

---

---

### 4. TEST RESULTS FORMAT

#### Q4.1: "In what format are test results provided?"

**Why Important:** Determines if you can auto-populate biomarkers or need OCR

**Possible Answers:**
- ✅ **IDEAL:** "Both PDF and structured JSON with biomarker data"
  ```json
  {
    "order_id": "ORG123456",
    "pdf_url": "https://...",
    "biomarkers": [
      {
        "test_name": "Vitamin D",
        "value": "25",
        "unit": "ng/mL",
        "reference_range": "30-100",
        "status": "low"
      }
    ]
  }
  ```

- ✅ **GOOD:** "PDF with structured data in HL7 or FHIR format"
- ⚠️ **OKAY:** "PDF only, but consistent format for easy parsing"
- ⚠️ **MANUAL:** "PDF only, various lab formats" (need OCR)

**Follow-up:** Can you share a sample result response?

---

#### Q4.2: "Do you provide structured biomarker data?"

**Why Important:** Structured data = automatic insights, no OCR needed

**Possible Answers:**
- ✅ **PERFECT:** "Yes, JSON with test name, value, unit, reference ranges"
- ✅ **GREAT:** "Yes, HL7 or FHIR formatted data"
- ⚠️ **OKAY:** "Semi-structured data in PDF annotations"
- ❌ **NEED OCR:** "No, only PDF reports"

**Ideal Data Structure:**
```json
{
  "biomarkers": [
    {
      "id": "bio_001",
      "test_name": "Hemoglobin",
      "value": 14.5,
      "unit": "g/dL",
      "reference_range_low": 12.0,
      "reference_range_high": 16.0,
      "status": "normal",
      "test_date": "2025-10-10",
      "lab_method": "Automated Analyzer",
      "critical_flag": false
    }
  ]
}
```

---

#### Q4.3: "Can you share a sample result response?"

**Why Important:** See actual data structure before building

**What to Request:**
- Complete API response for results
- Sample with 5-10 biomarkers
- Example of normal, high, and low values
- PDF sample
- JSON sample (if available)

---

#### Q4.4: "Are reference ranges always included?"

**Why Important:** Need ranges to calculate if values are normal/abnormal

**Possible Answers:**
- ✅ **IDEAL:** "Yes, every biomarker has reference_range_low and reference_range_high"
- ✅ **GOOD:** "Yes, reference ranges as text like '30-100 ng/mL'"
- ⚠️ **OKAY:** "Most tests have ranges, some don't"
- ❌ **PROBLEM:** "No, ranges vary by lab"

**What You Need:**
- Consistent range format
- Age/gender-specific ranges (if applicable)
- Units always provided with values

---

---

## 🟡 IMPORTANT QUESTIONS (Need This Week)

---

### 5. ORDER MANAGEMENT

#### Q5.1: "What is your rescheduling policy?"

**Possible Answers:**
- ✅ **FLEXIBLE:** "Reschedule anytime up to 2 hours before slot, no fee"
- ✅ **REASONABLE:** "Reschedule up to 12 hours before, no fee"
- ⚠️ **STRICT:** "Reschedule only once, 24 hours before, ₹100 fee"
- ❌ **RIGID:** "No rescheduling, must cancel and rebook"

**API Expectation:**
```
PUT /v1/partner/order/{order_id}/reschedule
{
  "new_slot_datetime": "2025-10-11T10:00:00"
}
```

---

#### Q5.2: "What is your cancellation policy?"

**Possible Answers:**
- ✅ **USER-FRIENDLY:** "Cancel anytime before sample collection, full refund"
- ✅ **STANDARD:** "Cancel >24h before: 100%, 12-24h: 50%, <12h: 0%"
- ⚠️ **STRICT:** "No refunds, only reschedule"

**What to Ask:**
- Cancellation deadline
- Refund percentage by timeline
- Refund processing time
- Who can cancel (user, you, Orange Health)

---

#### Q5.3: "Can tests be added to an existing order?"

**Possible Answers:**
- ✅ **IDEAL:** "Yes, add tests before sample collection via API"
- ✅ **OKAY:** "Yes, but need to contact support"
- ⚠️ **LIMITED:** "Only if phlebotomist hasn't left yet"
- ❌ **NO:** "Must create new order"

---

---

### 6. STATUS & LIFECYCLE

#### Q6.1: "What are ALL possible order status values?"

**Why Important:** Need to handle every status in your UI

**Possible Answers (Typical Flow):**
```
1. pending          - Order created, awaiting payment
2. confirmed        - Payment completed, order confirmed
3. scheduled        - Slot confirmed, in queue
4. assigned         - Phlebotomist assigned
5. en_route         - Phlebotomist traveling to location
6. reached          - Phlebotomist at location
7. in_progress      - Sample collection in progress
8. collected        - Sample collected successfully
9. in_transit       - Sample traveling to lab
10. received        - Sample received at lab
11. processing      - Lab processing sample
12. completed       - Results ready
13. cancelled       - Order cancelled
14. failed          - Collection failed (patient unavailable, etc.)
```

**What to Request:**
- Complete status list
- Status definitions
- Which statuses trigger user notifications
- Can orders skip statuses?

---

#### Q6.2: "What is the typical timeline from booking to results?"

**Possible Answers:**
- ✅ **FAST:** "Sample collection within 24h, results in 6-12 hours"
- ✅ **STANDARD:** "Collection same-day/next-day, results in 24-48 hours"
- ⚠️ **SLOW:** "Collection in 2-3 days, results in 3-5 days"

**Typical Timeline:**
```
Booking          → T+0
Sample Collection → T+6 to T+24 hours
Lab Processing   → T+12 to T+48 hours
Results Ready    → T+24 to T+72 hours
```

---

---

### 7. DOCUMENTATION & SUPPORT

#### Q7.1: "Can we get complete API documentation?"

**What to Request:**
- Full API reference (all endpoints)
- Request/response examples
- Error codes and messages
- Rate limits and throttling
- Authentication details
- Webhook documentation

**Preferred Formats:**
- Swagger/OpenAPI spec
- Postman collection
- PDF documentation
- Online documentation portal

---

#### Q7.2: "Can you share sample payloads for all endpoints?"

**What You Need:**
- Order creation (request + response)
- Order status (response)
- Results API (response)
- Webhook payloads (all events)
- Error responses

---

#### Q7.3: "What is the timeline for production API access?"

**Possible Answers:**
- ✅ **IMMEDIATE:** "We can activate today after contract"
- ✅ **FAST:** "2-3 days after contract signature"
- ⚠️ **STANDARD:** "1-2 weeks"
- ⚠️ **SLOW:** "3-4 weeks"

**What You Need:**
- Production API key
- Production webhook URL setup
- Go-live checklist
- Support during launch

---

#### Q7.4: "What technical support do you provide?"

**What to Ask:**
- Support email/phone/Slack?
- Response time SLA (2 hours, 24 hours)?
- Dedicated integration support?
- Support hours (9-5, 24/7)?
- Escalation process?

**Ideal Support:**
- Dedicated Slack channel
- Email: partners@orangehealth.in
- Response: <2 hours for critical issues
- Integration engineer for first 2 weeks

---

---

## 🟢 NICE TO HAVE (For Planning)

---

### 8. TECHNICAL DETAILS

#### Q8.1: "What are your API rate limits?"

**Possible Answers:**
- ✅ **GENEROUS:** "1000 requests/minute, 100k/day"
- ✅ **REASONABLE:** "100 requests/minute, 10k/day"
- ⚠️ **LIMITED:** "10 requests/minute, 1k/day"

**What to Ask:**
- Per endpoint or overall?
- How are we notified of limit (429 status)?
- Can limits be increased for high volume?

---

#### Q8.2: "What are your API uptime SLAs?"

**Possible Answers:**
- ✅ **EXCELLENT:** "99.9% uptime (8.76 hours downtime/year)"
- ✅ **GOOD:** "99% uptime"
- ⚠️ **BASIC:** "Best effort, no SLA"

**What to Ask:**
- Do you have scheduled maintenance windows?
- How are partners notified of outages?
- Is there a status page?

---

---

### 9. BUSINESS TERMS

#### Q9.1: "What is the partner commission structure?"

**Possible Answers:**
- ✅ **PERCENTAGE:** "15-20% commission on each order"
- ✅ **MARGIN:** "You get 20% off retail price"
- ✅ **MARKUP:** "You can add 10-15% markup"

**What to Ask:**
- Commission percentage?
- How is commission calculated (before or after discounts)?
- When is commission paid?
- Minimum order value?
- Different rates for different tests?

**Example Structure:**
```
Test Retail Price:    ₹1,500
Partner Price:        ₹1,275 (15% discount)
You Charge User:      ₹1,500
Your Margin:          ₹225 (15%)
```

---

#### Q9.2: "How do payouts work?"

**What to Ask:**
- Payout frequency (weekly, monthly)?
- Payout method (bank transfer, digital wallet)?
- Minimum payout threshold?
- Payout timeline (T+7, T+30)?
- Invoice requirements?

---

---

## 📋 SUMMARY CHECKLIST

### Must Get Today:
- [ ] Test catalog endpoint or file
- [ ] Order creation API details
- [ ] Webhook events list
- [ ] Results format (JSON or PDF only)
- [ ] Complete API documentation (or timeline)
- [ ] Technical support contact

### Should Get Today:
- [ ] Sample API responses
- [ ] Refund/cancellation policy
- [ ] Status values list
- [ ] Production access timeline
- [ ] Partnership terms overview

### Nice to Get Today:
- [ ] Rate limits
- [ ] SLA details
- [ ] Commission structure

---

## 💡 TIPS FOR THE CALL

### Listen For Red Flags:
- ❌ "We don't have documentation" → Ask when they'll have it
- ❌ "You'll figure it out" → Not acceptable, need clarity
- ❌ "That's not available via API" → Ask for workarounds
- ❌ "Contact support each time" → Not scalable

### Green Flags:
- ✅ They reference their documentation
- ✅ They share Postman collection
- ✅ They offer dedicated support
- ✅ They have other partners using API successfully

### Questions to Gauge Maturity:
- "How many partners are using your API?"
- "What's the typical integration timeline?"
- "Can you share a reference implementation?"
- "Do you have a developer portal?"

---

## 📞 AFTER THE CALL

### Immediate Actions:
1. Send thank you email
2. Request all promised documentation
3. Share notes with your team
4. Fill in this Q&A doc with actual answers
5. Create Go/No-Go decision doc

### Red Flags to Watch:
- No clear documentation
- Manual processes required
- Poor API design
- No webhook support
- Unclear pricing/commissions

### Green Light Indicators:
- ✅ Well-documented API
- ✅ Webhook support
- ✅ Structured result data
- ✅ Clear business terms
- ✅ Responsive support team

---

**Good luck! This Q&A format should help you understand not just what to ask, but what answers to expect and which answers are best for your integration.** 🚀

---

**Next Step:** After the call, fill in the actual answers in this document and share with your team for decision-making.

