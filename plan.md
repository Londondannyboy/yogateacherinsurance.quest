# Yoga Teacher Insurance Quest - Implementation Plan

## Project Goal
Add AI-powered insurance advisor to yogateacherinsurance.quest using:
- CopilotKit + Pydantic AI (chat agent)
- Neon Auth (user management)
- Hume EVI (voice agent on Railway)

---

## Phase 1: CopilotKit + Pydantic AI

**Goal:** Get chat working with an AI agent that can answer insurance questions

### Step 1.1: Install Frontend Dependencies
```bash
npm install @copilotkit/react-core @copilotkit/react-ui @ag-ui/client
```
- [ ] Run npm install
- [ ] Verify no peer dependency issues

### Step 1.2: Create Agent Folder Structure
```bash
mkdir -p agent/src
```
- [ ] Create `agent/` directory
- [ ] Create `agent/src/` directory
- [ ] Create `agent/pyproject.toml`
- [ ] Create `agent/src/agent.py`
- [ ] Create `agent/Procfile`

### Step 1.3: Build Basic Agent
- [ ] Define AppState model (quotes, user)
- [ ] Create Agent with Google Gemini model
- [ ] Write system prompt for insurance advisor
- [ ] Add `get_insurance_info` tool (static info first)
- [ ] Export as AG-UI app
- [ ] Test locally: `cd agent && uv run uvicorn src.agent:app --port 8000`

### Step 1.4: Add CopilotKit to Frontend
- [ ] Create `app/providers.tsx` with CopilotKit wrapper
- [ ] Update `app/layout.tsx` to use Providers
- [ ] Create `app/api/copilotkit/route.ts`
- [ ] Add CopilotSidebar to layout
- [ ] Test chat works locally

### Step 1.5: Add Agent Tools
- [ ] `explain_coverage(coverage_type)` - Explain insurance types
- [ ] `compare_providers()` - Compare UK yoga insurance providers
- [ ] `get_requirements(yoga_style)` - Legal requirements by yoga type
- [ ] `search_articles(topic)` - Search site content

### Step 1.6: Add Generative UI
- [ ] Create `components/QuoteCard.tsx`
- [ ] Create `components/ProviderComparison.tsx`
- [ ] Add `useRenderToolCall` hooks for each tool
- [ ] Test tool results render correctly

### Step 1.7: Deploy Agent to Railway
- [ ] Create Railway project
- [ ] Link to GitHub `/agent` subdirectory
- [ ] Set environment variables:
  - `DATABASE_URL`
  - `GOOGLE_API_KEY`
- [ ] Deploy
- [ ] Get public URL
- [ ] Update frontend `.env` with `AGENT_URL`
- [ ] Test production chat works

**Phase 1 Complete Checkpoint:**
- [ ] Chat works in production
- [ ] Agent answers insurance questions
- [ ] Tools execute and return data
- [ ] Generative UI renders results

---

## Phase 2: Neon Auth

**Goal:** Add user authentication so agent can personalize responses

### Step 2.1: Enable Neon Auth in Console
- [ ] Go to Neon Console
- [ ] Enable Auth for project
- [ ] Get `NEON_AUTH_BASE_URL`
- [ ] Add to `.env.local`

### Step 2.2: Install Auth Package
```bash
npm install @neondatabase/auth
```
- [ ] Run npm install

### Step 2.3: Create Auth Files
- [ ] Create `app/lib/auth/client.ts`
- [ ] Create `app/lib/auth/server.ts`
- [ ] Create `app/api/auth/[...path]/route.ts`
- [ ] Create `app/auth/[path]/page.tsx`

### Step 2.4: Add Auth UI Components
- [ ] Add SignIn/SignOut links to header
- [ ] Add UserButton component
- [ ] Style auth pages to match site design

### Step 2.5: Create User Profile Table
```sql
CREATE TABLE user_profile_items (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  value TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, value)
);
```
- [ ] Run SQL in Neon Console
- [ ] Create API route `app/api/user-profile/route.ts`

### Step 2.6: Pass User Context to Agent
- [ ] Fetch user profile items on page load
- [ ] Build `agentInstructions` string with user context
- [ ] Pass to CopilotSidebar `instructions` prop
- [ ] Add middleware to agent.py to extract user from instructions

### Step 2.7: Add Profile-Aware Tools
- [ ] `save_user_preference(type, value)` - Save to Neon
- [ ] `get_user_profile()` - Get user's saved info
- [ ] Update other tools to use user context

**Phase 2 Complete Checkpoint:**
- [ ] Users can sign in/sign up
- [ ] Agent knows user's name
- [ ] Agent can save/retrieve user preferences
- [ ] Personalized responses based on saved info

---

## Phase 3: Hume Conversational Agent

**Goal:** Add voice interface that uses the same agent brain

### Step 3.1: Create Hume Account
- [ ] Sign up at platform.hume.ai
- [ ] Create new EVI config
- [ ] Note Config ID
- [ ] Get API keys

### Step 3.2: Install Hume Package
```bash
npm install @humeai/voice-react
```
- [ ] Run npm install

### Step 3.3: Add Hume Token Endpoint
- [ ] Create `app/api/hume-token/route.ts`
- [ ] Add `HUME_API_KEY` and `HUME_SECRET_KEY` to `.env`
- [ ] Test token endpoint returns access token

### Step 3.4: Create Voice Widget
- [ ] Create `components/VoiceWidget.tsx`
- [ ] Add VoiceProvider with configId
- [ ] Add connect/disconnect button
- [ ] Style to match site design

