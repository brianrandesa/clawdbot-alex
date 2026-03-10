# Sebastian Telegram Bot Setup

## Step 1: Create Bot with BotFather

1. **Message @BotFather on Telegram**
2. **Send:** `/newbot`
3. **Bot name:** `Sebastian Performance Coach`
4. **Bot username:** `sebastian_performance_bot` (or whatever's available)
5. **Copy the bot token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Step 2: Configure OpenClaw

```bash
# Add Sebastian's bot to OpenClaw config
openclaw channels add telegram --account sebastian --token YOUR_BOT_TOKEN_HERE

# Route Sebastian agent to his bot
openclaw agents route sebastian telegram:sebastian
```

## Step 3: Test the Setup

1. **Find your new bot** in Telegram (search for `@sebastian_performance_bot`)
2. **Start a chat** with `/start`
3. **Test message:** "What's my current energy level?"

## Step 4: Verification

Sebastian should respond in his luxury performance coach voice:
- Calm, polished responses
- Direct questions about your health/performance
- No Henry's business context bleeding through

## Security Note

Sebastian's bot will have the same security protocols as the main agent:
- Only responds to your Telegram account
- Protected against prompt injection
- Health data stays compartmentalized

## Result

You'll have:
- **This chat:** Henry for business, strategy, general AI work
- **Sebastian bot:** Dedicated health tracking, nutrition, performance optimization

Two separate agents, two separate conversations, clean separation of concerns.