# Atoms Agent Scripts

Duplicate the Calendar Receptionist agent—workflow, voice, prompt, and all particulars—so anyone who clones the repo gets an identical agent.

## For repo owners (you)

### 1. Find your agent ID (if needed)

```bash
npm run list-atoms-agents
```

Lists your agents and their IDs. Use the one that matches your Calendar Receptionist.

### 2. Export your full agent config

```bash
npm run export-atoms
# Or with a specific agent ID: node scripts/export-atoms-workflow.js <agentId>
```

This fetches your agent (voice, prompt, settings) and workflow, saves to `atoms-agent-config.json`, and replaces webhook URLs with `{{WEBHOOK_BASE_URL}}`.

**Prerequisites:** `server/.env` with `SMALLEST_API_KEY` and `SMALLEST_RECEPTIONIST_AGENT_ID`

### 3. Commit the config

```bash
git add atoms-agent-config.json
git commit -m "Add Atoms agent config for duplication"
git push
```

If export fails (e.g. agent not found via API), the repo includes a default `atoms-agent-config.json` so setup still works.

---

## For anyone who clones the repo

### 1. Set up environment

```bash
cd server && cp .env.example .env
# Edit .env with your SMALLEST_API_KEY, GCP credentials, etc.
```

### 2. Run ngrok (get your webhook URL)

```bash
ngrok http 4000
# Copy your URL, e.g. https://abc123.ngrok-free.dev
```

### 3. Duplicate the agent

```bash
npm run setup-atoms -- https://your-ngrok.ngrok-free.dev
```

Or set `PUBLIC_WEBHOOK_BASE_URL` in `server/.env` and run:

```bash
npm run setup-atoms
```

This creates a new agent with the same workflow, voice, prompt, and API config—only the webhook URL is yours.

### 4. Add the new agent ID

The script outputs the new agent ID. Add it to `client/.env`:

```
VITE_SMALLEST_ASSISTANT_ID=<the-new-agent-id>
```

And to `server/.env`:

```
SMALLEST_RECEPTIONIST_AGENT_ID=<the-new-agent-id>
```

### 5. Run the app

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

---

## What gets duplicated

| From export | Applied on setup |
|------------|------------------|
| Agent name, description | ✓ |
| Global prompt | ✓ |
| Voice (synthesizer) | ✓ |
| Workflow (nodes, API calls) | ✓ |
| API URLs | Replaced with your `{{WEBHOOK_BASE_URL}}` |

---

## Notes

- Each person needs their own Smallest.ai account and API key
- If your agent ID returns 404, run `npm run list-atoms-agents` to find the correct ID
- The default `atoms-agent-config.json` works even if export hasn't been run
