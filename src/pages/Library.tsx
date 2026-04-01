import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  BookOpen, 
  Scale, 
  Sparkles, 
  Calendar, 
  CheckSquare, 
  ShoppingCart, 
  Utensils, 
  Gamepad2,
  ChevronRight,
  Loader2,
  Search,
  Wheat,
  Droplets,
  Waves,
  Wallet,
  UtensilsCrossed,
  Map,
  MessageCircle,
  Music,
  PartyPopper,
  HeartPulse,
  ShieldAlert
} from 'lucide-react';

const documents = [
  { id: 'haggadah_full', title: 'הגדה של פסח 🍷', category: 'הלכה ומסורת', icon: BookOpen },
  { id: 'halachot_guide', title: 'מדריך הלכות פסח ⚖️', category: 'הלכה ומסורת', icon: Scale },
  { id: 'bedikat_chametz_guide', title: 'בדיקת וביעור חמץ 🕯️', category: 'הלכה ומסורת', icon: Search },
  { id: 'kitniyot_guide', title: 'מדריך קטניות 🌾', category: 'הלכה ומסורת', icon: Wheat },
  { id: 'tevilat_kelim_and_hagala', title: 'הגעלת וטבילת כלים 🚰', category: 'הלכה ומסורת', icon: Droplets },
  { id: 'shvi_i_shel_pesach', title: 'שביעי של פסח 🌊', category: 'הלכה ומסורת', icon: Waves },
  
  { id: 'holiday_schedule', title: 'לוח זמנים וארגון 📅', category: 'ארגון ותכנון', icon: Calendar },
  { id: 'cleaning_master_plan', title: 'תוכנית אב לניקיון 🧹', category: 'ארגון ותכנון', icon: CheckSquare },
  { id: 'master_shopping_list', title: 'רשימת קניות אולטימטיבית 🛒', category: 'ארגון ותכנון', icon: ShoppingCart },
  { id: 'budget_planning', title: 'תכנון תקציב לפסח 💰', category: 'ארגון ותכנון', icon: Wallet },
  { id: 'hosting_guide', title: 'המדריך למארח/ת 🍽️', category: 'ארגון ותכנון', icon: UtensilsCrossed },
  { id: 'travel_guide', title: 'פסח בדרכים (חול המועד) 🚗', category: 'ארגון ותכנון', icon: Map },
  
  { id: 'spiritual_insights', title: 'כוונות ורוחניות לפסח ✨', category: 'משפחה ורוחניות', icon: Sparkles },
  { id: 'recipes_and_substitutions', title: 'מתכונים ותחליפים 🍲', category: 'משפחה ורוחניות', icon: Utensils },
  { id: 'kids_activities', title: 'הפעלות ומשחקים לילדים 🎲', category: 'משפחה ורוחניות', icon: Gamepad2 },
  { id: 'haggadah_commentaries', title: 'פירושים ורעיונות להגדה 📖', category: 'משפחה ורוחניות', icon: MessageCircle },
  { id: 'songs_and_piyutim', title: 'שירי ופיוטי פסח 🎶', category: 'משפחה ורוחניות', icon: Music },
  { id: 'post_pesach_mimouna', title: 'מוצאי החג והמימונה 🍯', category: 'משפחה ורוחניות', icon: PartyPopper },
  
  { id: 'healthy_pesach', title: 'פסח בריא 🥗', category: 'בריאות ותזונה', icon: HeartPulse },
  { id: 'allergies_and_special_diets', title: 'פסח לבעלי רגישויות 🚫', category: 'בריאות ותזונה', icon: ShieldAlert },
];

export function Library() {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedDocId) {
      setIsLoading(true);
      fetch(`/docs/${selectedDocId}.md`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to load document');
          return res.text();
        })
        .then(text => setContent(text))
        .catch(err => setContent('שגיאה בטעינת המסמך. אנא נסה שוב.'))
        .finally(() => setIsLoading(false));
    }
  }, [selectedDocId]);

  const categories = Array.from(new Set(documents.map(d => d.category)));

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col md:flex-row gap-6">
      {/* Sidebar / List */}
      <div className={`w-full md:w-80 flex-shrink-0 flex flex-col gap-4 ${selectedDocId ? 'hidden md:flex' : 'flex'}`}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="text-blue-600" />
            ספריית פסח
          </h2>
          
          <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
            {categories.map(category => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">{category}</h3>
                <div className="space-y-1">
                  {documents.filter(d => d.category === category).map(doc => {
                    const Icon = doc.icon;
                    const isSelected = selectedDocId === doc.id;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right transition-colors ${
                          isSelected 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={18} className={isSelected ? 'text-blue-600' : 'text-gray-400'} />
                        <span className="flex-1 text-sm">{doc.title}</span>
                        <ChevronRight size={16} className={`text-gray-300 ${isSelected ? 'text-blue-400' : ''}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col ${!selectedDocId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {!selectedDocId ? (
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">ברוכים הבאים לספריית פסח</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              כאן תוכלו למצוא מדריכים, הלכות, תוכניות ניקיון, מתכונים ורעיונות לחג. בחרו מסמך מהתפריט כדי להתחיל לקרוא.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <button 
              onClick={() => setSelectedDocId(null)}
              className="md:hidden flex items-center gap-2 text-blue-600 mb-6 font-medium"
            >
              <ChevronRight size={20} />
              חזרה לרשימה
            </button>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="prose prose-blue max-w-none prose-headings:text-blue-900 prose-a:text-blue-600 hover:prose-a:text-blue-500" dir="rtl">
                <Markdown>{content}</Markdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
