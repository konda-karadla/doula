# Email Notifications - Setup Guide

**Feature:** Email notifications for user engagement  
**Cost:** FREE (using Gmail SMTP)  
**Status:** ✅ Implemented  
**Date:** October 10, 2025

---

## 🎯 What's Built

### Email Types
1. **Welcome Email** - Sent when user registers
2. **Lab Ready Email** - Sent when lab processing completes
3. **Insight Ready Email** - Sent when new insights generated
4. **Action Due Email** - Sent when action items are due

### Features
- ✅ Beautiful HTML templates
- ✅ Responsive design
- ✅ Personalized content
- ✅ Click-through links to dashboard
- ✅ Error handling (won't break app if email fails)

---

## ⚙️ Configuration (3 Steps)

### Step 1: Create Gmail App Password (2 minutes)

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in to your Gmail account
3. Create new app password:
   - App name: "Health Platform"
   - Click "Create"
4. Copy the 16-character password

### Step 2: Update .env File (1 minute)

Add these to your `backend/.env`:

```env
# Email Configuration (Gmail SMTP - FREE)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=Health Platform <your-email@gmail.com>

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3001
```

**Example:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=healthplatform@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=Health Platform <healthplatform@gmail.com>
FRONTEND_URL=http://localhost:3001
```

### Step 3: Restart Backend (30 seconds)

```bash
cd backend
npm run start:dev
```

That's it! ✅ Emails will now send automatically.

---

## 🧪 Testing (5 Minutes)

### Test 1: Welcome Email

```bash
# Register a new user (use your real email to receive it)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@gmail.com",
    "username": "testuser",
    "password": "password123",
    "systemSlug": "doula"
  }'

# Check your email inbox for welcome message!
```

**Expected:** Welcome email with "Welcome to Health Platform! 🎉"

---

### Test 2: Lab Ready Email

```bash
# Upload a lab result (you'll need an auth token)
# After OCR processing completes, you'll receive an email
```

**Expected:** "Lab Results Ready 🧪" email when processing finishes

---

### Test 3: Check Logs

```bash
# In backend console, you should see:
✅ Email sent to user@example.com: Welcome to Health Platform! 🎉
✅ Email sent to user@example.com: Your Lab Results Are Ready 🧪
```

---

## 📧 Email Templates

### 1. Welcome Email
- **Subject:** Welcome to Health Platform! 🎉
- **Content:**
  - Greeting with username
  - List of features
  - "Go to Dashboard" button
  - Support contact

### 2. Lab Ready Email  
- **Subject:** Your Lab Results Are Ready 🧪
- **Content:**
  - Notification that processing is complete
  - List of what's new (biomarkers, insights, trends)
  - "View Lab Results" button (direct link)
  - Help info

### 3. Insight Ready Email
- **Subject:** You Have X New Health Insights 💡
- **Content:**
  - Number of new insights
  - What insights include
  - "View Insights" button
  - Explanation

### 4. Action Due Email
- **Subject:** Action Items Due Soon: [Plan Name] 📋
- **Content:**
  - Action plan name
  - Number of due items
  - Why it matters
  - "View Action Plan" button
  - Motivation

---

## 🔧 Troubleshooting

### Issue 1: Emails Not Sending

**Check .env variables:**
```bash
# Make sure these are set
echo $EMAIL_USER
echo $EMAIL_PASSWORD
```

**Check logs:**
```bash
# Look for error messages in backend console
❌ Failed to send email to...: [error message]
```

**Common fixes:**
- Verify Gmail app password is correct (16 chars, no spaces)
- Check if "Less secure app access" is enabled (if using old Gmail)
- Try generating new app password

---

### Issue 2: Emails Go to Spam

**Solution:**
- Use proper FROM address
- Don't send too many emails quickly
- Later: Use SPF/DKIM records (for production)

---

### Issue 3: Gmail Limit Reached (500/day)

**Solution:**
- Switch to SendGrid free tier (100/day)
- Or use mailgun (5,000/month free for 3 months)
- Or use AWS SES ($0.10 per 1,000)

---

## 🚀 Alternative SMTP Providers

### SendGrid (if you want to switch)

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=Health Platform <noreply@yourdomain.com>
```

### Mailgun

```env
EMAIL_HOST=smtp.mailgun.org  
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-smtp-password
EMAIL_FROM=Health Platform <noreply@yourdomain.com>
```

### AWS SES

```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-smtp-username
EMAIL_PASSWORD=your-smtp-password
EMAIL_FROM=Health Platform <noreply@yourdomain.com>
```

**Just change .env, no code changes needed!** ✅

---

## 📊 Email Events

| Event | Trigger | Email Sent |
|-------|---------|------------|
| **User Registration** | New user signs up | Welcome Email |
| **Lab Processing Complete** | OCR finishes | Lab Ready Email |
| **Insights Generated** | AI creates insights | Insight Email (future) |
| **Action Item Due** | Task due date approaches | Reminder Email (future) |

---

## 🎨 Email Design

All emails have:
- ✅ Gradient header with emoji
- ✅ White content box
- ✅ Clear call-to-action button
- ✅ Footer with unsubscribe info (future)
- ✅ Responsive design (mobile-friendly)
- ✅ Brand colors

---

## 🔐 Security Notes

1. **Never commit .env file** (already in .gitignore)
2. **Use app passwords**, not real Gmail password
3. **Emails are sent async** (won't slow down API)
4. **Failures are logged**, not thrown (won't break app)

---

## 📈 Monitoring (Future)

Track:
- Email delivery rate
- Open rate
- Click-through rate
- Bounce rate

**Tools:**
- SendGrid Analytics (when you switch)
- Postmark Analytics
- AWS SES Metrics

---

## ✅ Success Checklist

- [x] Nodemailer installed
- [x] Email service created
- [x] 4 email templates built
- [x] Welcome email integrated with registration
- [x] Lab-ready email integrated with OCR
- [x] Backend builds successfully
- [ ] .env configured with Gmail credentials
- [ ] Test email received

---

## 🚀 Next Steps

1. **Configure .env** - Add your Gmail credentials
2. **Restart backend** - Load new config
3. **Test registration** - Should receive welcome email
4. **Upload lab result** - Should receive lab-ready email
5. **Monitor logs** - Check for email sending confirmations

---

**Status:** ✅ Code Complete - Ready for Configuration  
**Time Taken:** ~2 hours  
**Cost:** FREE ✅

---

**To start using:** Just add Gmail credentials to .env and restart backend!

