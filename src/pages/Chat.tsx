import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { GoogleGenAI } from '@google/genai';
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function Chat({ user, setTokenCount }: { user: any, setTokenCount: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    
    // Find or create a session
    const fetchSession = async () => {
      const q = query(collection(db, 'chatSessions'), where('userId', '==', user.uid), orderBy('updatedAt', 'desc'));
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        if (!snapshot.empty) {
          setSessionId(snapshot.docs[0].id);
        } else {
          try {
            const docRef = await addDoc(collection(db, 'chatSessions'), {
              userId: user.uid,
              title: 'שיחה חדשה',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              tokenUsage: 0
            });
            setSessionId(docRef.id);
          } catch (error) {
            console.error("Error creating session", error);
          }
        }
      });
      return unsubscribe;
    };
    
    fetchSession();
  }, [user]);

  useEffect(() => {
    if (!sessionId) return;
    
    const q = query(
      collection(db, 'chatSessions', sessionId, 'messages'),
      orderBy('createdAt', 'asc')
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
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // 1. Save user message to Firestore
      await addDoc(collection(db, 'chatSessions', sessionId, 'messages'), {
        sessionId,
        userId: user.uid,
        role: 'user',
        text: userMessage,
        createdAt: serverTimestamp()
      });

      // 2. Call Gemini API
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Prepare history for context
      const history = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n');
      const prompt = `You are Pesach OS AI, an expert on Passover, cleaning, and Jewish traditions. Respond in Hebrew.\n\nHistory:\n${history}\n\nUser: ${userMessage}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const aiText = response.text || "מצטער, לא הצלחתי לענות על זה.";
      
      // Estimate tokens (roughly 4 chars per token for Hebrew)
      const estimatedTokens = Math.ceil((prompt.length + aiText.length) / 4);

      // 3. Save AI message to Firestore
      await addDoc(collection(db, 'chatSessions', sessionId, 'messages'), {
        sessionId,
        userId: user.uid,
        role: 'model',
        text: aiText,
        createdAt: serverTimestamp()
      });

      // 4. Update token usage
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentTokens = userSnap.data().tokenCount || 0;
        const newTokens = Math.max(0, currentTokens - estimatedTokens);
        await updateDoc(userRef, { tokenCount: newTokens });
        setTokenCount(newTokens);
      }
      
      await updateDoc(doc(db, 'chatSessions', sessionId), {
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error("Error sending message", error);
      // Add error message
      await addDoc(collection(db, 'chatSessions', sessionId, 'messages'), {
        sessionId,
        userId: user.uid,
        role: 'system',
        text: 'אירעה שגיאה בתקשורת עם השרת. אנא נסו שוב.',
        createdAt: serverTimestamp()
      });
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">Pesach OS AI</h2>
          <p className="text-xs text-gray-500">העוזר האישי שלכם לחג הפסח</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 mt-10">
            <div className="text-4xl mb-4">✨</div>
            <p>שלום! אני העוזר האישי שלכם לפסח.</p>
            <p>איך אוכל לעזור לכם היום?</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 
              msg.role === 'system' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'
            }`}>
              {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 
              msg.role === 'system' ? 'bg-red-50 text-red-600 rounded-tl-none border border-red-100' :
              'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
            }`}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-gray-50 rounded-2xl rounded-tl-none border border-gray-100 p-4 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-purple-600" />
              <span className="text-sm text-gray-500">מקליד...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="שאלו אותי על ניקיון, מתכונים או הלכות פסח..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send size={20} className="rtl:rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
}
