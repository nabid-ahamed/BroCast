import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import Avatar from '../ui/Avatar';

const MessageList = ({ messages, currentUserId }) => {
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-1" ref={scrollRef}>
      {messages.map((msg, index) => {
        const isMe = msg.user_id === currentUserId;
        const prevMsg = messages[index - 1];
        const isSameUser = prevMsg && prevMsg.user_id === msg.user_id;
        const showAvatar = !isSameUser;

        return (
          <div 
            key={msg.id} 
            className={`flex gap-3 max-w-[80%] mb-2 ${isMe ? 'self-end flex-row-reverse' : ''} ${isSameUser ? '-mt-2 ml-11 me:mr-0' : ''}`}
          >
            {!isMe && showAvatar && (
              <div className="flex-shrink-0 mt-6">
                <Avatar name={msg.profiles?.username} size="sm" />
              </div>
            )}
            
            <div className="flex flex-col gap-1">
              {!isMe && showAvatar && (
                <span className="text-[0.8rem] font-semibold text-gray-400 ml-1">{msg.profiles?.username}</span>
              )}
              
              <div className={`px-3.5 py-2.5 rounded-xl relative min-w-[60px] glass ${isMe ? 'bg-primary border-none rounded-br-none' : 'bg-white/5 rounded-bl-none'}`}>
                {msg.content && <p className="m-0 text-[0.95rem] leading-relaxed text-white">{msg.content}</p>}
                {msg.file_url && (
                  <div className="mt-2">
                    <img src={msg.file_url} alt="attachment" className="max-w-full rounded-lg" />
                  </div>
                )}
                <span className="text-[0.7rem] text-white/50 block mt-1 text-right">
                  {format(new Date(msg.created_at), 'h:mm a')}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
