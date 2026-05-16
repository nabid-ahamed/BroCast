import React, { useState } from 'react';
import { X, MessageSquare, Users, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnections } from '../../hooks/useConnections';
import Avatar from '../ui/Avatar';

const NewChatModal = ({ isOpen, onClose, onCreateChat, user }) => {
  const [name, setName] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [search, setSearch] = useState('');

  const { acceptedFriends, loading: friendsLoading } = useConnections(user?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isGroup && !name.trim()) return;
    if (selectedFriends.length === 0) return;
    
    setLoading(true);
    let chatName = name;
    if (!isGroup && selectedFriends.length === 1) {
      chatName = selectedFriends[0].full_name || selectedFriends[0].username;
    }
    
    // Add members parameter to onCreateChat call
    await onCreateChat(chatName, isGroup, selectedFriends.map(f => f.id));
    
    setLoading(false);
    setName('');
    setSelectedFriends([]);
    onClose();
  };

  const toggleFriend = (friend) => {
    if (!isGroup) {
      setSelectedFriends([friend]);
    } else {
      setSelectedFriends(prev => 
        prev.some(f => f.id === friend.id) 
          ? prev.filter(f => f.id !== friend.id)
          : [...prev, friend]
      );
    }
  };

  const filteredFriends = acceptedFriends.filter(f => 
    (f.full_name || f.username).toLowerCase().includes(search.toLowerCase()) ||
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[480px] bg-dark-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass flex flex-col max-h-[85vh]"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] flex-shrink-0">
              <h2 className="text-xl font-bold text-white m-0">New Chat</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-3 p-6 pb-2 flex-shrink-0">
              <button 
                type="button"
                onClick={() => { setIsGroup(false); setSelectedFriends([]); setName(''); }}
                className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${!isGroup ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                <MessageSquare size={20} />
                <span className="text-xs font-semibold uppercase tracking-wider">Direct Message</span>
              </button>
              <button 
                type="button"
                onClick={() => { setIsGroup(true); setSelectedFriends([]); }}
                className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${isGroup ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                <Users size={20} />
                <span className="text-xs font-semibold uppercase tracking-wider">Group Chat</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col p-6 pt-2">
              {isGroup && (
                <div className="mb-4 flex-shrink-0">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Group Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Marketing Team" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
                    required={isGroup}
                  />
                </div>
              )}

              <div className="mb-4 flex-shrink-0">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Select Connections</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search connections..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2 pl-9 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto min-h-[150px] mb-4 space-y-1 pr-2">
                {friendsLoading ? (
                  <p className="text-center text-gray-500 text-sm mt-4">Loading connections...</p>
                ) : filteredFriends.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm mt-4">No connections found.</p>
                ) : (
                  filteredFriends.map(friend => {
                    const isSelected = selectedFriends.some(f => f.id === friend.id);
                    return (
                      <div 
                        key={friend.id}
                        onClick={() => toggleFriend(friend)}
                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors border ${isSelected ? 'bg-primary/10 border-primary/30' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={friend.username} size="sm" status={friend.status} />
                          <div>
                            <p className="text-sm font-medium text-white m-0">{friend.full_name || friend.username}</p>
                            <p className="text-xs text-gray-400 m-0">@{friend.username}</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-gray-500'}`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading || selectedFriends.length === 0 || (isGroup && !name.trim())}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 flex-shrink-0 mt-auto"
              >
                {loading ? 'Creating...' : isGroup ? `Create Group (${selectedFriends.length})` : 'Start Chatting'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewChatModal;
