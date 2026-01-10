'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth/client';

// Profile type (must match profile page)
type UserProfile = {
  yoga_styles: string[];
  teaching_locations: string[];
  student_count: string | null;
  experience_years: string | null;
  has_existing_insurance: boolean;
  qualifications: string[];
};

// Load profile from localStorage
function loadProfileFromStorage(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('yoga_teacher_profile');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading profile from localStorage:', e);
  }
  return null;
}

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const pathname = usePathname();

  // Get page context (same logic as providers.tsx)
  const getPageContext = (path: string): string => {
    if (path.includes('aerial')) return 'aerial-yoga-insurance';
    if (path.includes('hot-yoga')) return 'hot-yoga-insurance';
    if (path.includes('meditation')) return 'meditation-teacher-insurance';
    if (path.includes('studio')) return 'yoga-studio-insurance';
    if (path.includes('public-liability')) return 'public-liability-insurance';
    if (path.includes('profile') || path.includes('dashboard')) return 'user-profile';
    if (path.includes('pilates')) return 'pilates-instructor-insurance';
    if (path.includes('compare')) return 'compare-providers';
    if (path.includes('cost') || path.includes('how-much')) return 'insurance-costs';
    if (path.includes('articles')) return 'articles';
    return 'homepage';
  };

  const currentPage = getPageContext(pathname);
  const firstName = user?.name?.split(' ')[0] || null;

  // Load profile on mount and listen for updates
  useEffect(() => {
    setProfile(loadProfileFromStorage());

    const handleProfileUpdate = (e: CustomEvent<UserProfile>) => {
      setProfile(e.detail);
    };

    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
  }, []);

  // Log context changes
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] Page: ${currentPage}, User: ${firstName || 'Guest'}`;
    setLogs(prev => [...prev.slice(-19), logEntry]);

    // Also log to console for browser dev tools
    console.log('[Debug] Context:', {
      pathname,
      currentPage,
      user: user ? {
        id: user.id,
        name: user.name,
        firstName,
        email: user.email,
      } : null,
      profile,
      timestamp,
    });
  }, [pathname, currentPage, user, firstName, profile]);

  // Only show in development or if user adds ?debug to URL
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isDev = process.env.NODE_ENV === 'development';
    const hasDebugParam = urlParams.has('debug');
    setShowDebug(isDev || hasDebugParam);
  }, []);

  if (!showDebug) return null;

  return (
    <>
      {/* Debug Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-[9999] bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1.5 rounded-lg text-xs font-mono shadow-lg"
      >
        {isOpen ? 'Hide Debug' : 'Debug'}
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="fixed bottom-14 left-4 z-[9999] w-96 max-h-[70vh] bg-slate-900 border border-yellow-500/50 rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-yellow-500 text-black px-3 py-2 font-mono text-sm font-bold flex justify-between items-center">
            <span>Debug Panel (BETA)</span>
            <button onClick={() => setLogs([])} className="text-xs bg-black/20 px-2 py-0.5 rounded">
              Clear
            </button>
          </div>

          <div className="p-3 space-y-3 overflow-y-auto max-h-[60vh]">
            {/* Profile from localStorage */}
            <div className="bg-slate-800 rounded p-2">
              <h4 className="text-yellow-400 text-xs font-bold mb-1">Profile (localStorage)</h4>
              {profile ? (
                <div className="text-xs font-mono text-slate-300 space-y-1">
                  <div>
                    <span className="text-slate-500">Yoga Styles:</span>{' '}
                    <span className="text-green-400">
                      {profile.yoga_styles.length > 0 ? profile.yoga_styles.join(', ') : 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Locations:</span>{' '}
                    <span className="text-blue-400">
                      {profile.teaching_locations.length > 0 ? profile.teaching_locations.join(', ') : 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Experience:</span>{' '}
                    {profile.experience_years || 'Not set'}
                  </div>
                  <div>
                    <span className="text-slate-500">Students:</span>{' '}
                    {profile.student_count || 'Not set'}
                  </div>
                  <div>
                    <span className="text-slate-500">Has Insurance:</span>{' '}
                    <span className={profile.has_existing_insurance ? 'text-green-400' : 'text-red-400'}>
                      {profile.has_existing_insurance ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Qualifications:</span>{' '}
                    {profile.qualifications.length > 0 ? profile.qualifications.join(', ') : 'None'}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500">No profile saved yet</div>
              )}
            </div>

            {/* Current Context */}
            <div className="bg-slate-800 rounded p-2">
              <h4 className="text-yellow-400 text-xs font-bold mb-1">Current Context</h4>
              <div className="text-xs font-mono text-slate-300 space-y-1">
                <div><span className="text-slate-500">Page:</span> {currentPage}</div>
                <div><span className="text-slate-500">Path:</span> {pathname}</div>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-slate-800 rounded p-2">
              <h4 className="text-yellow-400 text-xs font-bold mb-1">User Context</h4>
              <div className="text-xs font-mono text-slate-300 space-y-1">
                {user ? (
                  <>
                    <div><span className="text-slate-500">ID:</span> {user.id.slice(0, 8)}...</div>
                    <div><span className="text-slate-500">Name:</span> {user.name}</div>
                    <div><span className="text-slate-500">Email:</span> {user.email}</div>
                  </>
                ) : (
                  <div className="text-slate-500">Not logged in</div>
                )}
              </div>
            </div>

            {/* Agent State (what CopilotKit sends) */}
            <div className="bg-slate-800 rounded p-2">
              <h4 className="text-yellow-400 text-xs font-bold mb-1">Agent State (Sent to LLM)</h4>
              <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap overflow-x-auto">
{JSON.stringify({
  user: user ? {
    id: user.id.slice(0, 8) + '...',
    name: user.name,
    firstName,
    email: user.email,
  } : null,
  current_page: currentPage,
  yoga_styles: profile?.yoga_styles || [],
  teaching_locations: profile?.teaching_locations || [],
  student_count: profile?.student_count || null,
  has_existing_insurance: profile?.has_existing_insurance || false,
}, null, 2)}
              </pre>
            </div>

            {/* Logs */}
            <div className="bg-slate-800 rounded p-2">
              <h4 className="text-yellow-400 text-xs font-bold mb-1">Event Log</h4>
              <div className="text-xs font-mono text-slate-400 space-y-0.5 max-h-24 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-slate-500">No events yet</div>
                ) : (
                  logs.map((log, i) => <div key={i}>{log}</div>)
                )}
              </div>
            </div>

            {/* Endpoints */}
            <div className="bg-slate-800 rounded p-2">
              <h4 className="text-yellow-400 text-xs font-bold mb-1">Endpoints</h4>
              <div className="text-xs font-mono text-slate-400 space-y-1">
                <div><span className="text-slate-500">CopilotKit:</span> /api/copilotkit</div>
                <div><span className="text-slate-500">Agent:</span> Railway /agui/</div>
                <div><span className="text-slate-500">Hume CLM:</span> /chat/completions</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Beta Badge Component
export function BetaBadge() {
  return (
    <span className="fixed top-16 right-4 z-50 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
      BETA
    </span>
  );
}
