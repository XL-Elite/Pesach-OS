import React, { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Send, Loader2 } from 'lucide-react';

export function GroupChat({ user }: { user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen to the global group chat collection
    const q = query(
      collection(db, 'groupChat'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || isSending) return;

    const messageText = input.trim();
    setInput('');
    setIsSending(true);

    try {
      await addDoc(collection(db, 'groupChat'), {
        userId: user.uid,
        authorName: user.displayName || 'משתמש אנונימי',
        authorAvatar: user.photoURL || '',
        text: messageText,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending message to group chat", error);
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div className="p-4 border-b border-gray-100 bg-blue-50 flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
          <Users size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">שולחן דיונים מרכזי</h2>
          <p className="text-sm text-gray-600">שוחחו, התייעצו ושתפו רעיונות עם כל משתמשי המערכת בזמן אמת</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900">ברוכים הבאים לשולחן הדיונים!</p>
            <p>היו הראשונים לשלוח הודעה לקהילה.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.userId === user?.uid;
            const showHeader = index === 0 || messages[index - 1].userId !== msg.userId;
            
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                {showHeader ? (
                  <img 
                    src={msg.authorAvatar || `https://ui-avatars.com/api/?name=${msg.authorName}`} 
                    alt={msg.authorName}
                    className="w-10 h-10 rounded-full shrink-0 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 shrink-0" />
                )}
                
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  {showHeader && (
                    <div className="flex items-baseline gap-2 mb-1 px-1">
                      <span className="text-sm font-medium text-gray-900">{isMe ? 'אני' : msg.authorName}</span>
                      <span className="text-xs text-gray-400">
                        {msg.createdAt?.toDate().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  
                  <div className={`rounded-2xl p-3 shadow-sm ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="כתבו הודעה לכל המשתמשים..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-sm"
          >
            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="rtl:rotate-180" />}
            <span className="hidden sm:inline">שליחה</span>
          </button>
        </form>
      </div>
    </div>
  );
}
