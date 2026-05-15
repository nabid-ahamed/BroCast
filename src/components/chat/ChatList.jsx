import React from 'react';
import { Search, Plus, Filter, MessageSquare } from 'lucide-react';
import Avatar from '../ui/Avatar';

const ChatList = ({ chats, activeChatId, onChatSelect, onCreateChat, profile, loading }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-[300px] h-full bg-dark-chatList border-r border-white/5 flex flex-col flex-shrink-0">
      <div className="p-4 px-5 flex justify-between items-center">
        <h2 className="font-['Outfit'] text-xl font-bold m-0 text-white">Chat</h2>
        <div className="flex gap-3">
           <button title="Filter" className="bg-transparent border-none text-gray-400 hover:text-white hover:bg-white/5 p-1 rounded transition-all"><Filter size={18} /></button>
           <button 
            title="New Chat" 
            onClick={onCreateChat}
            className="bg-transparent border-none text-gray-400 hover:text-white hover:bg-white/5 p-1 rounded transition-all"
           >
            <Plus size={18} />
           </button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-2 px-3 flex items-center gap-2.5 text-gray-400">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search chats..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-white text-[0.9rem] w-full focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredChats.length === 0 ? (
          <div className="text-center p-6 mt-10">
            <div className="bg-white/5 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
              <MessageSquare size={24} />
            </div>
            <p className="text-gray-400 text-sm mb-6">
              {searchTerm ? 'No chats match your search' : 'No conversations yet'}
            </p>
            {!searchTerm && (
              <button 
                onClick={onCreateChat}
                className="w-full py-2.5 bg-primary/20 hover:bg-primary/30 text-primary-light border border-primary/30 rounded-xl text-sm font-semibold transition-all"
              >
                Start a new chat
              </button>
            )}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <button 
              key={chat.id}
              className={`flex items-center gap-3 w-full p-3 rounded-lg cursor-pointer transition-all mb-0.5 text-left ${activeChatId === chat.id ? 'bg-primary/15' : 'hover:bg-white/[0.03]'}`}
              onClick={() => onChatSelect(chat)}
            >
              <Avatar 
                name={chat.name || 'Group'} 
                size="md" 
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-semibold text-gray-100 text-[0.95rem] truncate">{chat.name || 'Unnamed Chat'}</span>
                  <span className="text-[0.75rem] text-gray-400">12:45 PM</span>
                </div>
                <p className="text-[0.8rem] text-gray-400 truncate m-0">Click to start chatting...</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
