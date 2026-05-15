import React from 'react';
import { Phone, Video, Info, MoreVertical } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import EmptyState from '../ui/EmptyState';
import { useChat } from '../../hooks/useChat';
import Avatar from '../ui/Avatar';

const ChatWindow = ({ room, profile }) => {
  const { messages, typingUsers, sendMessage, setTyping } = useChat(room?.id, profile?.id, profile);

  if (!room) {
    return (
      <div className="flex-1 bg-dark-panel h-full">
        <EmptyState 
          title="Your messages" 
          message="Send a message to start a conversation with your team." 
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-dark-panel h-full">
      <div className="p-3 px-6 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <Avatar name={room.name} size="md" status="online" />
          <div className="flex flex-col">
            <h3 className="m-0 text-base text-white font-semibold">{room.name || 'Conversation'}</h3>
            <span className="text-[0.75rem] text-green-500">
              {typingUsers.length > 0 
                ? `${typingUsers.join(', ')} ${typingUsers.length > 1 ? 'are' : 'is'} typing...` 
                : 'Online'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-transparent border-none text-gray-400 p-2 rounded-md hover:text-white hover:bg-white/5 transition-all"><Video size={20} /></button>
          <button className="bg-transparent border-none text-gray-400 p-2 rounded-md hover:text-white hover:bg-white/5 transition-all"><Phone size={20} /></button>
          <div className="w-px h-5 bg-white/10 mx-2"></div>
          <button className="bg-transparent border-none text-gray-400 p-2 rounded-md hover:text-white hover:bg-white/5 transition-all"><Info size={20} /></button>
          <button className="bg-transparent border-none text-gray-400 p-2 rounded-md hover:text-white hover:bg-white/5 transition-all"><MoreVertical size={20} /></button>
        </div>
      </div>

      <MessageList messages={messages} currentUserId={profile?.id} />

      <MessageInput onSendMessage={sendMessage} onTyping={setTyping} roomId={room.id} />
    </div>
  );
};

export default ChatWindow;
