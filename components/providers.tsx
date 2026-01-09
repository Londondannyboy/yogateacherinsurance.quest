'use client';

import { CopilotKit } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import { NeonAuthUIProvider } from '@neondatabase/auth/react/ui';
import { authClient } from '@/lib/auth/client';
import '@copilotkit/react-ui/styles.css';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NeonAuthUIProvider
      authClient={authClient as any}
      redirectTo="/"
      social={{ providers: ['google'] }}
    >
      <CopilotKit runtimeUrl="/api/copilotkit" agent="yoga_agent">
        <CopilotSidebar
          labels={{
            title: "Insurance Advisor",
            initial: "Hi! I'm your yoga teacher insurance advisor. I can help you understand what coverage you need, compare UK providers, and explain different insurance types.\n\nWhat would you like to know about yoga teacher insurance?",
          }}
          defaultOpen={false}
        >
          {children}
        </CopilotSidebar>
      </CopilotKit>
    </NeonAuthUIProvider>
  );
}
