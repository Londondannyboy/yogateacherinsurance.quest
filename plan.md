# Yoga Teacher Insurance Quest - Implementation Plan

## Project Goal
Add AI-powered insurance advisor to yogateacherinsurance.quest using:
- CopilotKit + Pydantic AI (chat agent)
- Neon Auth (user management)
- Hume EVI (voice agent)
- Zep (memory persistence)

---

## Implementation Progress (Updated January 2025)

### Phase 1: CopilotKit + Pydantic AI - COMPLETE

| Task | Status | Notes |
|------|--------|-------|
| Install frontend deps | Done | @copilotkit/react-core, @copilotkit/react-ui, @ag-ui/client |
| Create agent folder | Done | /agent/src/agent.py |
| Build basic agent | Done | 6 tools, Gemini 2.0 Flash model |
| Add CopilotKit to frontend | Done | providers.tsx with CopilotSidebar |
| Create API route | Done | /api/copilotkit/route.ts |
| Deploy to Railway | Done | yoga-insurance-agent-production.up.railway.app |

**Agent Tools Implemented:**
- `compare_providers(yoga_style)` - Compare UK providers
- `explain_coverage(coverage_type)` - Explain coverage types
- `get_style_requirements(yoga_style)` - Style-specific requirements
- `get_provider_info(provider_name)` - Provider details
- `get_quick_quote_checklist()` - Quote preparation
- `get_my_profile()` - User profile retrieval

### Phase 2: Neon Auth - COMPLETE

| Task | Status | Notes |
|------|--------|-------|
| Enable Neon Auth | Done | NEON_AUTH_BASE_URL configured |
| Install @neondatabase/auth | Done | Required --legacy-peer-deps |
| Create auth files | Done | lib/auth/client.ts, lib/auth/server.ts |
| Auth API handler | Done | /api/auth/[...path]/route.ts |
| Auth pages | Done | /auth/sign-in, sign-up, etc. |
| UserButton in nav | Done | With size="icon" prop |
| Profile page | Done | /profile with yoga styles, locations |

**Issues Fixed:**
- Peer dependency conflict with Next.js 16 requirement
- TypeScript errors with authClient prop (cast as any)
- UserButton size prop warning

### Phase 3: Hume Voice - COMPLETE (with issues)

| Task | Status | Notes |
|------|--------|-------|
| Install @humeai/voice-react | Done | |
| Token endpoint | Done | Fixed URL to oauth2-cc/token |
| Voice widget | Done | HeroVoice.tsx with pulsating orb |
| User context in prompt | Done | Passes name, email to system prompt |
| Add to hero section | Done | Centered below hero text |

**Issues:**
- Voice orb click not responding (needs debugging)
- CLM endpoint not yet implemented (Hume uses its own LLM)

### Phase 4: Zep Memory - PARTIAL

| Task | Status | Notes |
|------|--------|-------|
| Install @getzep/zep-cloud | Done | |
| Create API route | Done | /api/zep/route.ts |
| Profile saves to Zep | Done | On save, adds facts to graph |
| Configure ZEP_API_KEY | Pending | Need to add to Vercel |

---

## Known Issues & Debugging

### 1. CopilotKit Sidebar Not Clicking
**Symptoms:** Clicking the chat icon does nothing
**Possible Causes:**
- JavaScript error preventing event handlers
- z-index conflict (CSS override added)
- useCoAgent hook was causing errors (removed)

**Debug Steps:**
1. Open browser console, look for errors
2. Check Network tab for failed requests to /api/copilotkit
3. Verify AGENT_URL env var is set correctly

### 2. Voice Orb Not Clicking
**Symptoms:** Clicking voice orb does nothing
**Possible Causes:**
- NEXT_PUBLIC_HUME_CONFIG_ID not set
- Token endpoint returning error
- VoiceProvider not initialized properly

**Debug Steps:**
1. Check browser console for errors
2. Check Network tab for /api/hume-token requests
3. Verify Hume env vars are set

### 3. Agent Doesn't Know User Name
**Symptoms:** Agent says "Hi" but doesn't use user's name when asked
**Possible Causes:**
- instructions prop not reaching agent
- @agent.instructions decorator not working
- State not being synced via useCoAgent (was removed)

**Debug Steps:**
1. Check agent logs on Railway for received instructions
2. Test with curl directly to agent endpoint
3. Re-add useCoAgent for proper state sync

---

## Environment Variables Checklist

### Vercel
- [x] DATABASE_URL
- [x] NEON_AUTH_BASE_URL
- [x] HUME_API_KEY
- [x] HUME_SECRET_KEY
- [x] NEXT_PUBLIC_HUME_CONFIG_ID (8e6530df-c020-4b82-bfd3-62617a100b17)
- [ ] ZEP_API_KEY (needs to be added)
- [ ] AGENT_URL (verify set to Railway URL)

### Railway
- [x] DATABASE_URL
- [x] GOOGLE_API_KEY

---

## Architecture Diagram

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
│   │              │                    │ • 6 Tools    │      │
│   │ • Frontend   │                    │ • @agent.    │      │
│   │ • CopilotKit │                    │   instructions│     │
│   │ • Neon Auth  │                    │              │      │
│   │ • HeroVoice  │                    │              │      │
│   └──────────────┘                    └──────────────┘      │
│          │                                                   │
│          │                                                   │
│          ▼                                                   │
│   ┌──────────────┐         ┌──────────────┐                 │
│   │   HUME AI    │         │     ZEP      │                 │
│   │   (Voice)    │         │   (Memory)   │                 │
│   │              │         │              │                 │
│   │ Config:      │         │ User facts   │                 │
│   │ 8e6530df...  │         │ stored in    │                 │
│   └──────────────┘         │ knowledge    │                 │
│                            │ graph        │                 │
│   ┌──────────────┐         └──────────────┘                 │
│   │    NEON      │                                          │
│   │  (Database)  │                                          │
│   │              │                                          │
│   │ • Auth tables│                                          │
│   │ • User data  │                                          │
│   └──────────────┘                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Session Priorities

### Priority 1: Fix Click Issues
Debug why CopilotKit sidebar and voice orb don't respond to clicks.
- Check browser console for JS errors
- Verify all env vars are set
- Test with local dev server

### Priority 2: Configure Zep
Add ZEP_API_KEY to Vercel and test memory persistence.

### Priority 3: User Context
Ensure agent properly receives and uses user's name:
- Test instructions prop flow
- Consider re-adding useCoAgent with proper error handling
- Verify @agent.instructions decorator works

### Priority 4: CLM Endpoint
Add /chat/completions endpoint to agent so Hume uses same brain:
- OpenAI-compatible SSE streaming
- Route through same agent logic
- Configure in Hume dashboard

---

## Files Modified This Session

1. `components/providers.tsx` - Added then removed useCoAgent
2. `components/HeroVoice.tsx` - New voice orb component
3. `components/Navigation.tsx` - Profile link, UserButton size prop
4. `app/page.tsx` - Added HeroVoice to hero section
5. `app/profile/page.tsx` - New profile settings page
6. `app/api/zep/route.ts` - New Zep API route
7. `app/globals.css` - z-index overrides for CopilotKit
8. `agent/src/agent.py` - Added @agent.instructions, get_my_profile tool

---

## Reference
- See CLAUDE.md for detailed documentation
- copilotkit-demo project for working patterns
- Zep MCP server available for memory queries
