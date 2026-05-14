import React, { useState } from "react";
import axios from "axios";
import { MessageSquare, Shield, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const AuthPage = (props) => {
  const [username, setUsername] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    axios
      .post("http://localhost:3001/authenticate", { username, secret })
      .then((r) => {
        props.onAuth({ ...r.data, secret });
        setLoading(false);
      })
      .catch((e) => {
        console.log("Auth Error", e);
        setError("Authentication failed. Please check your credentials.");
        setLoading(false);
      });
  };

  return (
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="auth-card glass"
      >
        <div className="auth-header">
          <div className="logo-container">
            <MessageSquare size={32} color="#5b5fc7" />
          </div>
          <h1>Welcome to Teams Chat</h1>
          <p>Connect, collaborate, and communicate in real-time.</p>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="e.g. john_doe"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password / Secret</label>
            <input
              type="password"
              name="secret"
              placeholder="Your secret key"
              onChange={(e) => setSecret(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Authenticating..." : "Get Started"}
            {!loading && <ArrowRight size={18} style={{ marginLeft: '8px' }} />}
          </button>
        </form>

        <div className="auth-footer">
          <div className="feature">
            <Shield size={16} />
            <span>Secure</span>
          </div>
          <div className="feature">
            <Users size={16} />
            <span>Team-ready</span>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100vh;
          padding: 20px;
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .auth-header h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.8rem;
          margin: 16px 0 8px;
          color: #fff;
        }

        .auth-header p {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-bottom: 32px;
        }

        .logo-container {
          background: rgba(91, 95, 199, 0.1);
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }

        .auth-form {
          text-align: left;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-main);
        }

        .input-group input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .input-group input:focus {
          outline: none;
          border-color: var(--primary-color);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 4px rgba(91, 95, 199, 0.15);
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
        }

        .submit-btn:hover {
          background: var(--primary-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(91, 95, 199, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error-message {
          color: #ff4d4d;
          font-size: 0.85rem;
          margin-bottom: 15px;
          text-align: center;
        }

        .auth-footer {
          margin-top: 32px;
          display: flex;
          justify-content: center;
          gap: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 24px;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
