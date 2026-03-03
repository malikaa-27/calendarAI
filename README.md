# Calendar Receptionist AI

An AI voice receptionist that schedules meetings via phone. Callers speak to an agent (powered by [Smallest.ai Atoms](https://smallest.ai)), which checks your Google Calendar availability and books meetings through this API.


## Prerequisites

- **Node.js 18+** and npm
- **Google Cloud** account (for Calendar API)
- **Smallest.ai** account (for Atoms voice agent)
- **ngrok** (free tier) for local development

**Quick path (Option A – duplicate the agent):** Clone → Install server + client → Google Cloud → Create `server/.env` → Run server + ngrok → Run `npm run setup-atoms -- <ngrok-url>` → Add agent ID to both `.env` files → Test. Skip Step 6.

---

## Step 1: Clone and Install

```bash
git clone https://github.com/malikaa-27/calendarAI.git
cd calendarAI
```

```bash
cd server && npm install
cd ../client && npm install
```

---

## Step 2: Google Cloud Setup

### 2.1 Create a Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. **APIs & Services** → **Enable APIs** → enable **Google Calendar API**
4. **APIs & Services** → **Credentials** → **Create Credentials** → **Service Account**
5. Name it (e.g. `calendar-receptionist`) and create
6. On the service account, go to **Keys** → **Add Key** → **Create new key** → **JSON**
7. Download the JSON file

### 2.2 Grant Calendar Access

**Option A – Same Google account as service account**

- Use the service account’s own calendar (less common)

**Option B – Impersonate a user (recommended)**

1. In Google Workspace Admin: **Security** → **Access and data control** → **API Controls**
2. Add the service account’s **Client ID** (from the JSON) and grant the scope:  
   `https://www.googleapis.com/auth/calendar`
3. In your `.env`, set `GCP_IMPERSONATE=true` and `GCP_SUBJECT_EMAIL` to the calendar owner’s email

### 2.3 Get Credentials for .env

From the downloaded JSON:

- `client_email` → `GCP_CLIENT_EMAIL`
- `private_key` → `GCP_PRIVATE_KEY` (keep the `\n` newlines as literal `\n` in .env)
- `project_id` → `GCP_PROJECT_ID`

---

## Step 3: Smallest.ai / Atoms Setup

**Option A – Duplicate the agent (recommended)**

1. Sign up at [Smallest.ai](https://smallest.ai) and get your **API Key**
2. Add `SMALLEST_API_KEY` to `server/.env` (Step 4)
3. **After Step 5** (once you have your ngrok URL), run:
   ```bash
   npm run setup-atoms -- https://YOUR-NGROK-URL
   ```
   Replace `https://YOUR-NGROK-URL` with your actual ngrok URL (e.g. `https://abc123.ngrok-free.app`).
4. The script outputs a new agent ID. Add it to both env files:
   - `server/.env`: `SMALLEST_RECEPTIONIST_AGENT_ID=<agent-id>`
   - `client/.env`: Create from `client/.env.example` and set `VITE_SMALLEST_ASSISTANT_ID=<agent-id>`
5. **Skip Step 6** – the workflow is already configured.

**Option B – Manual**

1. Sign up at [Smallest.ai](https://smallest.ai)
2. Create an **Atoms** agent (workflow or conversational)
3. Note your **Agent ID** and **API Key** for `.env`
4. Configure the API calls in Atoms (Step 6)

---

## Step 4: Server Environment Variables

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `SMALLEST_API_KEY` | Yes | Your Smallest.ai API key |
| `SMALLEST_API_BASE_URL` | Yes | `https://atoms-api.smallest.ai` |
| `SMALLEST_RECEPTIONIST_AGENT_ID` | Yes | Your Atoms agent ID |
| `GCP_CLIENT_EMAIL` | Yes | Service account email from JSON |
| `GCP_PRIVATE_KEY` | Yes | Private key from JSON (use `\n` for newlines) |
| `GCP_PROJECT_ID` | Yes | Google Cloud project ID |
| `GCP_SUBJECT_EMAIL` | Yes | Email of the calendar to use |
| `GCP_IMPERSONATE` | Optional | `true` if using domain-wide delegation |
| `SMTP_HOST` | Optional | e.g. `smtp.gmail.com` (for confirmation emails) |
| `SMTP_USER` | Optional | Your email |
| `SMTP_PASS` | Optional | App password (Gmail: use App Password) |
| `EMAIL_FROM` | Optional | e.g. `"Calendar Receptionist <you@gmail.com>"` |

**Client:** Create `client/.env` from the example and add your agent ID (from Step 3 Option A, or from Atoms if Option B):
```bash
cp client/.env.example client/.env
# Edit client/.env: VITE_SMALLEST_ASSISTANT_ID=<your-agent-id>
```

---

## Step 5: Run the Server and ngrok

### Terminal 1 – Server

```bash
cd server
npm run dev
```

You should see: `Server listening on port 4000`

### Terminal 2 – ngrok

```bash
ngrok http 4000
```

Copy the HTTPS URL (e.g. `https://abc123.ngrok-free.app`). This is your webhook base URL.

---

## Step 6: Configure Atoms Agent (Option B only)

**Skip this step if you used Option A.** The setup script already configured the workflow, APIs, and prompt.

If you created your agent manually (Option B), configure it in the [Smallest.ai Atoms](https://atoms.smallest.ai) dashboard as follows.

### 6.1 LLM Parameter (Required)

Add this parameter so the caller’s requested day/time is sent to the API:

| Parameter name | `day_time_mentioned_by_user` |
|----------------|------------------------------|
| Description | "The day and time the caller wants. Extract exactly what they said. Examples: today 2 pm, tomorrow, Friday 3 pm, next Monday, March 15, March 15 2026, March 15th next year, 12/25/2026. Any day - this week, next year, or specific date." |

### 6.2 API 1: getAvailableSlots

| Field | Value |
|-------|-------|
| **Name** | getAvailableSlots |
| **URL** | `https://YOUR-NGROK-URL/webhooks/check-availability` |
| **Method** | POST |
| **Headers** | `Content-Type: application/json`<br>`ngrok-skip-browser-warning: true` |
| **Body** | `{"proposedSlots":[],"targetDay":"{{day_time_mentioned_by_user}}"}` |
| **LLM Parameter** | `day_time_mentioned_by_user` (from 6.1) |
| **Timeout** | 10000 |

**Response Variable Extraction** (add exactly these):

| Variable | Path |
|----------|------|
| `available_summary` | `$.available_summary` |
| `selected_slot_start_iso` | `$.first_slot_start` |
| `selected_slot_end_iso` | `$.first_slot_end` |

**Important:** Do **not** add `$.available[0].start`, `$.available[0].end`, `$.formatted`, or `$.slots` – they cause errors. Use `$.first_slot_start` and `$.first_slot_end` only. Variable name must be exactly `selected_slot_end_iso` (no trailing space).

### 6.3 API 2: confirmMeeting

| Field | Value |
|-------|-------|
| **Name** | confirmMeeting |
| **URL** | `https://YOUR-NGROK-URL/webhooks/confirm-meeting` |
| **Method** | POST |
| **Headers** | `Content-Type: application/json`<br>`ngrok-skip-browser-warning: true` |
| **Body** | `{"start":"{{selected_slot_start_iso}}","end":"{{selected_slot_end_iso}}","clientEmail":"{{client_email}}","purpose":"{{meeting_purpose}}","attendeeName":"{{caller_name}}"}` |
| **Timeout** | 10000 |

**Response Variable Extraction:**

| Variable | Path |
|----------|------|
| `confirmation_message` | `$.confirmationMessage` |

Do **not** add `$.ok` or `$.event` – they fail on error responses.

### 6.4 Agent Prompt

In your agent’s system prompt, include logic that:

1. Asks for the caller’s preferred day/time
2. Calls **getAvailableSlots** with `{{day_time_mentioned_by_user}}`
3. Reads back times using `{{available_summary}}`
4. Collects name, email, and meeting purpose
5. Calls **confirmMeeting** with the selected slot
6. On success, says `{{confirmation_message}}`

Use the full prompt in `AGENT_PROMPT.txt` as a template. Customize the name (e.g. replace "Malikaa" with your name).

### 6.5 LLM Parameters for confirmMeeting

Ensure your agent extracts and passes:

- `client_email` – caller’s email
- `caller_name` – caller’s name
- `meeting_purpose` – purpose of the meeting

These are typically collected via conversation nodes and stored as variables.

---

## Step 7: Test

1. **Terminal 1:** `cd server && npm run dev`
2. **Terminal 2:** `ngrok http 4000`
3. **Terminal 3:** `cd client && npm run dev`
4. Open the client in your browser, or trigger a test call from the Atoms dashboard
5. Say you want to schedule a meeting (e.g. "I'd like to book for tomorrow at 2 pm")
6. Provide name, email, and purpose when asked
7. Confirm the booking

Check ngrok at `http://127.0.0.1:4040` to inspect requests and responses.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Not getting backend calendar info" | Verify ngrok URL is correct, `ngrok-skip-browser-warning: true` is set, and Response Variable Extraction is configured |
| "NoneType" or extraction errors | Remove `$.available[0].start`, `$.formatted`, `$.ok`, `$.event` – use only the paths in Step 6 |
| Wrong day/time offered | Ensure `day_time_mentioned_by_user` LLM parameter exists and is passed to getAvailableSlots |
| "Meeting end must be after start" | Check `selected_slot_end_iso` has no trailing space in the variable name |
| Emails not sent | Configure SMTP in `.env`; for Gmail use an [App Password](https://myaccount.google.com/apppasswords) |
| "Time range is too long" | Backend chunks freebusy queries automatically; restart the server |
| ngrok URL changed | Update both API URLs in Atoms |

---

## Project Structure

```
calendarAI/
├── client/                                   # React web app with Atoms widget
│   ├── src/App.tsx
│   └── .env                                  # VITE_SMALLEST_ASSISTANT_ID
├── server/
│   ├── src/
│   │   ├── controllers/webhookController.ts   # Availability & confirm-meeting logic
│   │   ├── services/googleCalendarService.ts # Calendar API
│   │   └── services/emailService.ts          # Confirmation emails
│   └── .env                                  # Your secrets (not in git)
├── scripts/                                  # Export, setup, list-agents (see scripts/README.md)
├── atoms-agent-config.json                   # Agent + workflow for duplication
├── AGENT_PROMPT.txt                          # Full prompt template (Option B)
├── ATOMS_CONFIG_NOW.txt                      # Quick reference for Atoms config
└── README.md                                 # This file
```

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/webhooks/check-availability` | POST | Get available slots for a given day |
| `/webhooks/confirm-meeting` | POST | Book a meeting and send confirmation |

See `server/docs/webhook_examples.md` for request/response examples.

---

## License

MIT
