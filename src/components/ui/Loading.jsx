import React from 'react';

const Loading = ({ fullScreen = false }) => {
  return (
    <div className={`flex justify-center items-center w-full h-full min-h-[200px] ${fullScreen ? 'fixed inset-0 bg-dark-bg z-[1000]' : ''}`}>
      <div className="w-12 h-12 border-3 border-primary/20 rounded-full inline-block relative box-border animate-spin">
        <div className="absolute left-0 top-0 bg-primary w-3 h-3 -translate-x-1/2 translate-y-1/2 rounded-full"></div>
      </div>
    </div>
  );
};

export default Loading;
