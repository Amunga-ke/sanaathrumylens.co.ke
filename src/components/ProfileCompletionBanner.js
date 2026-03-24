'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, User } from 'lucide-react';
import Link from 'next/link';

export default function ProfileCompletionBanner({ user }) {
  const [dismissed, setDismissed] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user needs profile completion
    const needsProfile = ['EDITOR', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN'].includes(user?.role);
    
    if (!needsProfile || user?.profileCompleted) {
      setLoading(false);
      return;
    }

    // Fetch profile completion status
    fetch('/api/users/profile')
      .then(res => res.json())
      .then(data => {
        if (data.profileCompletion && !data.profileCompletion.isComplete) {
          setMissingFields(data.profileCompletion.missingFields);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const handleDismiss = async () => {
    try {
      await fetch('/api/users/profile', { method: 'POST' });
      setDismissed(true);
    } catch (error) {
      console.error('Error dismissing banner:', error);
    }
  };

  // Don't show if loading, dismissed, no missing fields, or user is not an editor
  if (loading || dismissed || missingFields.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-medium">
              Complete your profile to unlock all features!
            </span>
            <span className="text-amber-100 text-sm">
              Missing: {missingFields.join(', ')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-1 bg-white text-orange-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-orange-50 transition-colors"
          >
            <User className="w-4 h-4" />
            Complete Profile
          </Link>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
