# Alex - Gmail SMTP Configuration

## Email Account
- **Email:** alexeventsales@gmail.com
- **Account Password:** Alexeventsales2026 (for login)
- **App Password:** [PENDING - Need to generate after 2FA setup]

## SMTP Settings
- **Server:** smtp.gmail.com
- **Port:** 587 (TLS) or 465 (SSL)
- **Username:** alexeventsales@gmail.com
- **Password:** [APP_PASSWORD_HERE] (app password, no spaces)
- **Security:** TLS/STARTTLS

## Status
✅ 2-Step Verification: Enabled
⏳ App Password: Pending generation
⏳ SMTP Configuration: Waiting for app password

## Setup Steps
1. ✅ Created email account
2. ✅ Enabled 2-step verification
3. ⏳ Generate app password at: https://myaccount.google.com/apppasswords
4. ⏳ Enable IMAP access (for inbox monitoring)
5. ⏳ Update scripts with app password
6. ⏳ Test SMTP connection

## Test Command (after app password is ready)
```bash
# Test sending via Alex account
node alex-send-email.js
```

## Next Steps
1. Get app password from Google
2. Update all scripts with new credentials
3. Test send to internal email
4. Enable IMAP
5. Test inbox monitoring
6. Ready to launch outbound
