import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Lightbulb, ChefHat, Info, Plus } from 'lucide-react';

const CATEGORIES = [
  { id: 'insight', label: 'חידוש תורה', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'recipe', label: 'מתכון לפסח', icon: ChefHat, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'tip', label: 'טיפ לניקיון/סדר', icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' },
];

export function Community({ user }: { user: any }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('insight');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsPosting(true);
    try {
      await addDoc(collection(db, 'communityPosts'), {
        userId: user.uid,
        authorName: user.displayName || 'משתמש אנונימי',
        authorAvatar: user.photoURL || '',
        content,
        category,
        createdAt: serverTimestamp()
      });
      setContent('');
    } catch (error) {
      console.error('Error posting:', error);
    }
    setIsPosting(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">קהילה ושיתופים</h1>
        <p className="text-gray-600 mt-1">שתפו מתכונים, חידושי תורה וטיפים עם כולם</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    category === cat.id 
                      ? `${cat.bg} ${cat.color} border border-${cat.color.split('-')[1]}-200` 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={16} />
                  {cat.label}
                </button>
              );
            })}
          </div>
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="שתפו משהו עם הקהילה..."
            className="w-full h-24 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            disabled={isPosting}
          />
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={!content.trim() || isPosting}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={20} />
              {isPosting ? 'מפרסם...' : 'פרסם'}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">אין עדיין פוסטים. היו הראשונים לשתף!</p>
          </div>
        ) : (
          posts.map((post) => {
            const catInfo = CATEGORIES.find(c => c.id === post.category) || CATEGORIES[0];
            const CatIcon = catInfo.icon;
            
            return (
              <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.authorAvatar || `https://ui-avatars.com/api/?name=${post.authorName}`} 
                      alt={post.authorName}
                      className="w-10 h-10 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{post.authorName}</div>
                      <div className="text-xs text-gray-500">
                        {post.createdAt?.toDate().toLocaleString('he-IL')}
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${catInfo.bg} ${catInfo.color}`}>
                    <CatIcon size={14} />
                    {catInfo.label}
                  </div>
                </div>
                
                <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
