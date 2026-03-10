# 🎯 GET EVENTBRITE API TOKEN - 5 MINUTE SETUP

## Step 1: Create Eventbrite Account
- Go to: https://www.eventbrite.com/account/signup/
- Use your ESA email: brian@eventsalesagency.com

## Step 2: Create API App
1. **Go to:** https://www.eventbrite.com/platform/api/
2. **Click:** "Create App"
3. **Fill out:**
   - App Name: `ESA Event Hunter`
   - Description: `Event discovery for Event Sales Agency`
   - App URL: `https://eventsalesagency.com`

## Step 3: Generate Token
1. **Select:** "Private Token"
2. **Copy the token** (looks like: `ABC123DEF456...`)

## Step 4: Configure System
1. **Edit `.env` file**
2. **Replace:** `your_eventbrite_token_here`
3. **With:** Your actual token
4. **Save file**

## Step 5: Deploy Real System
```bash
python3 deploy_real_hunter.py
```

## ✅ Done!
- System will find REAL events
- With REAL contact information
- No more fake data
- Ready to contact prospects

---
**CRITICAL:** This gives access to real events with organizer emails, phone numbers, and websites. These are actual prospects you can contact immediately.