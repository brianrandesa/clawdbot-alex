# ESA Studio Full Profile Flow – Victoria

When the team asks for a **full profile** or **custom site** in ESA Studio (e.g. "Build Javi a site", "Create full profile for [Client Name]"):

1. **Create the client**  
   POST to `https://esa-studio.vercel.app/api/create-client`  
   Body (JSON): `{ "name": "[Client Name]", "event_name": "[Event or same as name]", "knowledge_base": "[what you know]", "avatar": "[target audience]" }`  
   → Response: `{ "clientId": "uuid" }`

2. **Run full profile**  
   POST to `https://esa-studio.vercel.app/api/full-profile`  
   Body (JSON): `{ "clientId": "[clientId from step 1]" }`  
   → Response: `{ "clientId", "status": "ready", "message", "landingUrl?" }`

3. **Reply in Slack**  
   "Done. **[Client Name]** is ready in ESA Studio. [Open ESA Studio](https://esa-studio.vercel.app). Select the client to see the full funnel, landing, ads, email, and SMS."

If ESA Studio uses a different base URL, use that URL in both POSTs and the message link.
