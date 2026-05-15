import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Settings, User, Check, Clock } from 'lucide-react';
import Avatar from '../ui/Avatar';

const SettingsPanel = ({ profile }) => {
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    // Check if username is already taken
    if (newUsername.trim().toLowerCase() === profile.username.toLowerCase()) {
      setError('This is already your username.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Basic check to see if someone else has this username
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', newUsername.trim())
        .single();

      if (existingUser) {
        throw new Error('This username is already taken.');
      }

      if (profile.is_admin) {
        // Admins can change their username directly
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ username: newUsername.trim() })
          .eq('id', profile.id);

        if (updateError) throw updateError;
        setMessage('Username updated successfully!');
      } else {
        // Members must request a username change
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ pending_username: newUsername.trim() })
          .eq('id', profile.id);

        if (updateError) throw updateError;
        setMessage('Username change requested! Waiting for admin approval.');
      }
      
      setNewUsername('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-dark-panel h-full overflow-hidden">
      <div className="p-6 border-b border-white/5 bg-white/[0.02]">
        <h2 className="text-2xl font-bold text-white m-0 flex items-center gap-3">
          <Settings className="text-primary" size={28} />
          Settings
        </h2>
        <p className="text-gray-400 mt-1">Manage your account preferences and profile.</p>
      </div>

      <div className="p-8 max-w-2xl">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <User size={20} className="text-primary" />
            Profile Information
          </h3>
          
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/5">
            <Avatar name={profile?.username || 'User'} size="lg" />
            <div>
              <div className="text-2xl font-bold text-white mb-1">{profile?.username}</div>
              <div className="text-sm text-gray-400 flex items-center gap-2">
                Role: <span className="text-primary font-semibold">{profile?.is_admin ? 'Admin' : 'Member'}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateUsername}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {profile?.is_admin ? 'Change Username' : 'Request Username Change'}
              </label>
              
              {profile?.pending_username && !profile.is_admin && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
                  <Clock size={18} className="text-yellow-500 mt-0.5" />
                  <div>
                    <div className="text-yellow-500 font-semibold text-sm">Pending Approval</div>
                    <div className="text-gray-400 text-sm mt-1">
                      You have requested to change your username to <span className="text-white font-bold">{profile.pending_username}</span>.
                    </div>
                  </div>
                </div>
              )}

              <input 
                type="text" 
                placeholder="Enter new username" 
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                {profile?.is_admin 
                  ? "As an admin, your username will be updated instantly." 
                  : "Username changes require admin approval to prevent impersonation."}
              </p>
            </div>

            {error && <div className="mb-4 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{error}</div>}
            {message && <div className="mb-4 text-green-400 text-sm bg-green-400/10 p-3 rounded-lg">{message}</div>}

            <button 
              type="submit" 
              disabled={loading || !newUsername.trim()}
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              {loading ? 'Processing...' : (profile?.is_admin ? <><Check size={18} /> Update Username</> : 'Submit Request')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
