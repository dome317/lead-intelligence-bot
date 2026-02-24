# Lead Scoring System

## Overview

The lead scoring system uses Claude AI to analyze conversation transcripts and assign a score from 1-10 based on lead quality signals.

## How It Works

1. User chats with the AI agent
2. After sufficient qualifying data is collected (default: 8+ messages), the scoring engine triggers
3. Claude analyzes the full conversation and extracts structured lead data
4. A score is assigned based on weighted criteria
5. The lead is classified as HOT, WARM, or COLD

## Score Thresholds

| Label | Score Range | Meaning | Action |
|-------|-------------|---------|--------|
| **HOT** | 8-10 | High intent, ready to buy | Notify sales immediately |
| **WARM** | 5-7 | Interested, exploring options | Add to nurture sequence |
| **COLD** | 1-4 | Just browsing, no urgency | Log for future reference |

## Scoring Criteria

The AI evaluates these signals from the conversation:

### Budget Match (Weight: 3x)
- Has budget allocated: +3
- Budget range mentioned and fits: +2
- No budget discussed: +0

### Timeline Urgency (Weight: 2x)
- Needs solution within 1 month: +3
- Within 1-3 months: +2
- Within 6 months: +1
- No timeline: +0

### Pain Point Clarity (Weight: 2x)
- Specific, well-articulated problem: +3
- General dissatisfaction: +1
- No clear problem: +0

### Decision Authority (Weight: 2x)
- Is the decision maker: +3
- Is an influencer: +2
- Researching for someone else: +1
- Unknown: +0

### Team Size Fit (Weight: 1x)
- Matches target segment: +2
- Adjacent segment: +1
- Too small/large: +0

## Extracted Fields

The scoring engine extracts these fields from every conversation:

```typescript
interface LeadData {
  name: string | null;        // Contact name
  email: string | null;       // Contact email
  goal: string;               // What they want to achieve
  obstacle: string;           // What's blocking them
  readiness: string;          // How ready they are to act
  score: number;              // 1-10
  score_label: "HOT" | "WARM" | "COLD";
  conversation_summary: string; // 2-3 sentence summary
}
```

## Customization

### Changing Thresholds

Edit `config/scoring.json`:

```json
{
  "thresholds": {
    "hot": { "min_score": 8 },
    "warm": { "min_score": 5 },
    "cold": { "min_score": 1 }
  }
}
```

### Changing Weights

Adjust which signals matter most for your business:

```json
{
  "weights": {
    "budget_match": { "weight": 3 },
    "timeline_urgency": { "weight": 2 },
    "pain_point_clarity": { "weight": 2 },
    "decision_authority": { "weight": 2 },
    "team_size_fit": { "weight": 1 }
  }
}
```

### Changing the Extraction Prompt

Edit `src/lib/system-prompt.ts` — the `EXTRACT_LEAD_PROMPT` constant controls how Claude interprets conversation data. Modify the scoring rubric to match your qualification criteria.

## Dashboard

The dashboard at `/dashboard` shows:
- Total leads, broken down by HOT/WARM/COLD
- Average score
- Individual lead cards with summary and details
- Live notification feed
