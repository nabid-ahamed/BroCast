import React, { useState } from 'react';
import { X, MessageSquare, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NewChatModal = ({ isOpen, onClose, onCreateChat }) => {
  const [name, setName] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    await onCreateChat(name, isGroup);
    setLoading(false);
    setName('');
    onClose();
  };

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
            className="relative w-full max-w-[440px] bg-dark-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h2 className="text-xl font-bold text-white m-0">New Chat</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Chat Name</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="e.g. Marketing Team, General Support..." 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 mb-8">
                <button 
                  type="button"
                  onClick={() => setIsGroup(false)}
                  className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${!isGroup ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  <MessageSquare size={24} />
                  <span className="text-sm font-semibold">Direct Chat</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setIsGroup(true)}
                  className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${isGroup ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  <Users size={24} />
                  <span className="text-sm font-semibold">Group Chat</span>
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading || !name.trim()}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                {loading ? 'Creating...' : 'Start Chatting'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewChatModal;
