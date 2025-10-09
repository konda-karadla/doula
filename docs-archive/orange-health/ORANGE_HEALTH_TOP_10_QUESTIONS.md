# 🎯 Orange Health Call - Top 10 Critical Questions

**Print this page and bring to the call** 📄  
**For:** Health Platform enabling lab test booking from insights

---

## ⚡ THE TOP 10 - Must Answer Today

---

### 1️⃣ **TEST CATALOG: How do we get the list of available tests?**

**Your Use Case:** Users see "Low Vitamin D" in insights → Need to show "Book Vitamin D Test" button with price

**Ask:**
> "What API endpoint or file provides your complete test catalog with test IDs, names, and prices?"

**Ideal Answer:**
- ✅ `GET /v1/partner/tests` returns JSON with all tests
- ✅ Includes: `test_id`, `name`, `price`, `description`, `category`

**Follow-up:**
- "Can we cache this for 24 hours or must fetch real-time?"
- "Do you have test categories like 'Vitamins', 'Hormones', etc.?"
- "Can you share the endpoint now or sample JSON?"

**Why Critical:** Can't build booking UI without knowing available tests

---

### 2️⃣ **SMART MATCHING: Can we search tests by biomarker name?**

**Your Use Case:** User has "Vitamin D" biomarker → Need to find the right test to book

**Ask:**
> "If a user has low Vitamin D in their results, how do we find and recommend the correct test to retest? Is there a search API or biomarker-to-test mapping?"

**Ideal Answer:**
- ✅ Tests have `biomarkers_included` field listing what they measure
- ✅ Search endpoint: `GET /v1/partner/tests?search=vitamin+d`
- ✅ Tests have standard biomarker names matching your database

**Follow-up:**
- "Do test names match biomarker names?" (e.g., "Vitamin D 25-OH" test → "Vitamin D" biomarker)
- "Can we get a mapping file of biomarkers to test IDs?"
- "How do you handle similar tests?" (e.g., Vitamin D vs. Vitamin D3 specific)

**Your Implementation:**
```javascript
// User sees low Vitamin D biomarker
const biomarkerName = "Vitamin D";

// Need to find matching test
const test = await findOrangeHealthTest(biomarkerName);
// → Returns: { test_id: "VIT_D_001", name: "Vitamin D 25-OH", price: 800 }

// Show: "Retest Vitamin D - ₹800"
```

**Why Critical:** Core feature - recommend tests based on insights

---

### 3️⃣ **RESULTS DATA: Do you provide structured biomarker data (JSON)?**

**Your Use Case:** When results arrive, auto-populate biomarkers table → Generate new insights automatically

**Ask:**
> "When test results are ready, do you provide structured biomarker data in JSON format with values, units, and reference ranges? Or only PDF?"

**Ideal Answer:**
- ✅ **PERFECT:** JSON with structured biomarkers
  ```json
  {
    "results": [
      {
        "biomarker": "Vitamin D",
        "value": 25,
        "unit": "ng/mL",
        "reference_low": 30,
        "reference_high": 100,
        "status": "low"
      }
    ]
  }
  ```
- ⚠️ **ACCEPTABLE:** PDF only (continue using OCR)

**Follow-up if YES:**
- "Can you share a sample result JSON?"
- "Do biomarker names match industry standards?"
- "Are reference ranges age/gender-specific?"

**Follow-up if NO:**
- "Is the PDF format consistent for parsing?"
- "Do you plan to add structured data in future?"

**Your Implementation Impact:**
- ✅ Structured data → Auto-populate biomarkers, instant insights, no OCR delay
- ⚠️ PDF only → Continue OCR workflow (slower, less accurate)

**Why Critical:** Determines if you can close the loop (test → results → insights) automatically

---

### 4️⃣ **WEBHOOKS: How do we get real-time updates?**

**Your Use Case:** User books test → Track in real-time → Notify when results ready

**Ask:**
> "What webhook events do you provide, and how do we register our webhook URL?"

**Essential Events Needed:**
```
✅ order.confirmed        → Show "Order confirmed"
✅ phlebotomist.assigned  → Show "Technician assigned"
✅ sample.collected       → Show "Sample collected"
✅ results.ready          → Notify user + auto-import results
```

**Ideal Answer:**
- ✅ All 4 events above supported
- ✅ Simple registration: "Give us your URL, we'll configure it"
- ✅ Webhook payloads include `order_id` and relevant data
- ✅ Signed webhooks for security (HMAC)

**Follow-up:**
- "Can you share webhook payload examples?"
- "What's your retry policy if our server is down?"
- "Is there a test webhook tool?"

**Webhook URL to Provide:**
```
Staging:    https://staging-api.yourplatform.com/api/webhooks/orange-health
Production: https://api.yourplatform.com/api/webhooks/orange-health
```

**Why Critical:** Real-time experience depends on webhooks (vs. polling every minute)

---

### 5️⃣ **PAYMENT: Do you handle payments or do we?**

**Your Use Case:** User clicks "Book Test" → Pay → Confirm order

