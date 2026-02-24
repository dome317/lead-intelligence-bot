# Webhook Integration Guide

This guide explains how to connect lead-intelligence-bot to your automation platform.

## Webhook Payload

When a lead is qualified, the bot sends a POST request with this JSON payload:

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "goal": "Automate our sales pipeline",
  "obstacle": "Current process is manual and slow",
  "readiness": "Looking to implement within 2 months",
  "score": 8,
  "score_label": "HOT",
  "conversation_summary": "Interested in sales automation for a 20-person team...",
  "timestamp": "2025-01-15T14:30:00.000Z",
  "source": "lead-intelligence-bot"
}
```

## Setup with Make.com

1. Create a new Scenario in Make.com
2. Add a **Webhook** trigger module → "Custom webhook"
3. Copy the webhook URL
4. Add it to your `.env.local`:
   ```
   MAKE_WEBHOOK_URL=https://hook.eu2.make.com/your-webhook-id
   ```
5. Add downstream modules:
   - **Router** — Split by `score_label`
   - **Slack** — Send notification for HOT leads
   - **HubSpot** — Create/update contact

### Example Make.com Flow

```
Webhook → Router
  ├── HOT (score >= 8) → Slack Alert + HubSpot Contact + Calendar Booking
  ├── WARM (score 5-7) → HubSpot Contact + Email Nurture
  └── COLD (score < 5) → HubSpot Contact (low priority)
```

## Setup with n8n

1. Import the workflow from `n8n/lead-workflow.json`
2. Configure your credentials:
   - Slack webhook URL
   - HubSpot API key
3. Activate the workflow
4. Copy the webhook URL from the trigger node
5. Add it to your `.env.local`:
   ```
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/lead
   ```

### n8n Workflow Nodes

The included workflow (`n8n/lead-workflow.json`) contains:

| Node | Purpose |
|------|---------|
| Lead Webhook | Receives lead data via POST |
| HOT/WARM Filter | Routes leads by score (>= 7) |
| Slack Notification | Sends formatted alert to Slack |
| HubSpot Contact | Creates CRM contact |
| Response | Confirms receipt |

## Setup with Zapier

1. Create a new Zap
2. Trigger: **Webhooks by Zapier** → "Catch Hook"
3. Copy the webhook URL
4. Add it as `MAKE_WEBHOOK_URL` in `.env.local` (the bot uses the same env var)
5. Add actions:
   - **Filter** — Only continue if `score >= 7`
   - **Slack** — Send channel message
   - **HubSpot** — Create contact

## Field Mapping for CRM

| Bot Field | HubSpot Property | Salesforce Field |
|-----------|-----------------|------------------|
| `name` | `firstname` | `FirstName` |
| `email` | `email` | `Email` |
| `score` | `lead_score` (custom) | `Rating` |
| `score_label` | `lead_status` (custom) | `Status` |
| `goal` | `notes_last_contacted` | `Description` |
| `conversation_summary` | `description` | `Description` |

## Testing

Send a test webhook locally:

```bash
curl -X POST http://localhost:3000/api/extract-lead \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "assistant", "content": "Hi! What brings you here today?"},
      {"role": "user", "content": "We need to automate our sales process"},
      {"role": "assistant", "content": "What is your team size?"},
      {"role": "user", "content": "About 20 people. Budget is around 50k."}
    ]
  }'
```
