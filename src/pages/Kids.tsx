import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Gamepad2, Trophy, Star, Plus, User, CheckCircle2 } from 'lucide-react';

const TRIVIA_QUESTIONS = [
  { q: 'כמה כוסות יין שותים בליל הסדר?', options: ['2', '3', '4', '5'], answer: 2 },
  { q: 'מה מחביאים במהלך הסדר?', options: ['את המרור', 'את האפיקומן', 'את הכרפס', 'את ההגדה'], answer: 1 },
  { q: 'איזו מכה הייתה המכה הראשונה?', options: ['צפרדע', 'דם', 'כינים', 'ערוב'], answer: 1 },
  { q: 'מי מצא את משה בתיבה?', options: ['מרים', 'יוכבד', 'בת פרעה', 'ציפורה'], answer: 2 },
  { q: 'כמה אחים היו ליוסף?', options: ['10', '11', '12', '13'], answer: 1 }
];

const AVATARS = ['👦', '👧', '👶', '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🦁', '🐸'];

export function Kids({ user }: { user: any }) {
  const [kids, setKids] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('profiles');
  const [newKidName, setNewKidName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'kids'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setKids(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => b.score - a.score));
    });
    return () => unsubscribe();
  }, [user]);

  const addKid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKidName.trim()) return;
    await addDoc(collection(db, 'kids'), {
      userId: user.uid,
      name: newKidName,
      avatar: selectedAvatar,
      score: 0,
      createdAt: serverTimestamp()
    });
    setNewKidName('');
  };

  const handleAnswer = async (selectedIndex: number) => {
    const correct = selectedIndex === TRIVIA_QUESTIONS[currentQuestion].answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct && selectedKidId) {
      const kid = kids.find(k => k.id === selectedKidId);
      if (kid) {
        await updateDoc(doc(db, 'kids', selectedKidId), {
          score: kid.score + 10
        });
      }
    }

    setTimeout(() => {
      setShowResult(false);
      setCurrentQuestion(prev => (prev + 1) % TRIVIA_QUESTIONS.length);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ילדים ומשחקים</h1>
        <p className="text-gray-600 mt-1">פרופילים, ניקוד ומשחקי טריוויה לפסח</p>
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        <button onClick={() => setActiveTab('profiles')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === 'profiles' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}><User size={18} /> פרופילים וניקוד</button>
        <button onClick={() => setActiveTab('trivia')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === 'trivia' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}><Gamepad2 size={18} /> טריוויה פסח</button>
      </div>

      {activeTab === 'profiles' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">הוספת ילד/ה</h2>
            <form onSubmit={addKid} className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {AVATARS.map(avatar => (
                  <button type="button" key={avatar} onClick={() => setSelectedAvatar(avatar)} className={`text-3xl p-2 rounded-xl transition-transform ${selectedAvatar === avatar ? 'bg-blue-100 scale-110' : 'hover:bg-gray-50'}`}>
                    {avatar}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newKidName} onChange={e => setNewKidName(e.target.value)} placeholder="שם הילד/ה..." className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                <button type="submit" disabled={!newKidName.trim()} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                  <Plus size={20} /> הוסף
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {kids.map((kid, idx) => (
              <div key={kid.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
                {idx === 0 && kid.score > 0 && <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">מוביל! 👑</div>}
                <div className="text-6xl mb-4">{kid.avatar}</div>
                <h3 className="text-xl font-bold text-gray-900">{kid.name}</h3>
                <div className="mt-4 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-bold flex items-center gap-2">
                  <Star size={18} className="fill-current" />
                  {kid.score} נקודות
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'trivia' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          {kids.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👶</div>
              <h3 className="text-lg font-medium text-gray-900">אין פרופילים עדיין</h3>
              <p className="text-gray-500 mb-4">הוסיפו ילדים בלשונית "פרופילים וניקוד" כדי לשחק ולצבור נקודות.</p>
              <button onClick={() => setActiveTab('profiles')} className="text-blue-600 font-medium hover:underline">מעבר לפרופילים</button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">מי משחק עכשיו?</label>
                <select 
                  value={selectedKidId || ''} 
                  onChange={e => setSelectedKidId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                >
                  <option value="" disabled>בחרו שחקן...</option>
                  {kids.map(k => (
                    <option key={k.id} value={k.id}>{k.avatar} {k.name} ({k.score} נק')</option>
                  ))}
                </select>
              </div>

              {selectedKidId && (
                <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 text-center relative overflow-hidden">
                  <div className="text-sm font-bold text-blue-400 mb-4">שאלה {currentQuestion + 1} מתוך {TRIVIA_QUESTIONS.length}</div>
                  <h2 className="text-2xl font-bold text-blue-900 mb-8">{TRIVIA_QUESTIONS[currentQuestion].q}</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {TRIVIA_QUESTIONS[currentQuestion].options.map((opt, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={showResult}
                        className={`p-4 rounded-xl font-medium text-lg transition-all ${
                          showResult 
                            ? idx === TRIVIA_QUESTIONS[currentQuestion].answer 
                              ? 'bg-green-500 text-white scale-105 shadow-lg z-10' 
                              : 'bg-gray-200 text-gray-400'
                            : 'bg-white text-blue-700 hover:bg-blue-600 hover:text-white shadow-sm border border-blue-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {showResult && (
                    <div className={`absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm animate-in zoom-in duration-300 z-20 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                      <div className="text-center">
                        {isCorrect ? <CheckCircle2 size={80} className="mx-auto mb-4" /> : <div className="text-8xl mb-4">😅</div>}
                        <h3 className="text-3xl font-bold">{isCorrect ? 'כל הכבוד! +10 נק\'' : 'לא נורא, נסו שוב בשאלה הבאה!'}</h3>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
