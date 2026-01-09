# Yoga Teacher Insurance Quest - Development Guide

## Project Overview

**Site:** yogateacherinsurance.quest
**Status:** Existing Next.js 15 site with SEO pages, ready for AI agent integration
**SEO Win:** Page 1 UK for "aerial yoga teacher insurance" (long tail keyword)

## Tech Stack (Current)
- Next.js 15 with App Router
- React 19
- Tailwind CSS 4
- @neondatabase/serverless (already installed)
- TypeScript

## Tech Stack (To Add - In Order)
1. **CopilotKit + Pydantic AI** - Chat agent with tools
2. **Neon Auth** - User authentication
3. **Hume EVI** - Conversational voice agent

---

## Implementation Order (Critical!)

**Build CopilotKit + Pydantic AI FIRST. Add Neon Auth SECOND. Add Hume voice LAST.**

This order is proven from copilotkit-demo, esportsjobs.quest-v2, and gtm-quest-v2.

| Phase | What | Why First |
|-------|------|-----------|
| 1 | CopilotKit + Pydantic AI | Establishes "the brain" - all tools, DB access, business logic |
| 2 | Neon Auth | Adds user identity layer that agent can use |
| 3 | Hume Voice | Voice is just I/O - needs the brain to already exist |

---

## Phase 1: CopilotKit + Pydantic AI

### Packages to Install (Frontend)
```bash
npm install @copilotkit/react-core @copilotkit/react-ui
```

### Agent Setup (Create /agent folder)
```
yogateacherinsurance.quest/
├── agent/
│   ├── src/
│   │   └── agent.py          # Pydantic AI agent
│   ├── pyproject.toml        # Python dependencies
│   └── Procfile              # Railway deployment
├── app/                      # Existing Next.js app
└── ...
```

### Agent Dependencies (pyproject.toml)
```toml
[project]
name = "yoga-insurance-agent"
version = "0.1.0"
requires-python = ">=3.11"

dependencies = [
    "uvicorn",
    "fastapi",
    "starlette",
    "pydantic-ai-slim[ag-ui]",
    "pydantic-ai-slim[google]",
    "python-dotenv",
    "psycopg2-binary",
    "httpx",
]
```

### Basic Agent Pattern
```python
from pydantic_ai import Agent, RunContext
from pydantic_ai.ag_ui import StateDeps
from pydantic_ai.models.google import GoogleModel
from pydantic import BaseModel, Field

class AppState(BaseModel):
    quotes: list[dict] = Field(default_factory=list)
    user: Optional[dict] = None

agent = Agent(
    model=GoogleModel("gemini-2.0-flash"),
    deps_type=StateDeps[AppState],
    system_prompt="""You are a helpful insurance advisor for yoga teachers in the UK.
    You help users understand their insurance needs and compare quotes."""
)

@agent.tool
def get_insurance_quote(ctx: RunContext[StateDeps[AppState]], coverage_type: str) -> dict:
    """Get an insurance quote for yoga teachers."""
    # Business logic here
    return {"quote": {...}}

# Export as AG-UI app for CopilotKit
from fastapi import FastAPI
main_app = FastAPI()
ag_ui_app = agent.to_ag_ui(deps=StateDeps(AppState()))
main_app.mount("/", ag_ui_app)
app = main_app
```

### Frontend CopilotKit Setup
```tsx
// app/providers.tsx
'use client';
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="yoga_agent">
      <CopilotSidebar>
        {children}
      </CopilotSidebar>
    </CopilotKit>
  );
}
```

### API Route for CopilotKit
```typescript
// app/api/copilotkit/route.ts
import { NextRequest } from "next/server";
import { CopilotRuntime, ExperimentalEmptyAdapter } from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";

const runtime = new CopilotRuntime({
  agents: {
    yoga_agent: new HttpAgent({
      url: process.env.AGENT_URL || "http://localhost:8000/"
    }),
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilotkit",
  });
  return handleRequest(req);
};
```

---

## Phase 2: Neon Auth

### Packages to Install
```bash
npm install @neondatabase/auth
```

