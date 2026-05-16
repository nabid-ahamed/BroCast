import React from 'react';
import { X, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Avatar from '../ui/Avatar';

const ProfileModal = ({ isOpen, onClose, profile }) => {
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copiedToken, setCopiedToken] = React.useState(false);

  if (!isOpen || !profile) return null;

  const inviteLink = `${window.location.origin}/invite/${profile.invite_token || 'pending'}`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-dark-panel border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white bg-black/20 hover:bg-white/10 p-1.5 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 flex flex-col items-center">
          <Avatar name={profile.username} size="xl" className="mb-4" />
          <h2 className="text-2xl font-bold text-white mb-1">{profile.full_name || profile.username}</h2>
          <p className="text-primary font-medium mb-6">@{profile.username}</p>

          <div className="bg-white p-4 rounded-xl mb-6 shadow-inner">
            <QRCodeSVG value={inviteLink} size={180} fgColor="#000000" bgColor="#ffffff" />
          </div>

          <p className="text-sm text-gray-400 text-center mb-6">
            Scan this code or share your link to connect instantly.
          </p>

          <div className="w-full space-y-3">
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block pl-1">Invite Token</label>
              <div className="flex items-center gap-2 bg-black/30 border border-white/5 rounded-lg p-2 pl-4">
                <code className="flex-1 text-white font-mono">{profile.invite_token || 'Please run schema update'}</code>
                <button 
                  onClick={() => copyToClipboard(profile.invite_token, 'token')}
                  className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded transition-colors"
                  title="Copy Token"
                  disabled={!profile.invite_token}
                >
                  {copiedToken ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block pl-1">Invite Link</label>
              <div className="flex items-center gap-2 bg-black/30 border border-white/5 rounded-lg p-2 pl-4">
                <input 
                  type="text" 
                  readOnly 
                  value={inviteLink} 
                  className="flex-1 bg-transparent text-sm text-gray-300 focus:outline-none"
                />
                <button 
                  onClick={() => copyToClipboard(inviteLink, 'link')}
                  className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded transition-colors"
                  title="Copy Link"
                  disabled={!profile.invite_token}
                >
                  {copiedLink ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
