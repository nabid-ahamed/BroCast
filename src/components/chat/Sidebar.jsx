import React from 'react';
import { MessageSquare, Users, Settings, LogOut, Bell, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';

const Sidebar = ({ activeTab, onTabChange, profile }) => {
  const { signOut } = useAuth();

  const navItems = [
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'teams', icon: Users, label: 'Teams' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'activity', icon: Bell, label: 'Activity' },
    { id: 'admin', icon: Shield, label: 'Admin', adminOnly: true },
  ];

  const filteredNavItems = navItems.filter(item => !item.adminOnly || profile?.is_admin);

  return (
    <div 
      className="w-[68px] h-screen bg-dark-sidebar flex flex-col justify-between items-center py-3 flex-shrink-0 z-[100]"
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        width: '68px', 
        height: '100%', 
        backgroundColor: '#18181b',
        borderRight: '1px solid rgba(255,255,255,0.05)'
      }}
    >
      <div className="flex flex-col items-center w-full">
        <div className="w-10 h-10 bg-primary rounded-[10px] flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
           <MessageSquare size={24} color="#fff" />
        </div>
        
        <div className="flex flex-col gap-2 w-full">
          {filteredNavItems.map((item) => (
            <button 
              key={item.id}
              className={`flex flex-col items-center justify-center gap-1 w-full h-16 cursor-pointer relative transition-all group ${activeTab === item.id ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              onClick={() => onTabChange(item.id)}
              title={item.label}
            >
              <item.icon size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {activeTab === item.id && (
                <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-primary rounded-r-lg" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 w-full">
        <button 
          className={`flex items-center justify-center w-full h-12 transition-all ${activeTab === 'settings' ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`} 
          onClick={() => onTabChange('settings')}
          title="Settings"
        >
          <Settings size={22} />
        </button>
        <button 
          className="flex items-center justify-center w-full h-12 text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-all" 
          onClick={signOut} 
          title="Sign Out"
        >
          <LogOut size={22} />
        </button>
        <div className="mt-3 cursor-pointer hover:scale-105 transition-transform">
          <Avatar 
            name={profile?.username || 'User'} 
            size="sm" 
            status="online" 
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