### Auth File Structure
```
app/
├── lib/auth/
│   ├── client.ts       # Client-side auth
│   └── server.ts       # Server-side auth
├── api/auth/[...path]/
│   └── route.ts        # Auth API handler
└── auth/[path]/
    └── page.tsx        # Auth UI pages
```

### Client Auth Setup
```typescript
// app/lib/auth/client.ts
'use client';
import { createAuthClient } from '@neondatabase/auth/next';
export const authClient = createAuthClient();
```

### Server Auth Setup
```typescript
// app/lib/auth/server.ts
'use server';
import { createAuthServer } from '@neondatabase/auth/next/server';
export const authServer = createAuthServer();
```

### Auth API Handler
```typescript
// app/api/auth/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  if (!process.env.NEON_AUTH_BASE_URL) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 503 });
  }
  const { authApiHandler } = await import('@neondatabase/auth/next/server');
  const handlers = authApiHandler();
  return handlers.GET(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  if (!process.env.NEON_AUTH_BASE_URL) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 503 });
  }
  const { authApiHandler } = await import('@neondatabase/auth/next/server');
  const handlers = authApiHandler();
  return handlers.POST(request, context);
}
```

### Auth Pages
```typescript
// app/auth/[path]/page.tsx
import { AuthView } from '@neondatabase/auth/react/ui';

export function generateStaticParams() {
  return [
    { path: 'sign-in' },
    { path: 'sign-up' },
    { path: 'sign-out' },
    { path: 'forgot-password' },
    { path: 'reset-password' },
    { path: 'verify-email' },
  ];
}

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthView path={path} />
      </div>
    </main>
  );
}
```

### Using Auth in Components
```typescript
'use client';
import { authClient } from "@/app/lib/auth/client";
import { UserButton, SignedIn, SignedOut } from "@neondatabase/auth/react/ui";

export default function Header() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  return (
    <header>
      <SignedIn>
        <span>Welcome, {user?.name}</span>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <a href="/auth/sign-in">Sign In</a>
      </SignedOut>
    </header>
  );
}
```

---

## Phase 3: Hume Conversational Agent

### Packages to Install
```bash
npm install @humeai/voice-react
```

### Hume Token Endpoint
```typescript
// app/api/hume-token/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = await fetch('https://api.hume.ai/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(
        `${process.env.HUME_API_KEY}:${process.env.HUME_SECRET_KEY}`
      ).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return NextResponse.json({ accessToken: data.access_token });
}
```

### Voice Widget Component
```tsx
// components/VoiceWidget.tsx
'use client';
import { VoiceProvider, useVoice } from '@humeai/voice-react';
import { useState, useEffect } from 'react';

export function VoiceWidget() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/hume-token', { method: 'POST' })
      .then(res => res.json())
      .then(data => setAccessToken(data.accessToken));
  }, []);

  if (!accessToken) return <div>Loading voice...</div>;

  return (
    <VoiceProvider
      configId={process.env.NEXT_PUBLIC_HUME_CONFIG_ID!}
      accessToken={accessToken}
    >
      <VoiceButton />
    </VoiceProvider>
  );
}

function VoiceButton() {
  const { connect, disconnect, isConnected } = useVoice();

  return (
    <button onClick={isConnected ? disconnect : connect}>
      {isConnected ? 'End Call' : 'Talk to Agent'}
    </button>
  );
}
```

### CLM Endpoint (Add to agent.py)
```python
# Add to agent/src/agent.py for Hume to use same brain

@main_app.post("/chat/completions")
async def clm_endpoint(request: Request):
    """OpenAI-compatible endpoint for Hume EVI."""
    body = await request.json()
    messages = body.get("messages", [])
    user_msg = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")

    # Call agent and get response
    response_text = await get_agent_response(user_msg)

    # Return SSE stream (required by Hume)
    return StreamingResponse(
        stream_sse_response(response_text),
        media_type="text/event-stream"
    )

async def stream_sse_response(content: str):
    """Stream OpenAI-compatible SSE chunks for Hume."""
    words = content.split(' ')
    for word in words:
        chunk = {"choices": [{"delta": {"content": word + ' '}}]}
        yield f"data: {json.dumps(chunk)}\n\n"
    yield "data: [DONE]\n\n"
```

