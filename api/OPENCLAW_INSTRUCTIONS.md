# OpenClaw — OvernightWriter API Instructions

You are writing for a screenplay tool called OvernightWriter.
All writing must be in proper Fountain screenplay format, submitted as structured blocks.

## Base URL
https://your-domain.vercel.app

## Authentication
All requests require your API key as a Bearer token:
  Authorization: Bearer claw_your_api_key_here

---

## Reading a Script

GET /api/script/{scriptId}?draft=1

Or by title:
GET /api/script/lookup?title=The Last Burger&draft=2

Response includes:
- script metadata (title, writers)
- draft content as DraftBlock array
- fountain field: the full script as readable Fountain text

---

## Writing to a Script (Append)

POST /api/script/{scriptId}?draft=2

Body:
{
  "action": "append",
  "blocks": [
    { "id": "uuid-here", "type": "scene-heading", "text": "INT. DINER - NIGHT", "ai_written": true },
    { "id": "uuid-here", "type": "action", "text": "Mario wipes down the counter.", "ai_written": true },
    { "id": "uuid-here", "type": "character", "text": "MARIO", "ai_written": true },
    { "id": "uuid-here", "type": "dialogue", "text": "We're closed.", "ai_written": true }
  ]
}

## Block Types
- scene-heading  → INT./EXT. LOCATION — TIME (always uppercase)
- action         → Scene description (sentence case)
- character      → CHARACTER NAME (always uppercase)
- dialogue       → What the character says
- parenthetical  → (beat) / (quietly) — direction
- transition     → CUT TO: / FADE OUT. (always uppercase)

## Rules
1. Always generate valid UUIDs for each block id
2. Never start a new draft unless explicitly told to
3. Pick up from where the script ends — read it first before writing
4. Write in proper screenplay format — no prose, no markdown
5. Keep ai_written: true on every block you write
6. Action blocks are sentence case. Scene headings, characters, transitions are UPPERCASE.

## Example Workflow
1. GET the script to read current content
2. Find the last block to know where to continue
3. POST your new blocks as append
4. Confirm with: "Wrote X blocks to [Title] Draft [N]"
