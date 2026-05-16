import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import Avatar from '../ui/Avatar';
import { MoreHorizontal, Trash2, Edit2, Copy, X } from 'lucide-react';

const MessageList = ({ messages, currentUserId, onUnsendMessage, onEditMessage, onDeleteForMe }) => {
  const scrollRef = useRef();
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (scrollRef.current && !editingMsgId) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, editingMsgId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleCopy = (content) => {
    if (content) {
      navigator.clipboard.writeText(content);
    }
  };

  const handleEditSubmit = (e, msgId) => {
    e.preventDefault();
    if (editContent.trim()) {
      onEditMessage(msgId, editContent);
      setEditingMsgId(null);
      setEditContent('');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-1" ref={scrollRef}>
      {messages.map((msg, index) => {
        const isMe = msg.user_id === currentUserId;
        const prevMsg = messages[index - 1];
        const isSameUser = prevMsg && prevMsg.user_id === msg.user_id;
        const showAvatar = !isSameUser;
        const showMenu = hoveredMsgId === msg.id || menuOpenId === msg.id;

        return (
          <div 
            key={msg.id} 
            className={`flex gap-3 max-w-[80%] mb-2 ${isMe ? 'self-end flex-row-reverse' : ''} ${isSameUser ? '-mt-2 ml-11 me:mr-0' : ''}`}
            onMouseEnter={() => setHoveredMsgId(msg.id)}
            onMouseLeave={() => setHoveredMsgId(null)}
          >
            {!isMe && showAvatar && (
              <div className="flex-shrink-0 mt-6">
                <Avatar name={msg.profiles?.username} size="sm" />
              </div>
            )}
            
            <div className="flex flex-col gap-1 relative group w-full max-w-full">
              {!isMe && showAvatar && (
                <span className="text-[0.8rem] font-semibold text-gray-400 ml-1">{msg.profiles?.username}</span>
              )}
              
              <div className="flex items-center gap-2 relative">
                {/* 3-Dot Menu Button for isMe (left side of bubble) */}
                {isMe && showMenu && !editingMsgId && (
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === msg.id ? null : msg.id); }}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    
                    {menuOpenId === msg.id && (
                      <div className="absolute right-0 top-full mt-1 bg-dark-panel border border-white/10 rounded-lg shadow-xl z-50 w-48 overflow-hidden animate-fade-in" style={{ zIndex: 100 }}>
                        {!msg.is_unsent && (
                          <>
                            <button onClick={() => { setEditingMsgId(msg.id); setEditContent(msg.content); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2 transition-colors">
                              <Edit2 size={14} /> Edit Message
                            </button>
                            <button onClick={() => handleCopy(msg.content)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2 transition-colors">
                              <Copy size={14} /> Copy Text
                            </button>
                          </>
                        )}
                        <button onClick={() => onDeleteForMe(msg.id)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2 transition-colors">
                          <Trash2 size={14} /> Delete for me
                        </button>
                        {!msg.is_unsent && (
                          <button onClick={() => { if(window.confirm('Are you sure you want to unsend this message?')) onUnsendMessage(msg.id); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors">
                            <X size={14} /> Delete for everyone
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`px-3.5 py-2.5 rounded-xl relative min-w-[60px] glass ${msg.is_unsent ? 'bg-transparent border border-white/20 italic text-gray-400' : isMe ? 'bg-primary border-none rounded-br-none' : 'bg-white/5 rounded-bl-none'}`}>
                  {editingMsgId === msg.id ? (
                    <form onSubmit={(e) => handleEditSubmit(e, msg.id)} className="flex flex-col gap-2 min-w-[200px]">
                      <input 
                        type="text" 
                        value={editContent} 
                        onChange={e => setEditContent(e.target.value)} 
                        className="bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-primary/50"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setEditingMsgId(null)} className="text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded transition-colors">Save</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {msg.content && <p className="m-0 text-[0.95rem] leading-relaxed text-white whitespace-pre-wrap break-words">{msg.content}</p>}
                      {msg.file_url && !msg.is_unsent && (
                        <div className="mt-2">
                          <img src={msg.file_url} alt="attachment" className="max-w-full rounded-lg" />
                        </div>
                      )}
                      <div className={`text-[0.7rem] mt-1 text-right flex items-center justify-end gap-1 ${msg.is_unsent ? 'text-gray-500' : 'text-white/50'}`}>
                        {msg.is_edited && !msg.is_unsent && <span>(edited)</span>}
                        <span>{format(new Date(msg.created_at), 'h:mm a')}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* 3-Dot Menu Button for !isMe (right side of bubble) */}
                {!isMe && showMenu && (
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === msg.id ? null : msg.id); }}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    
                    {menuOpenId === msg.id && (
                      <div className="absolute left-0 top-full mt-1 bg-dark-panel border border-white/10 rounded-lg shadow-xl z-50 w-48 overflow-hidden animate-fade-in" style={{ zIndex: 100 }}>
                        {!msg.is_unsent && (
                          <button onClick={() => handleCopy(msg.content)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2 transition-colors">
                            <Copy size={14} /> Copy Text
                          </button>
                        )}
                        <button onClick={() => onDeleteForMe(msg.id)} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors">
                          <Trash2 size={14} /> Delete for me
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
