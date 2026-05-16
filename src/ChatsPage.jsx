import React, { useState } from "react";
import Sidebar from "./components/chat/Sidebar";
import ChatList from "./components/chat/ChatList";
import ChatWindow from "./components/chat/ChatWindow";
import { useChats } from "./hooks/useChat";

import NewChatModal from "./components/chat/NewChatModal";

import AdminPanel from "./components/admin/AdminPanel";
import SettingsPanel from "./components/settings/SettingsPanel";
import ConnectionsPanel from "./components/connections/ConnectionsPanel";
import Loading from "./components/ui/Loading";

const ChatsPage = ({ user, profile }) => {
  const [activeTab, setActiveTab] = useState(() => {
    if (window.location.pathname.startsWith('/invite/')) return 'connections';
    return 'chat';
  });
  const [activeChat, setActiveChat] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const { chats, loading, createChat, hideChat } = useChats(user?.id);

  // Auto-select first chat if none selected
  React.useEffect(() => {
    if (chats.length > 0 && !activeChat && activeTab === 'chat') {
      setActiveChat(chats[0]);
    }
  }, [chats, activeChat, activeTab]);

  // Ensure activeChat is still in chats
  React.useEffect(() => {
    if (activeChat && chats.length >= 0 && !chats.find(c => c.id === activeChat.id)) {
      setActiveChat(chats.length > 0 ? chats[0] : null);
    }
  }, [chats, activeChat]);

  const handleCreateChat = async (name, isGroup, memberIds) => {
    const newChat = await createChat(name, profile, isGroup, memberIds);
    if (newChat) setActiveChat(newChat);
  };

  if (loading && chats.length === 0) {
    return <Loading fullScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <>
            <ChatList 
              chats={chats} 
              activeChatId={activeChat?.id}
              onChatSelect={setActiveChat}
              onCreateChat={() => setShowNewChatModal(true)}
              onHideChat={hideChat}
              profile={profile}
              loading={loading}
            />
            <ChatWindow 
              chat={activeChat} 
              user={user}
              profile={profile} 
            />
          </>
        );
      case 'admin':
        return profile?.is_admin ? <AdminPanel currentUserProfile={profile} /> : (
          <div className="flex-1 flex items-center justify-center bg-dark-panel text-gray-400">
            <div className="text-center">
              <h2 className="text-white text-2xl mb-2">Access Denied</h2>
              <p>You do not have permission to view this page.</p>
            </div>
          </div>
        );
      case 'connections':
        return <ConnectionsPanel profile={profile} user={user} />;
      case 'settings':
        return <SettingsPanel profile={profile} />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center bg-dark-panel text-gray-400">
            <div className="text-center">
              <h2 className="text-white text-2xl mb-2 capitalize">{activeTab} Coming Soon</h2>
              <p>We're working hard to bring this feature to BroCast.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="chats-container">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        profile={profile}
      />
      
      <main className="main-content">
        {renderContent()}
      </main>

      <NewChatModal 
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onCreateChat={handleCreateChat}
        user={user}
      />
    </div>
  );
};

export default ChatsPage;
