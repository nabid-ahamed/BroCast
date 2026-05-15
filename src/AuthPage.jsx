import React, { useState } from "react";
import { MessageSquare, Shield, Users, ArrowRight, Mail, Lock, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./hooks/useAuth";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, username);
      }
    } catch (err) {
      console.error("Auth Error", err);
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-screen p-5 bg-dark-bg bg-glass-gradient">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px] p-10 text-center glass shadow-2xl"
      >
        <div className="mb-8">
          <div className="bg-primary w-[60px] h-[60px] rounded-[18px] flex items-center justify-center mx-auto mb-5 shadow-[0_10px_20px_rgba(91,95,199,0.3)]">
            <MessageSquare size={32} color="#fff" />
          </div>
          <h1 className="font-['Outfit'] text-[2.2rem] font-bold m-0 mb-2 text-white tracking-tight">BroCast</h1>
          <p className="text-gray-400 text-sm leading-relaxed">The modern workspace for real-time collaboration.</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl mb-6">
          <button 
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${isLogin ? 'bg-white/10 text-white shadow-lg' : 'text-gray-400'}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${!isLogin ? 'bg-white/10 text-white shadow-lg' : 'text-gray-400'}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="text-left">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div 
                key="username"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4.5 overflow-hidden"
              >
                <label className="flex items-center gap-1.5 mb-2 text-[0.85rem] font-medium text-gray-200 opacity-80">
                  <User size={14} /> Username
                </label>
                <input
                  type="text"
                  placeholder="john_doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-base focus:outline-none focus:border-primary focus:bg-white/10 focus:ring-4 focus:ring-primary/10 transition-all"
                  required={!isLogin}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-4.5">
            <label className="flex items-center gap-1.5 mb-2 text-[0.85rem] font-medium text-gray-200 opacity-80">
              <Mail size={14} /> Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-base focus:outline-none focus:border-primary focus:bg-white/10 focus:ring-4 focus:ring-primary/10 transition-all"
              required
            />
          </div>

          <div className="mb-4.5">
            <label className="flex items-center gap-1.5 mb-2 text-[0.85rem] font-medium text-gray-200 opacity-80">
              <Lock size={14} /> Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-base focus:outline-none focus:border-primary focus:bg-white/10 focus:ring-4 focus:ring-primary/10 transition-all"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[0.85rem] p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-base font-semibold transition-all flex items-center justify-center mt-2.5 shadow-[0_8px_20px_rgba(91,95,199,0.4)] disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-px"
          >
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
            {!loading && <ArrowRight size={18} className="ml-2" />}
          </button>
        </form>

        <div className="mt-8 flex justify-center gap-8 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 text-gray-400 text-[0.8rem]">
            <Shield size={16} />
            <span>Encrypted</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-[0.8rem]">
            <Users size={16} />
            <span>Cloud Sync</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
