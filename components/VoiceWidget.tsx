'use client';

import { useState, useCallback } from 'react';
import { VoiceProvider, useVoice } from '@humeai/voice-react';

function VoiceButton() {
  const { connect, disconnect, status } = useVoice();
  const [isPending, setIsPending] = useState(false);

  const handleToggle = useCallback(async () => {
    if (status.value === 'connected') {
      disconnect();
    } else {
      setIsPending(true);
      try {
        // Fetch access token
        const res = await fetch('/api/hume-token', { method: 'POST' });
        const { accessToken } = await res.json();

        const configId = process.env.NEXT_PUBLIC_HUME_CONFIG_ID;
        if (!configId) {
          console.error('NEXT_PUBLIC_HUME_CONFIG_ID not set');
          return;
        }

        // Build system prompt for yoga insurance advisor
        const systemPrompt = `## YOUR ROLE
You are the VOICE INTERFACE for a yoga teacher insurance comparison website.
Your job is to have natural conversations and help users find the right insurance.

## YOUR EXPERTISE
- UK yoga teacher insurance requirements
- Public liability vs professional indemnity insurance
- Specialist coverage for aerial yoga, hot yoga, prenatal yoga
- Comparing providers like Balens, BGI, Insure4Sport
- What coverage amounts are needed (typically £1m-£5m)

## CONVERSATION STYLE
- Be warm and supportive - yoga teachers are often anxious about insurance
- Explain insurance terms simply, avoid jargon
- Ask clarifying questions: what yoga styles they teach, where they teach
- Give specific recommendations based on their situation
- Keep responses concise for voice - 2-3 sentences max

## KEY FACTS TO SHARE
- Most venues REQUIRE public liability insurance before you can teach
- Professional indemnity covers teaching-related claims
- Aerial and hot yoga need SPECIALIST cover - not all policies include it
- Typical costs: £50-150/year depending on coverage level
`;

        await connect({
          auth: { type: 'accessToken', value: accessToken },
          configId: configId,
          sessionSettings: {
            type: 'session_settings',
            systemPrompt: systemPrompt,
          }
        });
      } catch (e) {
        console.error('Voice connect error:', e);
      } finally {
        setIsPending(false);
      }
    }
  }, [connect, disconnect, status.value]);

  const isConnected = status.value === 'connected';

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`
          relative w-16 h-16 rounded-full flex items-center justify-center
          transition-all duration-300 shadow-lg
          ${isConnected
            ? 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
            : isPending
              ? 'bg-gradient-to-br from-yellow-500 to-amber-600 animate-pulse'
              : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          }
        `}
      >
        {isConnected ? (
          <div className="flex items-center gap-1">
            <span className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-6 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-5 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            <span className="w-1 h-7 bg-white rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
            <span className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
          </div>
        ) : isPending ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}

        {isConnected && (
          <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-20" />
        )}
      </button>

      <span className="text-sm text-slate-400">
        {isConnected ? 'Tap to end' : isPending ? 'Connecting...' : 'Tap to talk'}
      </span>
    </div>
  );
}

export function VoiceWidget() {
  return (
    <VoiceProvider
      onError={(err) => console.error('Hume error:', err)}
    >
      <VoiceButton />
    </VoiceProvider>
  );
}
