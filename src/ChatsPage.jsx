import React, { useState } from "react";
import Sidebar from "./components/chat/Sidebar";
import ChatList from "./components/chat/ChatList";
import ChatWindow from "./components/chat/ChatWindow";
import { useChat } from "./hooks/useChat";

const ChatsPage = ({ profile }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [activeRoom, setActiveRoom] = useState(null);
  const { rooms, loading } = useChat(null, profile?.id);

  return (
    <div className="chats-container">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        profile={profile}
      />
      
      <main className="main-content">
        <ChatList 
          rooms={rooms} 
          activeRoomId={activeRoom?.id}
          onRoomSelect={setActiveRoom}
          profile={profile}
        />
        
        <ChatWindow 
          room={activeRoom} 
          profile={profile} 
        />
      </main>

    </div>
  );
};

export default ChatsPage;
