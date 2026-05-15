import React from "react";
import AuthPage from "./AuthPage";
import ChatsPage from "./ChatsPage";
import { useAuth } from "./hooks/useAuth";
import Loading from "./components/ui/Loading";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import "./index.css";

function AppContent() {
  const { user, profile, loading, profileLoaded, error } = useAuth();

  if (loading && !user) {
    return <Loading fullScreen />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center w-screen h-screen bg-dark-bg text-white p-5">
        <div className="max-w-[500px] w-full p-10 text-center glass-dark">
          <h2 className="text-primary font-bold text-xl mb-2">Configuration Required</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="text-left mt-5 text-[0.9rem] text-gray-400 bg-black/20 p-4 rounded-lg border border-white/5">
            <p className="font-bold mb-2 text-gray-200">Common Fixes:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Fill in your <code className="bg-white/10 px-1 rounded text-primary">.env</code> file with valid Supabase keys.</li>
              <li>Ensure the SQL schema is executed in Supabase.</li>
              <li>Check your internet connection.</li>
            </ul>
          </div>
          <div className="flex flex-col gap-3 mt-8">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20"
            >
              Retry Connection
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }} 
              className="bg-white/5 hover:bg-white/10 text-gray-300 px-8 py-3 rounded-xl font-semibold transition-all border border-white/10"
            >
              Clear Cache & Restart
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Admin Approval Check
  if (profile && profile.approval_status !== 'approved') {
    return (
      <div className="flex justify-center items-center w-screen h-screen bg-dark-bg text-white p-5">
        <div className="max-w-[500px] w-full p-10 text-center glass-dark">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-white font-bold text-2xl mb-2">
            {profile.approval_status === 'rejected' ? 'Access Denied' : 'Approval Pending'}
          </h2>
          <p className="text-gray-400 mb-8">
            {profile.approval_status === 'rejected' 
              ? 'Your account has been rejected by the administrator.' 
              : 'Your account is currently waiting for administrator approval. You will be able to access the system once approved.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20"
          >
            Check Status
          </button>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }} 
            className="block w-full mt-4 text-gray-500 hover:text-gray-300 transition-colors text-sm"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return <ChatsPage user={user} profile={profile} />;
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
