# Notion SOP & Knowledge Base Reader

## PURPOSE
Access ESA's Notion workspace to read SOPs, documentation, and company knowledge so Victoria can provide accurate process guidance to the team.

## ACCESS LEVEL
**READ-ONLY** - Victoria reads documentation to answer team questions accurately.

## WHAT VICTORIA ACCESSES
- **SOPs**: Standard Operating Procedures for all departments
- **Process Documentation**: Step-by-step guides for client delivery
- **Company Policies**: HR policies, communication standards, escalation procedures
- **Training Materials**: Onboarding docs, role-specific guides
- **Templates**: Client communication templates, report formats

## USE CASES
1. **Team asks process question** → Victoria checks Notion SOPs → Provides accurate answer with source link
2. **New team member onboarding** → Victoria references Notion training docs → Guides them through procedures
3. **Process audit** → Victoria cross-references Notion SOPs with actual team behavior → Identifies gaps
4. **Knowledge gaps** → When Notion doesn't have an SOP for something → Victoria flags it for documentation

## ENV VARIABLES REQUIRED
```
NOTION_TOKEN - Internal integration token (read-only)
NOTION_SOP_DATABASE_ID - Main SOP database ID
```

## INTEGRATION NOTES
- Share relevant Notion pages/databases with the integration after creating it
- Integration only sees pages explicitly shared with it
- No write access needed - Victoria references but doesn't modify SOPs
- When citing SOPs, include the Notion page link for team members to verify
