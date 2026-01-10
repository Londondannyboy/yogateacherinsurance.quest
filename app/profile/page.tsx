'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth/client';

// Profile state type
type ProfileState = {
  yoga_styles: string[];
  teaching_locations: string[];
  student_count: string | null;
  experience_years: string | null;
  has_existing_insurance: boolean;
  qualifications: string[];
};

const YOGA_STYLE_OPTIONS = [
  { id: 'hatha', label: 'Hatha', icon: '🧘' },
  { id: 'vinyasa', label: 'Vinyasa Flow', icon: '🌊' },
  { id: 'yin', label: 'Yin / Restorative', icon: '🌙' },
  { id: 'hot_yoga', label: 'Hot Yoga / Bikram', icon: '🔥' },
  { id: 'aerial', label: 'Aerial Yoga', icon: '🎪' },
  { id: 'prenatal', label: 'Prenatal / Postnatal', icon: '🤰' },
  { id: 'meditation', label: 'Meditation / Mindfulness', icon: '🧠' },
  { id: 'teacher_training', label: 'Teacher Training', icon: '📚' },
];

const LOCATION_OPTIONS = [
  { id: 'studio', label: 'Yoga Studio', icon: '🏠' },
  { id: 'gym', label: 'Gym / Leisure Centre', icon: '🏋️' },
  { id: 'private', label: 'Private / In-Home', icon: '🏡' },
  { id: 'outdoor', label: 'Outdoor / Parks', icon: '🌳' },
  { id: 'online', label: 'Online / Virtual', icon: '💻' },
  { id: 'corporate', label: 'Corporate / Workplace', icon: '🏢' },
];

const STUDENT_COUNT_OPTIONS = [
  { id: '1-10', label: '1-10 students', xp: 10 },
  { id: '11-25', label: '11-25 students', xp: 20 },
  { id: '26-50', label: '26-50 students', xp: 30 },
  { id: '50+', label: '50+ students', xp: 50 },
];

const EXPERIENCE_OPTIONS = [
  { id: 'training', label: 'Still in training', xp: 5 },
  { id: '0-2', label: '0-2 years', xp: 15 },
  { id: '2-5', label: '2-5 years', xp: 30 },
  { id: '5-10', label: '5-10 years', xp: 50 },
  { id: '10+', label: '10+ years', xp: 75 },
];

const QUALIFICATION_OPTIONS = [
  { id: 'ryt200', label: 'RYT 200', xp: 25 },
  { id: 'ryt500', label: 'RYT 500', xp: 50 },
  { id: 'e-ryt', label: 'E-RYT', xp: 75 },
  { id: 'yacep', label: 'YACEP', xp: 40 },
  { id: 'bwy', label: 'BWY Certified', xp: 50 },
  { id: 'other', label: 'Other Certification', xp: 20 },
];

// Calculate XP and Level
function calculateProgress(profile: ProfileState) {
  let xp = 0;

  // Styles: 10 XP each
  xp += profile.yoga_styles.length * 10;

  // Locations: 15 XP each
  xp += profile.teaching_locations.length * 15;

  // Student count
  const studentOption = STUDENT_COUNT_OPTIONS.find(o => o.id === profile.student_count);
  if (studentOption) xp += studentOption.xp;

  // Experience
  const expOption = EXPERIENCE_OPTIONS.find(o => o.id === profile.experience_years);
  if (expOption) xp += expOption.xp;

  // Qualifications
  profile.qualifications.forEach(q => {
    const qual = QUALIFICATION_OPTIONS.find(o => o.id === q);
    if (qual) xp += qual.xp;
  });

  // Insurance status: 20 XP bonus
  if (profile.has_existing_insurance) xp += 20;

  // Calculate level (every 50 XP = 1 level)
  const level = Math.floor(xp / 50) + 1;

  // Calculate completion percentage
  const maxItems = YOGA_STYLE_OPTIONS.length + LOCATION_OPTIONS.length +
    STUDENT_COUNT_OPTIONS.length + EXPERIENCE_OPTIONS.length +
    QUALIFICATION_OPTIONS.length + 1; // +1 for insurance

  const completedItems = profile.yoga_styles.length +
    profile.teaching_locations.length +
    (profile.student_count ? 1 : 0) +
    (profile.experience_years ? 1 : 0) +
    profile.qualifications.length +
    (profile.has_existing_insurance ? 1 : 0);

  // Profile is "complete" when they have at least: 1 style, 1 location, experience, and student count
  const requiredComplete = profile.yoga_styles.length >= 1 &&
    profile.teaching_locations.length >= 1 &&
    profile.student_count !== null &&
    profile.experience_years !== null;

  const completionPercent = Math.min(100, Math.round((completedItems / 8) * 100)); // 8 minimum items for "complete"

  return { xp, level, completionPercent, requiredComplete };
}

