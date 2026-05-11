import React, { useState, useEffect, useContext } from 'react';
import { X } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import AIChat from './chat/AIChat';

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-floating-chat', handleToggle);
    return () => window.removeEventListener('toggle-floating-chat', handleToggle);
  }, []);

  if (user?.role && user.role !== 'patient') return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-50 overflow-hidden border-2 border-[#13b4b9] hover:ring-4 hover:ring-[#13b4b9]/30"
      >
        {isOpen ? (
          <X className="w-8 h-8 text-[#13b4b9]" />
        ) : (
          <img src="/ai-chat-icon.png" alt="AI Chat" className="w-full h-full object-cover" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100 animate-in zoom-in slide-in-from-bottom-10 duration-300">
           <AIChat isFloating={true} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}
