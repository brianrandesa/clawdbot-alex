# 🚀 SIMPLE AGENT DEPLOYMENT

## The Script Editor Issue
When you double-clicked the `.command` file, it opened in Script Editor instead of running in Terminal. This is a common Mac issue.

## 📋 EASY FIX - Copy/Paste This Command:

Open Terminal and paste this:

```bash
cd /Users/henry/.openclaw/workspace/agent-army && ./working_deploy.sh
```

## 🎯 What This Will Do:

**Deploy 7 core ESA agents:**
- 🐺 **Rex** - Sales Manager  
- 📈 **Marketing Director** - Ads & campaigns
- ⚙️ **Operations Director** - Process optimization
- 🤝 **Client Success Manager** - Customer relationships  
- 💰 **Finance Director** - Financial tracking
- ✍️ **Content Creator** - Copy & content
- 📊 **Data Analyst** - Performance analytics

## 🔧 After Deployment:

**Check your agents:**
```bash
openclaw sessions list
```

**Talk to Rex:**
```bash
openclaw sessions send --label "Rex Sales Manager" --message "What's the current pipeline status?"
```

**Talk to Marketing Director:**
```bash
openclaw sessions send --label "Marketing Director" --message "What's our current ROAS and how can we improve it?"
```

## 💡 Why Start Small:

Instead of trying to deploy 22 agents at once (which was causing failures), we're starting with the **7 most critical agents** that will immediately impact your business.

Once these are stable, we can add more specialized agents.

## 🎉 Ready?

**Copy this command and paste it in Terminal:**

```bash
cd /Users/henry/.openclaw/workspace/agent-army && ./working_deploy.sh
```