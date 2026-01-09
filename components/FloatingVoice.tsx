'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Hume
const VoiceWidget = dynamic(
  () => import('./VoiceWidget').then(mod => ({ default: mod.VoiceWidget })),
  {
    ssr: false,
    loading: () => (
      <div className="w-16 h-16 rounded-full bg-slate-700 animate-pulse" />
    )
  }
);

export function FloatingVoice() {
  const configId = process.env.NEXT_PUBLIC_HUME_CONFIG_ID;

  // Don't render if Hume isn't configured
  if (!configId) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <div className="relative">
        {/* Label */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-1 rounded-full">
            Ask about insurance
          </span>
        </div>
        <VoiceWidget />
      </div>
    </div>
  );
}