**Ask:**
> "What payment flow do you support? Do you provide payment gateway integration, or do we collect payment and transfer to you?"

**Ideal Answer:**
- ✅ **EASIEST:** "Pass `payment_mode: 'online'`, we return payment link, user pays, webhook confirms"
- ✅ **GOOD:** "We integrate Razorpay, you just create order, we handle payment"
- ⚠️ **COMPLEX:** "You collect payment via your gateway, confirm payment_id to us"

**Payment Modes Needed:**
- `online` - Credit/debit card, UPI (most users)
- `cod` - Cash on delivery (some users prefer)

**Follow-up:**
- "If we collect payment, how do we confirm it to you?"
- "What payment gateway do you use?"
- "Do you provide test webhook for payment?"

**Why Critical:** Can't launch without clear payment flow

---

### 6️⃣ **ORDER LINKING: How do we track which order matches which user?**

**Your Use Case:** Store Orange Health order ID in your database to link order ↔ user ↔ results

**Ask:**
> "When we create an order, what unique identifier do you return? And when results arrive via webhook, does it include this ID?"

**What You Need:**
```javascript
// 1. Create order
const response = await createOrder({...});
const orangeOrderId = response.order_id; // Need this!

// 2. Store in your database
await db.labOrders.create({
  user_id: user.id,
  orange_health_order_id: orangeOrderId // Store for tracking
});

// 3. When webhook arrives with results
const webhook = {
  event: "results.ready",
  data: {
    order_id: orangeOrderId, // Same ID!
    results: {...}
  }
};
```

**Ideal Answer:**
- ✅ Order creation returns stable `order_id` (e.g., "ORG123456")
- ✅ All webhooks include this `order_id`
- ✅ Results API uses same `order_id`

**Why Critical:** Need to link Orange Health orders to your users

---

### 7️⃣ **REFUNDS: What's the cancellation and refund policy?**

**Your Use Case:** User books test → Changes mind → Wants refund

**Ask:**
> "If a user needs to cancel their order, what's your cancellation policy and refund timeline?"

**Ideal Answer:**
- ✅ "Full refund if cancelled >4 hours before appointment"
- ✅ "Automatic refund in 3-5 business days"
- ✅ "Cancel via API: `DELETE /v1/partner/order/{order_id}`"

**What You Need to Know:**
1. **Cancellation deadline** (how many hours before?)
2. **Refund percentage** by timeline
3. **Who initiates refund** (automatic or manual?)
4. **Refund processing time** (instant, 3 days, 7 days?)

**Your Implementation:**
```javascript
// Show to user before booking
"Cancel up to 4 hours before appointment for full refund"

// In app
if (hoursUntilAppointment > 4) {
  showButton("Cancel Order (Full Refund)");
} else {
  showMessage("Cannot cancel - appointment too soon");
}
```

**Why Critical:** Must communicate this clearly to users before booking

---

### 8️⃣ **SERVICEABILITY: Can we check if a location is serviceable before showing booking?**

**Your Use Case:** User at location X → Only show "Book Test" button if serviceable

**Ask:**
> "We've tested the serviceability API and it works. Should we check serviceability each time before showing booking options, or can we cache serviceable areas?"

**What You've Already Confirmed:**
- ✅ API works: `GET /v1/partner/serviceability?lat=12.93&lng=77.62&request_date=2025-10-10`
- ✅ Returns available slots

**What to Clarify:**
- "Can we cache serviceability per city/pincode?"
- "How often do serviceable areas change?"
- "Do you provide a list of serviceable pincodes/cities?"

**Your Implementation:**
```javascript
// Option 1: Check real-time (slower, always accurate)
const isServiceable = await checkOrangeHealthServiceability(user.location);

// Option 2: Check against cached list (faster, might be outdated)
const cachedServiceableAreas = ['Bengaluru', 'Delhi', 'Mumbai'];
const isServiceable = cachedServiceableAreas.includes(user.city);
```

**Why Critical:** Don't want to show booking to users in non-serviceable areas

---

### 9️⃣ **SAMPLE COLLECTION: What address details do you need?**

**Your Use Case:** User books test → Phlebotomist comes to their home

**Ask:**
> "For home sample collection, what address details are required in the order creation API? And do users need to be available at a specific time?"

**What You Need to Collect from User:**
```javascript
{
  address: {
    line1: "Flat 101, Building Name, Street",
    line2: "Landmark", // Required?
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560034",
    latitude: 12.93922,
    longitude: 77.62539
  }
}
```

**Questions:**
- "Is address line 2 (landmark) mandatory?"
- "Do you require exact GPS coordinates?"
- "Can users provide location via Google Maps integration?"
- "What if user is not home during slot?"

**Your Implementation:**
- Capture full address during booking
- Use Google Maps API for coordinates
- Send SMS reminder before appointment

**Why Critical:** Incomplete address = failed sample collection

---

### 🔟 **PRODUCTION TIMELINE: When can we go live?**

**Your Use Case:** Want to launch lab booking feature in your app

**Ask:**
> "What's the process and timeline to move from staging to production? What do we need to complete?"

