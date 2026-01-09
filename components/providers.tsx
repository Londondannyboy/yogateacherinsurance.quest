'use client';

import { useEffect } from 'react';
import { CopilotKit, useCoAgent } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import { NeonAuthUIProvider } from '@neondatabase/auth/react/ui';
import { authClient } from '@/lib/auth/client';
import '@copilotkit/react-ui/styles.css';

// Type matching the agent's AppState in agent.py
type AgentState = {
  user?: {
    id?: string;
    name?: string;
    firstName?: string;
    email?: string;
  };
  yoga_styles: string[];
  teaching_locations: string[];
  student_count?: string;
  has_existing_insurance: boolean;
};

// Component that syncs user state to agent
function UserStateSync() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const firstName = user?.name?.split(' ')[0] || undefined;

  const { setState } = useCoAgent<AgentState>({
    name: 'yoga_agent',
    initialState: {
      user: user ? {
        id: user.id,
        name: user.name || undefined,
        firstName: firstName,
        email: user.email || undefined,
      } : undefined,
      yoga_styles: [],
      teaching_locations: [],
      student_count: undefined,
      has_existing_insurance: false,
    },
  });

  // Update agent state when user session changes
  useEffect(() => {
    if (user) {
      setState({
        user: {
          id: user.id,
          name: user.name || undefined,
          firstName: firstName,
          email: user.email || undefined,
        },
        yoga_styles: [],
        teaching_locations: [],
        student_count: undefined,
        has_existing_insurance: false,
      });
    }
  }, [user?.id, user?.name, user?.email, firstName, setState]);

  return null;
}

function CopilotWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const firstName = user?.name?.split(' ')[0] || null;

  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="yoga_agent">
      {/* Sync user state to agent */}
      <UserStateSync />
      <CopilotSidebar
        labels={{
          title: "Insurance Advisor",
          initial: user
            ? `Hi ${firstName}! I'm your yoga teacher insurance advisor. I can help you understand what coverage you need, compare UK providers, and explain different insurance types.\n\nWhat would you like to know about yoga teacher insurance?`
            : "Hi! I'm your yoga teacher insurance advisor. I can help you understand what coverage you need, compare UK providers, and explain different insurance types.\n\nWhat would you like to know about yoga teacher insurance?",
        }}
        defaultOpen={false}
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
