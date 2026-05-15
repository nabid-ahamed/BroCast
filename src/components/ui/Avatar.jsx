import React from 'react';

const Avatar = ({ src, name, status, size = "md" }) => {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "?";

  const sizeClass = {
    sm: "w-8 h-8 text-[0.7rem]",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  }[size];

  return (
    <div className={`relative inline-block ${sizeClass}`}>
      <div className={`w-full h-full rounded-xl flex items-center justify-center font-bold text-white overflow-hidden glass shadow-inner`} 
           style={{ background: src ? 'none' : 'var(--primary-color)' }}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {status && (
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-dark-panel ${
          status === 'online' ? 'bg-green-500' : 'bg-gray-500'
        }`} />
      )}
    </div>
  );
};

export default Avatar;
