import React, { useState } from 'react';
import { Send, Paperclip, Smile, Image as ImageIcon, Plus } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabase';

const MessageInput = ({ onSendMessage, onTyping, roomId }) => {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const handleTextChange = (e) => {
    const value = e.target.value;
    setText(value);

    if (onTyping) {
      onTyping(true);
      if (typingTimeout) clearTimeout(typingTimeout);
      setTypingTimeout(setTimeout(() => onTyping(false), 2000));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
      if (onTyping) onTyping(false);
    }
  };

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `chat-files/${roomId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-assets')
        .getPublicUrl(filePath);

      onSendMessage('', publicUrl);
    } catch (error) {
      console.error('Error uploading file:', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    noClick: true,
    accept: { 'image/*': [] }
  });

  return (
    <div className="p-4 px-6 pb-6 relative" {...getRootProps()}>
      <input {...getInputProps()} />
      <form onSubmit={handleSubmit} className="flex items-center p-2 px-4 gap-3 rounded-xl bg-white/[0.03] border border-white/[0.08] glass">
        <div className="flex gap-1">
          <button type="button" className="bg-transparent border-none text-gray-400 p-1.5 rounded-md hover:text-white hover:bg-white/5 transition-all"><Plus size={20} /></button>
          <button type="button" className="bg-transparent border-none text-gray-400 p-1.5 rounded-md hover:text-white hover:bg-white/5 transition-all" onClick={() => document.querySelector('.file-input').click()}>
            <Paperclip size={20} />
          </button>
          <input type="file" className="file-input hidden" onChange={(e) => onDrop(e.target.files)} />
        </div>
        
        <input 
          type="text" 
          placeholder="Type a message" 
          value={text}
          onChange={handleTextChange}
          className="flex-1 bg-transparent border-none text-white text-[0.95rem] py-2 focus:outline-none"
        />

        <div className="flex gap-1">
          <button type="button" className="bg-transparent border-none text-gray-400 p-1.5 rounded-md hover:text-white hover:bg-white/5 transition-all"><Smile size={20} /></button>
          <button type="submit" className="bg-primary text-white rounded-lg w-9 h-9 flex items-center justify-center cursor-pointer transition-all hover:scale-105 disabled:opacity-50 disabled:bg-white/10 disabled:cursor-not-allowed" disabled={!text.trim() && !isUploading}>
            <Send size={20} />
          </button>
        </div>
      </form>
      
      {isDragActive && (
        <div className="absolute inset-0 bg-primary/90 z-10 rounded-xl m-4 mx-6 pb-6 flex items-center justify-center text-white">
          <div className="text-center">
            <ImageIcon size={48} className="mx-auto mb-2" />
            <p className="font-semibold">Drop to upload image</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
