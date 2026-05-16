import React, { useState, useEffect } from 'react';
import { useConnections } from '../../hooks/useConnections';
import Avatar from '../ui/Avatar';
import { Search, UserPlus, Check, X, QrCode, Trash2 } from 'lucide-react';
import ProfileModal from './ProfileModal';

const ConnectionsPanel = ({ profile, user }) => {
  const {
    acceptedFriends,
    pendingIncoming,
    pendingOutgoing,
    loading,
    sendRequestByUsername,
    sendRequestByInviteToken,
    acceptRequest,
    rejectRequest,
    removeConnection
  } = useConnections(user?.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [requestStatus, setRequestStatus] = useState({ loading: false, error: null, success: null });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [connectionToRemove, setConnectionToRemove] = useState(null);

  const confirmRemoveConnection = (friend) => {
    setConnectionToRemove(friend);
  };

  const handleRemoveConnection = async () => {
    if (connectionToRemove?.connection_id) {
      await removeConnection(connectionToRemove.connection_id);
      setConnectionToRemove(null);
    }
  };

  useEffect(() => {
    const processInvite = async () => {
      const path = window.location.pathname;
      let result = null;
      
      if (path.startsWith('/invite/')) {
        const token = path.split('/')[2];
        if (token && token.length === 8) {
          setRequestStatus({ loading: true, error: null, success: null });
          result = await sendRequestByInviteToken(token);
        }
      } else if (path.startsWith('/u/')) {
        const username = path.split('/')[2];
        if (username) {
          setRequestStatus({ loading: true, error: null, success: null });
          result = await sendRequestByUsername(username);
        }
      }

      if (result) {
        if (result.error) {
          setRequestStatus({ loading: false, error: result.error, success: null });
        } else {
          setRequestStatus({ loading: false, error: null, success: 'Request sent successfully!' });
          setTimeout(() => setRequestStatus(prev => ({ ...prev, success: null })), 5000);
        }
        window.history.replaceState({}, '', '/');
      }
    };
    
    if (!loading) {
      processInvite();
    }
  }, [loading]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setRequestStatus({ loading: true, error: null, success: null });
    
    // Check if it's a token (length 8) or username
    let result;
    if (searchTerm.length === 8 && !searchTerm.includes('@')) {
      result = await sendRequestByInviteToken(searchTerm);
    } else {
      let uname = searchTerm.startsWith('@') ? searchTerm.substring(1) : searchTerm;
      result = await sendRequestByUsername(uname);
    }

    if (result.error) {
      setRequestStatus({ loading: false, error: result.error, success: null });
    } else {
      setRequestStatus({ loading: false, error: null, success: 'Request sent successfully!' });
      setSearchTerm('');
      setTimeout(() => setRequestStatus(prev => ({ ...prev, success: null })), 3000);
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">Loading connections...</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-bg text-gray-200 overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-dark-panel">
        <h1 className="text-2xl font-bold text-white">Connections</h1>
        <button 
          onClick={() => setShowProfileModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors border border-white/10"
        >
          <QrCode size={18} />
          <span>My QR Code & Invite</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Add Connection Section */}
        <section className="bg-dark-panel p-6 rounded-xl border border-white/5">
          <h2 className="text-lg font-semibold text-white mb-4">Add a Connection</h2>
          <form onSubmit={handleSendRequest} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Enter Username or 8-character Invite Token..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50"
              />
            </div>
            <button 
              type="submit" 
              disabled={requestStatus.loading || !searchTerm.trim()}
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <UserPlus size={18} />
              {requestStatus.loading ? 'Sending...' : 'Send Request'}
            </button>
          </form>
          {requestStatus.error && <p className="text-red-400 text-sm mt-3">{requestStatus.error}</p>}
          {requestStatus.success && <p className="text-green-400 text-sm mt-3">{requestStatus.success}</p>}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pending Incoming */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              Pending Requests
              {pendingIncoming.length > 0 && (
                <span className="bg-primary/20 text-primary-light text-xs py-0.5 px-2 rounded-full">
                  {pendingIncoming.length}
                </span>
              )}
            </h2>
            <div className="space-y-3">
              {pendingIncoming.length === 0 ? (
                <p className="text-gray-500 text-sm italic bg-dark-panel p-4 rounded-lg border border-white/5">No pending requests.</p>
              ) : (
                pendingIncoming.map(req => (
                  <div key={req.id} className="flex items-center justify-between bg-dark-panel p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                      <Avatar name={req.requester.username} size="md" />
                      <div>
                        <p className="text-white font-medium text-sm">{req.requester.full_name || req.requester.username}</p>
                        <p className="text-gray-400 text-xs">@{req.requester.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => acceptRequest(req.id)} className="p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded transition-colors" title="Accept">
                        <Check size={18} />
                      </button>
                      <button onClick={() => rejectRequest(req.id)} className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors" title="Reject">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Pending Outgoing */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Sent Requests</h2>
            <div className="space-y-3">
              {pendingOutgoing.length === 0 ? (
                <p className="text-gray-500 text-sm italic bg-dark-panel p-4 rounded-lg border border-white/5">No sent requests.</p>
              ) : (
                pendingOutgoing.map(req => (
                  <div key={req.id} className="flex items-center justify-between bg-dark-panel p-3 rounded-lg border border-white/5 opacity-70">
                    <div className="flex items-center gap-3">
                      <Avatar name={req.receiver.username} size="md" />
                      <div>
                        <p className="text-white font-medium text-sm">{req.receiver.full_name || req.receiver.username}</p>
                        <p className="text-gray-400 text-xs">@{req.receiver.username}</p>
                      </div>
                    </div>
                    <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">Pending</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Accepted Friends */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            My Connections
            <span className="bg-white/10 text-gray-300 text-xs py-0.5 px-2 rounded-full">
              {acceptedFriends.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {acceptedFriends.length === 0 ? (
              <p className="text-gray-500 text-sm italic col-span-full">You haven't connected with anyone yet.</p>
            ) : (
              acceptedFriends.map(friend => (
                <div key={friend.id} className="flex items-center gap-3 bg-dark-panel p-4 rounded-xl border border-white/5 hover:bg-white/[0.02] transition-colors">
                  <Avatar name={friend.username} size="lg" status={friend.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{friend.full_name || friend.username}</p>
                    <p className="text-primary/80 text-sm truncate">@{friend.username}</p>
                  </div>
                  <button 
                    onClick={() => confirmRemoveConnection(friend)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Remove Connection"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        profile={profile} 
      />

      {connectionToRemove && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-dark-panel border border-white/10 rounded-xl p-6 shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-bold text-white mb-2">Remove Connection?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to remove <span className="text-white font-semibold">@{connectionToRemove.username}</span> from your connections? You will no longer be able to message them directly.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConnectionToRemove(null)}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleRemoveConnection}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionsPanel;
