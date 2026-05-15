import React from "react";
import AuthPage from "./AuthPage";
import ChatsPage from "./ChatsPage";
import { useAuth } from "./hooks/useAuth";
import Loading from "./components/ui/Loading";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import "./index.css";

function AppContent() {
  const { user, profile, loading, error } = useAuth();

  if (loading) {
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
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-primary/20"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
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
