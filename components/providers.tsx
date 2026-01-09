'use client';

import { useEffect } from 'react';
import { CopilotKit, useCoAgent } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import { NeonAuthUIProvider } from '@neondatabase/auth/react/ui';
import { authClient } from '@/lib/auth/client';
import '@copilotkit/react-ui/styles.css';

// Agent state type - must match the Pydantic model in agent.py
type UserProfile = {
  id: string | null;
  name: string | null;
  firstName: string | null;
  email: string | null;
};

type AgentState = {
  user: UserProfile | null;
  yoga_styles: string[];
  teaching_locations: string[];
  student_count: string | null;
  has_existing_insurance: boolean;
};

// Component that syncs user state to agent
function UserStateSync() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const { setState } = useCoAgent<AgentState>({
    name: "yoga_agent",
    initialState: {
      user: null,
      yoga_styles: [],
      teaching_locations: [],
      student_count: null,
      has_existing_insurance: false,
    },
  });

  // Sync user data to agent state when user changes
  useEffect(() => {
    if (user) {
      const firstName = user.name?.split(' ')[0] || null;
      setState((prev): AgentState => ({
        user: {
          id: user.id,
          name: user.name || null,
          firstName,
          email: user.email || null,
        },
        yoga_styles: prev?.yoga_styles ?? [],
        teaching_locations: prev?.teaching_locations ?? [],
        student_count: prev?.student_count ?? null,
        has_existing_insurance: prev?.has_existing_insurance ?? false,
      }));
    } else {
      setState((prev): AgentState => ({
        user: null,
        yoga_styles: prev?.yoga_styles ?? [],
        teaching_locations: prev?.teaching_locations ?? [],
        student_count: prev?.student_count ?? null,
        has_existing_insurance: prev?.has_existing_insurance ?? false,
      }));
    }
  }, [user, setState]);

  return null;
}

function CopilotWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const firstName = user?.name?.split(' ')[0] || null;

  // Build personalized instructions for the agent
  const instructions = user
    ? `## USER CONTEXT
- Name: ${user.name}
- First Name: ${firstName}
- Email: ${user.email}
- User ID: ${user.id}

IMPORTANT: Address the user by their first name (${firstName}) in your responses.
When they ask "what's my name" or "who am I", tell them their name.
Personalize your insurance recommendations based on their profile.`
    : `## GUEST USER
This user is not logged in. They can still browse insurance information, but encourage them to sign in for personalized recommendations and to save their preferences.`;

  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="yoga_agent">
      <UserStateSync />
      <CopilotSidebar
        labels={{
          title: "Insurance Advisor",
          initial: user
            ? `Hi ${firstName}! I'm your yoga teacher insurance advisor. I can help you understand what coverage you need, compare UK providers, and explain different insurance types.\n\nWhat would you like to know about yoga teacher insurance?`
            : "Hi! I'm your yoga teacher insurance advisor. I can help you understand what coverage you need, compare UK providers, and explain different insurance types.\n\nWhat would you like to know about yoga teacher insurance?",
        }}
        defaultOpen={false}
        instructions={instructions}
      >
        {children}
      </CopilotSidebar>
    </CopilotKit>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NeonAuthUIProvider
      authClient={authClient as any}
      redirectTo="/"
      social={{ providers: ['google'] }}
    >
      <CopilotWrapper>{children}</CopilotWrapper>
    </NeonAuthUIProvider>
  );
}