### Step 3.5: Add CLM Endpoint to Agent
- [ ] Add `/chat/completions` endpoint to agent.py
- [ ] Implement SSE streaming response (required by Hume)
- [ ] Route to same agent logic as AG-UI
- [ ] Deploy updated agent to Railway

### Step 3.6: Configure Hume Dashboard
- [ ] Set CLM URL to Railway agent `/chat/completions`
- [ ] Enable "CLM-only mode" (disable Hume's built-in LLM)
- [ ] Configure voice settings (speed, tone)
- [ ] Add `NEXT_PUBLIC_HUME_CONFIG_ID` to frontend `.env`

### Step 3.7: Integrate Voice with Chat
- [ ] When voice message received, also add to CopilotKit chat
- [ ] Sync state between voice and chat
- [ ] Add visual indicator when voice is active

### Step 3.8: Add Session Management
- [ ] Use stable session IDs based on user ID
- [ ] Prevent re-greeting on reconnect
- [ ] Track `greetedThisSession` state

**Phase 3 Complete Checkpoint:**
- [ ] Voice connects successfully
- [ ] Agent responds via voice
- [ ] Same brain for voice and chat
- [ ] Voice knows user context (if logged in)

---

## Phase 4: Polish & Optimization

### Step 4.1: UI/UX Improvements
- [ ] Add loading states for all async operations
- [ ] Add error handling and user-friendly messages
- [ ] Optimize sidebar for mobile
- [ ] Add chat history persistence

### Step 4.2: SEO Preservation
- [ ] Ensure chat doesn't interfere with SEO content
- [ ] Keep existing page rankings
- [ ] Add structured data for FAQ content

### Step 4.3: Analytics
- [ ] Track chat interactions
- [ ] Track voice usage
- [ ] Track conversion (quote requests)

### Step 4.4: Content Integration
- [ ] Agent can reference existing site articles
- [ ] Agent can link to relevant pages
- [ ] Agent recommends content based on questions

---

## Environment Variables Summary

### Development (.env.local)
```env
# Database
DATABASE_URL=postgresql://...

# Agent (local)
AGENT_URL=http://localhost:8000

# Google AI
GOOGLE_API_KEY=...

# Neon Auth (Phase 2)
NEON_AUTH_BASE_URL=https://...

# Hume (Phase 3)
HUME_API_KEY=...
HUME_SECRET_KEY=...
NEXT_PUBLIC_HUME_CONFIG_ID=...
```

### Production
```env
# Database
DATABASE_URL=postgresql://...

# Agent (Railway)
AGENT_URL=https://yoga-agent-production.up.railway.app

# Google AI
GOOGLE_API_KEY=...

# Neon Auth
NEON_AUTH_BASE_URL=https://...

# Hume
HUME_API_KEY=...
HUME_SECRET_KEY=...
NEXT_PUBLIC_HUME_CONFIG_ID=...
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────┐                    ┌──────────────┐      │
│   │   VERCEL     │                    │   RAILWAY    │      │
│   │  (Next.js)   │                    │  (Python)    │      │
│   │              │                    │              │      │
│   │ yogateacher  │ ─── AG-UI ──────► │  Pydantic    │      │
│   │ insurance    │                    │  AI Agent    │      │
│   │ .quest       │                    │              │      │
│   │              │                    │ • Tools      │      │
│   │ • Frontend   │                    │ • DB Access  │      │
│   │ • CopilotKit │                    │ • CLM        │      │
│   │ • Neon Auth  │                    │              │      │
│   └──────────────┘                    └──────────────┘      │
│          │                                   ▲              │
│          │                                   │              │
│          ▼                                   │              │
│   ┌──────────────┐                           │              │
│   │   HUME AI    │ ──── /chat/completions ───┘              │
│   │   (Voice)    │                                          │
│   └──────────────┘                                          │
│                                                              │
│   ┌──────────────┐                                          │
│   │    NEON      │ ◄─────────────────────────────────────── │
│   │  (Database)  │   Both Vercel & Railway connect          │
│   └──────────────┘                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Agent responses too slow | Poor UX | Use Gemini Flash, optimize prompts |
| Voice quality issues | User frustration | Test extensively, have fallback to chat |
| SEO ranking loss | Traffic drop | Don't modify existing page structure |
| Auth integration complex | Delays | Follow proven patterns from esportsjobs |

---

## Success Metrics

### Phase 1
- Chat response time < 3 seconds
- Agent can answer 80% of common insurance questions
- Zero errors in production logs

### Phase 2
- User signup flow works end-to-end
- Agent uses user name in responses
- Preferences persist across sessions

### Phase 3
- Voice connects within 2 seconds
- Voice and chat give identical answers
- No duplicate greetings on reconnect

### Overall
- User engagement increases (time on site)
- Quote requests increase
- Support email volume decreases

---

## Reference Implementation
See `/Users/dankeegan/copilotkit-demo/` for working patterns of:
- CopilotKit + Pydantic AI integration
- Neon Auth setup
- Hume voice integration
- User context passing to agent
- Generative UI with useRenderToolCall

---

## Quick Start (First Session)

1. Install dependencies:
```bash
npm install @copilotkit/react-core @copilotkit/react-ui @ag-ui/client
```

2. Create agent folder:
```bash
mkdir -p agent/src
```

3. Copy starter files from copilotkit-demo or use patterns in claude.md

4. Run locally:
```bash
# Terminal 1
npm run dev

# Terminal 2
cd agent && uv run uvicorn src.agent:app --reload --port 8000
```

5. Test chat at http://localhost:3000