// Get yoga journey title based on level
function getJourneyTitle(level: number): string {
  if (level >= 10) return 'Yoga Master';
  if (level >= 8) return 'Enlightened Teacher';
  if (level >= 6) return 'Experienced Yogi';
  if (level >= 4) return 'Growing Instructor';
  if (level >= 2) return 'Emerging Teacher';
  return 'Yoga Beginner';
}

// localStorage key for profile
const PROFILE_STORAGE_KEY = 'yoga_teacher_profile';

// Get profile from localStorage
function loadProfileFromStorage(): ProfileState | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading profile from localStorage:', e);
  }
  return null;
}

// Save profile to localStorage
function saveProfileToStorage(profile: ProfileState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    // Also dispatch a custom event so other components can react
    window.dispatchEvent(new CustomEvent('profileUpdated', { detail: profile }));
  } catch (e) {
    console.error('Error saving profile to localStorage:', e);
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const firstName = user?.name?.split(' ')[0] || 'Yogi';

  // Local state for profile preferences
  const [profile, setProfile] = useState<ProfileState>({
    yoga_styles: [],
    teaching_locations: [],
    student_count: null,
    experience_years: null,
    has_existing_insurance: false,
    qualifications: [],
  });

  const [saved, setSaved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load profile from localStorage on mount
  useEffect(() => {
    const storedProfile = loadProfileFromStorage();
    if (storedProfile) {
      setProfile(storedProfile);
      console.log('[Profile] Loaded from localStorage:', storedProfile);
    }
    setLoaded(true);
  }, []);

  // Auto-save profile to localStorage when it changes (after initial load)
  useEffect(() => {
    if (loaded) {
      saveProfileToStorage(profile);
      console.log('[Profile] Auto-saved to localStorage:', profile);
    }
  }, [profile, loaded]);

  // Calculate progress
  const { xp, level, completionPercent, requiredComplete } = useMemo(
    () => calculateProgress(profile),
    [profile]
  );

  // Redirect if not logged in
  useEffect(() => {
    if (!isPending && !user) {
      router.push('/auth/sign-in');
    }
  }, [isPending, user, router]);

  // Trigger confetti when profile is complete
  useEffect(() => {
    if (requiredComplete && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [requiredComplete, showConfetti]);

  const handleStyleToggle = (styleId: string) => {
    setProfile(prev => ({
      ...prev,
      yoga_styles: prev.yoga_styles.includes(styleId)
        ? prev.yoga_styles.filter(s => s !== styleId)
        : [...prev.yoga_styles, styleId],
    }));
    setSaved(false);
  };

  const handleLocationToggle = (locationId: string) => {
    setProfile(prev => ({
      ...prev,
      teaching_locations: prev.teaching_locations.includes(locationId)
        ? prev.teaching_locations.filter(l => l !== locationId)
        : [...prev.teaching_locations, locationId],
    }));
    setSaved(false);
  };

  const handleQualificationToggle = (qualId: string) => {
    setProfile(prev => ({
      ...prev,
      qualifications: prev.qualifications.includes(qualId)
        ? prev.qualifications.filter(q => q !== qualId)
        : [...prev.qualifications, qualId],
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (user) {
      try {
        await fetch('/api/zep', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            name: user.name,
            action: 'ensure_user',
          }),
        });

        const profileFact = `User ${user.name} teaches: ${profile.yoga_styles.join(', ') || 'not specified'}. ` +
          `Locations: ${profile.teaching_locations.join(', ') || 'not specified'}. ` +
          `Experience: ${profile.experience_years || 'not specified'}. ` +
          `Student count: ${profile.student_count || 'not specified'}. ` +
          `Qualifications: ${profile.qualifications.join(', ') || 'none listed'}. ` +
          `Has existing insurance: ${profile.has_existing_insurance ? 'yes' : 'no'}.`;

        await fetch('/api/zep', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            action: 'add_fact',
            fact: profileFact,
          }),
        });
      } catch (e) {
        console.log('Zep not configured, skipping memory save');
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-900/20 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-purple-300">Finding your center...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900/20 via-slate-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#a855f7', '#3b82f6', '#22c55e', '#eab308', '#ec4899'][i % 5],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">🧘‍♀️</div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {firstName}'s <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Yoga Journey</span>
            </h1>
            <p className="text-purple-300 text-lg">{getJourneyTitle(level)}</p>
          </div>

          {/* XP & Level Display */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-purple-500/30 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Level Circle */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-xl shadow-purple-500/25">
                    <span className="text-3xl font-black text-white">{level}</span>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-600 rounded-full text-xs font-bold text-white">
                    LEVEL
                  </div>
                </div>
                <div>
                  <p className="text-sm text-purple-300 mb-1">Experience Points</p>
                  <p className="text-3xl font-bold text-white">{xp} <span className="text-lg text-purple-400">XP</span></p>
                  <p className="text-xs text-slate-400">{50 - (xp % 50)} XP to next level</p>
                </div>
              </div>

              {/* Progress Circle */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-700" />
                    <circle
                      cx="40" cy="40" r="32"
                      stroke="url(#progressGradient)"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={`${(completionPercent / 100) * 201} 201`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                    {completionPercent}%
                  </span>
                </div>
                <div>
                  <p className="text-sm text-purple-300">Profile Complete</p>
                  {requiredComplete ? (
                    <p className="text-green-400 text-sm font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Ready for quotes!
                    </p>
                  ) : (
                    <p className="text-yellow-400 text-sm">Complete profile for quotes</p>
                  )}
                </div>
              </div>
            </div>

            {/* Next Step Prompt */}
            {!requiredComplete && (
              <div className="mt-6 p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                <p className="text-purple-300 text-sm">
                  <span className="font-semibold text-purple-400">Next step:</span>{' '}
                  {profile.yoga_styles.length === 0
                    ? 'Select the yoga styles you teach below'
                    : profile.teaching_locations.length === 0
                    ? 'Tell us where you teach'
                    : profile.experience_years === null
                    ? 'Select your teaching experience'
                    : 'Select your typical class size'}
                </p>
              </div>
            )}
          </div>

          {/* Account Info */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{user.name || 'Yogi'}</h2>
                <p className="text-slate-400 text-sm">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Yoga Styles */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎯</span>
              <h2 className="text-xl font-semibold text-white">Yoga Styles You Teach</h2>
              <span className="ml-auto text-sm text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
                +10 XP each
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {YOGA_STYLE_OPTIONS.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleToggle(style.id)}
                  className={`px-4 py-3 rounded-xl text-left transition-all ${
                    profile.yoga_styles.includes(style.id)
                      ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-500/25'
                      : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700 hover:border-purple-500/50'
                  } border`}
                >
                  <span className="text-lg mr-2">{style.icon}</span>
                  <span className="text-sm">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Teaching Locations */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📍</span>
              <h2 className="text-xl font-semibold text-white">Where Do You Teach?</h2>
              <span className="ml-auto text-sm text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
                +15 XP each
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {LOCATION_OPTIONS.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleLocationToggle(location.id)}
                  className={`px-4 py-3 rounded-xl text-left transition-all ${
                    profile.teaching_locations.includes(location.id)
                      ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/25'
                      : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700 hover:border-blue-500/50'
                  } border`}
                >
                  <span className="text-lg mr-2">{location.icon}</span>
                  <span className="text-sm">{location.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⏱️</span>
              <h2 className="text-xl font-semibold text-white">Teaching Experience</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {EXPERIENCE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setProfile(prev => ({ ...prev, experience_years: option.id }));
                    setSaved(false);
                  }}
                  className={`px-4 py-3 rounded-xl text-center transition-all ${
                    profile.experience_years === option.id
                      ? 'bg-green-600 text-white border-green-400 shadow-lg shadow-green-500/25'
                      : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700 hover:border-green-500/50'
                  } border`}
                >
                  <span className="text-sm">{option.label}</span>
                  <span className="block text-xs text-green-300 mt-1">+{option.xp} XP</span>
                </button>
              ))}
            </div>
          </div>

          {/* Student Count */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👥</span>
              <h2 className="text-xl font-semibold text-white">Typical Class Size</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STUDENT_COUNT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setProfile(prev => ({ ...prev, student_count: option.id }));
                    setSaved(false);
                  }}
                  className={`px-4 py-3 rounded-xl text-center transition-all ${
                    profile.student_count === option.id
                      ? 'bg-orange-600 text-white border-orange-400 shadow-lg shadow-orange-500/25'
                      : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700 hover:border-orange-500/50'
                  } border`}
                >
                  <span className="text-sm">{option.label}</span>
                  <span className="block text-xs text-orange-300 mt-1">+{option.xp} XP</span>
                </button>
              ))}
            </div>
          </div>

          {/* Qualifications */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎓</span>
              <h2 className="text-xl font-semibold text-white">Qualifications (Optional)</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {QUALIFICATION_OPTIONS.map((qual) => (
                <button
                  key={qual.id}
                  onClick={() => handleQualificationToggle(qual.id)}
                  className={`px-4 py-3 rounded-xl text-left transition-all ${
                    profile.qualifications.includes(qual.id)
                      ? 'bg-yellow-600 text-white border-yellow-400 shadow-lg shadow-yellow-500/25'
                      : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700 hover:border-yellow-500/50'
                  } border`}
                >
                  <span className="text-sm">{qual.label}</span>
                  <span className="block text-xs text-yellow-300 mt-1">+{qual.xp} XP</span>
                </button>
              ))}
            </div>
          </div>

          {/* Existing Insurance */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🛡️</span>
              <h2 className="text-xl font-semibold text-white">Current Insurance</h2>
            </div>
            <button
              onClick={() => {
                setProfile(prev => ({ ...prev, has_existing_insurance: !prev.has_existing_insurance }));
                setSaved(false);
              }}
              className={`w-full px-6 py-4 rounded-xl text-left transition-all ${
                profile.has_existing_insurance
                  ? 'bg-green-600/30 text-green-300 border-green-500/50'
                  : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700'
              } border`}
            >
              <span className="flex items-center gap-3">
                {profile.has_existing_insurance ? (
                  <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-6 h-6 rounded border-2 border-slate-500" />
                )}
                <span>I already have yoga teacher insurance</span>
                <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">+20 XP</span>
              </span>
            </button>
          </div>

          {/* Save & CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleSave}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/25"
            >
              Save Profile
            </button>

            {requiredComplete && (
              <Link
                href="/#calculator"
                className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl font-semibold transition-all text-center shadow-lg shadow-green-500/25"
              >
                Get Insurance Quotes
              </Link>
            )}

            {saved && (
              <span className="text-green-400 flex items-center gap-2 animate-fade-in">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Saved! Namaste! 🙏
              </span>
            )}
          </div>

          <p className="text-sm text-slate-500 mt-6 text-center">
            Your profile helps our AI advisor give you personalized insurance recommendations.
          </p>
        </div>
      </div>

      {/* Add keyframes for confetti animation */}
      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
