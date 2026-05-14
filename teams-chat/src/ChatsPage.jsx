import React from "react";
import { PrettyChatWindow } from "react-chat-engine-pretty";
import { LogOut, Settings, MessageSquare } from "lucide-react";

const ChatsPage = (props) => {
  return (
    <div className="chats-container">
      <div className="sidebar-mock">
        <div className="sidebar-top">
          <div className="app-icon">
            <MessageSquare size={24} color="#fff" />
          </div>
          <div className="nav-item active">
             <MessageSquare size={20} />
             <span>Chat</span>
          </div>
        </div>
        <div className="sidebar-bottom">
          <button onClick={() => window.location.reload()} className="icon-btn">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="chat-window-wrapper">
        <PrettyChatWindow
          projectId={import.meta.env.VITE_CHAT_ENGINE_PROJECT_ID}
          username={props.user.username}
          secret={props.user.secret}
          style={{ height: "100%" }}
        />
      </div>

      <style jsx>{`
        .chats-container {
          width: 100vw;
          height: 100vh;
          display: flex;
          background: #1e1e1e;
        }

        .sidebar-mock {
          width: 68px;
          background: #33344a;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-right: 1px solid rgba(255,255,255,0.05);
        }

        .app-icon {
          width: 40px;
          height: 40px;
          background: var(--primary-color);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 10px;
          padding: 12px 0;
          width: 100%;
          transition: all 0.2s ease;
        }

        .nav-item.active {
          color: #fff;
          border-left: 3px solid var(--primary-color);
        }

        .nav-item:hover {
          color: #fff;
        }

        .chat-window-wrapper {
          flex: 1;
          height: 100%;
          overflow: hidden;
        }

        .icon-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 10px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .icon-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        /* Overriding Chat Engine default styles for a cleaner look */
        :global(.ce-chat-list) {
          background: #2b2b2b !important;
          border-right: 1px solid rgba(255,255,255,0.1) !important;
        }
        
        :global(.ce-chat-card) {
          border-bottom: 1px solid rgba(255,255,255,0.05) !important;
        }

        :global(.ce-chat-card-active) {
          background: rgba(91, 95, 199, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default ChatsPage;