---

## Environment Variables

### Required for Phase 1
```env
DATABASE_URL=postgresql://...@neon.tech/neondb
GOOGLE_API_KEY=...  # For Gemini model
AGENT_URL=http://localhost:8000  # Local dev, Railway URL in prod
```

### Required for Phase 2
```env
NEON_AUTH_BASE_URL=https://your-project.neon.tech
```

### Required for Phase 3
```env
HUME_API_KEY=...
HUME_SECRET_KEY=...
NEXT_PUBLIC_HUME_CONFIG_ID=...
```

---

## Railway Deployment (Agent)

### Procfile
```
web: uvicorn src.agent:app --host 0.0.0.0 --port $PORT
```

### Deploy Steps
1. Create Railway project
2. Link to GitHub repo `/agent` subdirectory
3. Set environment variables (DATABASE_URL, GOOGLE_API_KEY)
4. Deploy
5. Get public URL
6. Update frontend AGENT_URL

---

## Database Schema

### User Profile Items (for personalization)
```sql
CREATE TABLE user_profile_items (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_type TEXT NOT NULL,  -- 'coverage_type', 'yoga_style', 'location'
  value TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, value)
);

CREATE INDEX idx_user_profile_items_user_id ON user_profile_items(user_id);
```

### Insurance Quotes (optional)
```sql
CREATE TABLE insurance_quotes (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  coverage_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  annual_premium DECIMAL(10,2),
  coverage_amount DECIMAL(12,2),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Agent Tools to Build

### Core Insurance Tools
1. `get_insurance_quote(coverage_type, yoga_style)` - Get quotes from providers
2. `compare_providers(coverage_type)` - Compare multiple insurance providers
3. `explain_coverage(coverage_type)` - Explain what different coverages mean
4. `check_requirements(yoga_style)` - What insurance is legally required

### User Profile Tools
5. `save_user_preference(item_type, value)` - Save user preferences
6. `get_user_profile()` - Get saved user info

### Content Tools
7. `get_article(topic)` - Fetch relevant articles from site
8. `get_faq(topic)` - Get FAQ answers

---

## SEO Pages (Existing)
- `/` - Homepage
- `/aerial-yoga-insurance` - Aerial yoga specific (ranking!)
- `/hot-yoga-insurance`
- `/pilates-instructor-insurance`
- `/yoga-teacher-liability-insurance`
- `/trainee-yoga-teacher-insurance`
- `/group-fitness-instructor-insurance`
- `/best-yoga-teacher-insurance-uk`
- `/compare-yoga-teacher-insurance-uk`
- And more...

---

## Key Patterns from Other Projects

### Passing User Context to Agent
When Neon Auth is added, sync user to agent via instructions prop:

```typescript
const agentInstructions = user
  ? `USER CONTEXT:
- Name: ${user.name}
- Email: ${user.email}
- Yoga Style: ${profileItems.yoga_style || 'Not set'}
- Current Coverage: ${profileItems.coverage || 'None'}

Help this user find the right insurance for their yoga teaching practice.`
  : undefined;

<CopilotSidebar instructions={agentInstructions}>
```

### Generative UI for Quotes
```typescript
useRenderToolCall({
  name: "get_insurance_quote",
  render: ({ result, status }) => {
    if (status !== "complete") return <QuoteLoading />;
    return <QuoteCard quote={result} />;
  },
}, []);
```

---

## Reference Projects
- **copilotkit-demo** - Full CopilotKit + Pydantic AI + Hume integration
- **esportsjobs.quest-v2** - Neon Auth patterns
- **gtm-quest-v2** - Latest @neondatabase/neon-js patterns
- **hume-neon-voice** - Hume + Neon integration

---

## Commands

### Development
```bash
# Frontend
npm run dev

# Agent (in separate terminal)
cd agent && uv run uvicorn src.agent:app --reload --port 8000
```

### Build
```bash
npm run build
```

### Deploy
```bash
# Frontend deploys to Vercel automatically via GitHub
# Agent deploys to Railway
cd agent && railway up
```