**Ideal Answer:**
- ✅ "2-3 days after contract signature"
- ✅ Clear checklist: Contract → Test integration → Production keys → Launch

**Your Launch Checklist:**
1. ✅ Contract signed
2. ✅ Integration tested in staging
3. ✅ Production API key received
4. ✅ Production webhook URL registered
5. ✅ Initial test orders verified
6. ✅ Go live!

**Questions:**
- "What documents do you need from us?"
- "Is there a minimum volume commitment?"
- "Can we do a soft launch (limited users first)?"
- "Do you provide support during launch week?"

**Your Timeline:**
```
Week 1: Contract + Development start
Week 2: Staging integration complete
Week 3: Production setup + Testing
Week 4: Soft launch (100 users)
Week 5: Full launch
```

**Why Critical:** Need to plan development timeline and launch date

---

---

## 📋 QUICK CHECKLIST - Track During Call

### Critical Answers Received:
- [ ] Test catalog endpoint/file
- [ ] Test search or biomarker mapping
- [ ] Results format (JSON or PDF)
- [ ] Webhook events list
- [ ] Payment flow clarified
- [ ] Order ID format confirmed
- [ ] Cancellation policy clear
- [ ] Address requirements known
- [ ] Production timeline defined

### Documents to Request:
- [ ] Complete API documentation
- [ ] Sample test catalog (JSON/Excel)
- [ ] Webhook payload examples
- [ ] Sample result response (JSON if available)
- [ ] Partnership contract template
- [ ] Technical support contact info

---

## 💡 YOUR SPECIFIC USE CASES - Quick Reference

### Use Case 1: Insight → Action
```
User sees: "Your Vitamin D is low (18 ng/mL)"
You show: "Book Vitamin D Test - ₹800" [Button]
User clicks → Booking flow
```
**Needs:** Question 1, 2, 5

### Use Case 2: Auto-Import Results
```
User books test → Sample collected → Results ready
Your system: Auto-imports → Generates new insights → Notifies user
```
**Needs:** Question 3, 4, 6

### Use Case 3: Real-Time Tracking
```
User sees: "Phlebotomist John (★4.8) is 10 min away"
Updates in real-time via webhooks
```
**Needs:** Question 4

### Use Case 4: Seamless Experience
```
User journey: Insight → Book → Pay → Track → Results → New Insight
All in your app, no external redirects
```
**Needs:** All 10 questions answered

---

## 🎯 SUCCESS = Getting Clear Answers to All 10

**Green Light (Proceed):**
- ✅ 8+ questions answered satisfactorily
- ✅ Structured result data available (Q3)
- ✅ Webhooks supported (Q4)
- ✅ Clear production timeline (Q10)

**Yellow Light (Proceed with Caution):**
- ⚠️ 6-7 questions answered
- ⚠️ PDF-only results (need OCR)
- ⚠️ Some manual processes required

**Red Light (Reconsider):**
- ❌ <6 questions answered clearly
- ❌ No webhooks (polling only)
- ❌ No API documentation available
- ❌ Unclear pricing or business terms

---

## 📞 DURING THE CALL - USE THIS SCRIPT

**Opening:** 
> "Thanks for the call! We're excited about this partnership. We've tested your serviceability API and it's working great. We have 10 critical questions to ensure smooth integration. Shall we dive in?"

**For Each Question:**
1. Ask the question (use exact wording above)
2. Listen to their answer
3. Check if it matches "Ideal Answer"
4. Ask 1-2 follow-up questions
5. Take detailed notes
6. Move to next question

**Closing:**
> "Great! To summarize, can you send us: [List documents needed]? And what's our next step for production access?"

---

## 📝 AFTER THE CALL - IMMEDIATE ACTIONS

1. **Score Answers:**
   - Count how many got ✅ ideal answers
   - Note any ❌ concerning answers

2. **Share with Team:**
   - Forward answers document
   - Highlight any blockers
   - Propose next steps

3. **Follow-up Email:**
   ```
   Subject: Orange Health Integration - Next Steps
   
   Hi [Name],
   
   Thanks for today's call! Here's what we discussed:
   
   ✅ Confirmed: [List what's clear]
   📋 Requested: [List documents needed]
   ⏭️ Next Steps: [List action items]
   ⏰ Timeline: [Production timeline]
   
   Looking forward to [next milestone].
   
   Best regards,
   [Your name]
   ```

4. **Decision Time:**
   - Review answers with technical team
   - Use scoring to make Go/No-Go decision
   - If GO → Schedule kickoff meeting next week

---

**Print this page and keep it handy during the call!** 📄

**Remember:** You're not just asking questions - you're building a partnership. Be friendly, curious, and collaborative! 🤝

---

**Full Details Available In:**
- `ORANGE_HEALTH_QA_GUIDE.md` - All 35+ questions with detailed answers
- `ORANGE_HEALTH_API_ASSESSMENT.md` - Complete technical analysis
- `ORANGE_HEALTH_INTEGRATION_ARCHITECTURE.md` - How to build it

**Good luck! 🚀**

