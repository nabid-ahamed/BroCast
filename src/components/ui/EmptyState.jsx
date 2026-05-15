import React from 'react';
import { MessageSquare } from 'lucide-react';

const EmptyState = ({ title, message, icon: Icon = MessageSquare }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-400">
      <div className="bg-white/[0.03] w-24 h-24 rounded-3xl flex items-center justify-center mb-6 border border-white/[0.05] shadow-xl">
        <Icon size={48} className="text-primary/60" />
      </div>
      <h3 className="m-0 mb-2 text-white font-['Outfit'] text-lg font-bold">{title}</h3>
      <p className="m-0 text-[0.9rem] max-w-[250px] leading-relaxed">{message}</p>
    </div>
  );
};

export default EmptyState;
