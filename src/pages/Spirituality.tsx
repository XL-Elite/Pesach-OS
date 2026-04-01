import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Sparkles, Send, Loader2, BookHeart } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function Spirituality({ user }: { user: any }) {
  const [journals, setJournals] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'journals'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setJournals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsGenerating(true);
    let aiFeedback = '';

    try {
      const prompt = `
      אני משתמש באפליקציה לקראת חג הפסח. אני כותב יומן רוחני על "החמץ הפנימי" שלי - דברים שאני רוצה לשפר בעצמי, אגו, כעס, או הרגלים רעים.
      הנה מה שכתבתי: "${content}"
      
      אנא תן לי עצה קצרה, מעודדת ורוחנית (עד 3-4 משפטים) איך להתמודד עם זה ברוח חג הפסח (מעבר מחמץ למצה, מעבדות לחירות, ענווה).
      דבר בגוף שני (אתה/את), בשפה חמה ומכילה.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      aiFeedback = response.text || 'שתזכה לחירות אמיתית ולניקיון פנימי בחג הפסח הזה!';
    } catch (error) {
      console.error('AI Error:', error);
      aiFeedback = 'חג פסח כשר ושמח! שתזכה לחירות אמיתית.';
    }

    await addDoc(collection(db, 'journals'), {
      userId: user.uid,
      content,
      aiFeedback,
      createdAt: serverTimestamp()
    });

    setContent('');
    setIsGenerating(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">רוחניות והתפתחות</h1>
        <p className="text-gray-600 mt-1">תיקון החמץ הפנימי והכנה רוחנית לחג</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">החמץ הפנימי שלי</h2>
            <p className="text-sm text-gray-500">מה תרצה לנקות מהלב לקראת הפסח? (כעס, גאווה, הרגלים...)</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="אני מרגיש שהשנה אני רוצה לעבוד על..."
            className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
            disabled={isGenerating}
          />
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={!content.trim() || isGenerating}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              {isGenerating ? 'מקבל עצה מהרב AI...' : 'שתף וקבל עצה רוחנית'}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <BookHeart size={20} className="text-purple-600" /> יומן המסע הרוחני שלי
        </h3>
        
        {journals.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500">עדיין לא כתבת ביומן. זה הזמן להתחיל לנקות את הלב!</p>
          </div>
        ) : (
          journals.map((journal) => (
            <div key={journal.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div className="text-gray-800 whitespace-pre-wrap">{journal.content}</div>
              
              {journal.aiFeedback && (
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex gap-3">
                  <Sparkles size={20} className="text-purple-600 shrink-0 mt-1" />
                  <div className="text-purple-900 text-sm leading-relaxed">
                    <span className="font-bold block mb-1">עצה רוחנית:</span>
                    {journal.aiFeedback}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-400">
                {journal.createdAt?.toDate().toLocaleDateString('he-IL')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
