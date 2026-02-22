# Security Best Practices

## Current Setup (Safe)

**What we're using:**
- Local Node.js scripts (your Mac)
- Gmail (henrythesalesguy@gmail.com) - has 2FA
- Google Sheets API (service account)
- ClickUp API (your account)
- Brave Search API (read-only)

**Security measures in place:**
✅ Gmail 2-step verification enabled
✅ App passwords (revokable)
✅ Service account for Sheets (isolated permissions)
✅ All scripts run locally (no cloud servers)
✅ API keys stored in .env file (not committed to git)

**Risk level:** LOW
- No credit card exposed to automation
- No cloud servers running 24/7
- You control all API access (can revoke anytime)

---

## If We Add AWS (Future)

### Required Before Launching ANYTHING

1. **Enable MFA on Root Account**
   - Go to IAM → Root user → Enable MFA
   - Use authenticator app (Authy, Google Authenticator)
   - NEVER use root account for daily work

2. **Create IAM User for Henry**
   - Separate user with minimal permissions
   - Only give access to what's needed
   - Enable MFA on this user too

3. **Set Up Billing Alarms**
   ```
   Alarms at:
   - $10 (warning)
   - $50 (investigate)
   - $100 (kill switch)
   ```
   - Email you immediately
   - Auto-stop services if hit threshold

4. **Budget Limits**
   - Set monthly budget cap
   - AWS will alert before you hit it
   - Configure auto-shutdown rules

5. **Cost Explorer**
   - Check daily for first week
   - Then weekly
   - Look for unexpected spikes

### Safe AWS Services (If Needed)

**Low risk:**
- Lambda (serverless functions, pay per use)
- S3 (storage, cheap)
- SES (email sending, pennies)

**High risk (avoid until experienced):**
- EC2 (can rack up bills if left running)
- RDS (databases, expensive if misconfigured)
- GPU instances ($$$ per hour)

### Kill Switch Plan

If something goes wrong:
1. Revoke IAM credentials immediately
2. Stop all EC2 instances
3. Delete CloudFormation stacks
4. Contact AWS support (they can freeze billing)

---

## Other Services (If We Add)

### Twilio (SMS/Calling)
- Set spending limits in dashboard
- Start with $20 cap
- Enable fraud alerts
- Review usage weekly

### Stripe (Payments)
- Use test mode until ready
- Enable 2FA
- Set up webhooks for failed payments
- Never store card details directly

### OpenAI API
- Set monthly spending limits
- Start with $50 cap
- Monitor token usage
- Use GPT-3.5 before GPT-4 (cheaper)

---

## General Rules

1. **Never commit API keys to git**
   - Use .env files
   - Add .env to .gitignore
   - Rotate keys monthly

2. **Use read-only access when possible**
   - Brave Search: read-only ✅
   - Google Sheets: write access only where needed

3. **Monitor everything**
   - Check logs weekly
   - Review API usage monthly
   - Audit permissions quarterly

4. **Principle of least privilege**
   - Only give the minimum access needed
   - Revoke immediately when done
   - Don't leave test accounts active

5. **Backup everything**
   - Export data monthly
   - Keep offline copies
   - Test restore procedures

---

## Red Flags to Watch For

⚠️ **Unexpected charges** - Check immediately
⚠️ **API rate limit hits** - Someone might be abusing your keys
⚠️ **Failed login attempts** - Potential breach
⚠️ **New devices accessing accounts** - Review and revoke if unknown
⚠️ **Emails/SMS you didn't send** - Kill API access NOW

---

## Current API Keys & Access

**Where they're stored:**
- `/Users/jedidiahenderson/.openclaw/workspace/.env`
- Not in git
- Only on your Mac

**Active keys:**
1. Gmail app password (chmhamwlufyjgtly)
2. ClickUp API (pk_26239420...)
3. Brave Search (BSAWQ3...)
4. Google Sheets service account (JSON file)

**How to revoke:**
- Gmail: Delete app password in Google account settings
- ClickUp: Regenerate API token in settings
- Brave: Delete key in dashboard
- Sheets: Delete service account in Google Cloud

---

## Emergency Contacts

If something goes wrong:
1. Revoke all API keys immediately
2. Change passwords
3. Review recent activity logs
4. Contact service support if needed

**You're the kill switch.** If I ever do something weird, revoke access and I'm instantly locked out.
