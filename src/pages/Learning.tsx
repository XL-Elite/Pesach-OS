import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { BookOpen, Heart, MessageCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const HAGGADAH_DATA = [
  {
    id: 'kadesh',
    title: 'קַדֵּשׁ',
    text: 'בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם בּוֹרֵא פְּרִי הַגָּפֶן.',
    commentaries: {
      pshat: 'קידוש על הכוס הראשונה מארבע כוסות. פתיחת הסדר בקדושה.',
      remez: 'יין רומז לשמחה. ארבע כוסות כנגד ארבע לשונות של גאולה: והוצאתי, והצלתי, וגאלתי, ולקחתי.',
      drash: 'למה מתחילים ביין? כי היין משמח לבב אנוש, והגאולה דורשת שמחה אמיתית ופנימית.',
      sod: 'סוד היין הוא סוד הבינה. כניסה למוחין דגדלות בליל הסדר מתחילה בקידוש.'
    }
  },
  {
    id: 'ma_nishtana',
    title: 'מַה נִּשְׁתַּנָּה',
    text: 'מַה נִּשְׁתַּנָּה הַלַּיְלָה הַזֶּה מִכָּל הַלֵּילוֹת?',
    commentaries: {
      pshat: 'ארבע קושיות ששואלים הילדים על השינויים בלילה זה: מצה, מרור, טיבול כפול, והסבה.',
      remez: 'השאלה היא הבסיס ללימוד. "מה" רומז למידת הענווה (ונחנו מה).',
      drash: 'הלילה הזה שונה כי בו אנו יוצאים מההרגלים שלנו. השאלה מעוררת את הלב לצאת מהשגרה.',
      sod: 'הלילה מסמל את הגלות. אנו שואלים מתי יאיר הלילה כיום.'
    }
  },
  {
    id: 'avadim',
    title: 'עֲבָדִים הָיִינוּ',
    text: 'עֲבָדִים הָיִינוּ לְפַרְעֹה בְּמִצְרָיִם, וַיּוֹצִיאֵנוּ יְיָ אֱלֹהֵינוּ מִשָּׁם בְּיָד חֲזָקָה וּבִזְרוֹעַ נְטוּיָה.',
    commentaries: {
      pshat: 'תשובה לשאלות: היינו עבדים, והשם גאל אותנו בניסים.',
      remez: 'מצרים מלשון מיצרים - הגבולות והמגבלות האישיים של כל אדם.',
      drash: 'אפילו אם אנחנו חכמים ונבונים, מצווה עלינו לספר ביציאת מצרים כדי לזכור שהחירות היא מתנת שמיים.',
      sod: 'שבירת קליפת פרע"ה (האותיות פָּרַע ה\') וגילוי האור האלוקי בתוך המיצרים.'
    }
  }
];

const STORIES_DATA = [
  {
    id: 'story1',
    title: 'קריעת ים סוף - אמונה ברגע האמת',
    text: 'כשבני ישראל עמדו מול הים, המצרים מאחוריהם והים לפניהם, נחשון בן עמינדב קפץ למים עד שהגיעו לאפו, ורק אז נבקע הים. הלקח: לפעמים צריך לעשות את הצעד הראשון באמונה שלמה כדי לראות את הנס.'
  },
  {
    id: 'story2',
    title: 'רבי עקיבא והתלמידים בבני ברק',
    text: 'מעשה ברבי אליעזר ורבי יהושע ורבי אלעזר בן עזריה ורבי עקיבא ורבי טרפון שהיו מסובין בבני ברק, והיו מספרים ביציאת מצרים כל אותו הלילה... הלימוד לא מסתיים לעולם.'
  }
];

export function Learning({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState('haggadah');
  const [expandedPassage, setExpandedPassage] = useState<string | null>(null);
  const [activeCommentary, setActiveCommentary] = useState<'pshat'|'remez'|'drash'|'sod'>('pshat');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteDocs, setFavoriteDocs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'favorites'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setFavoriteDocs(docs);
      setFavorites(docs.map(d => d.passageId));
    });
    return () => unsubscribe();
  }, [user]);

  const toggleFavorite = async (passageId: string) => {
    const isFav = favorites.includes(passageId);
    if (isFav) {
      const docToDelete = favoriteDocs.find(d => d.passageId === passageId);
      if (docToDelete) {
        await deleteDoc(doc(db, 'favorites', docToDelete.id));
      }
    } else {
      await addDoc(collection(db, 'favorites'), {
        userId: user.uid,
        passageId,
        createdAt: serverTimestamp()
      });
    }
  };

  const commentaryLabels = { pshat: 'פשט', remez: 'רמז', drash: 'דרש', sod: 'סוד' };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">מרכז לימוד לפסח</h1>
        <p className="text-gray-600 mt-1">הגדה, פירושים, סיפורים ולימוד יומי</p>
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        <button onClick={() => setActiveTab('haggadah')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === 'haggadah' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}><BookOpen size={18} /> הגדה ופירושים</button>
        <button onClick={() => setActiveTab('stories')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === 'stories' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}><MessageCircle size={18} /> סיפורים ושו"ת</button>
        <button onClick={() => setActiveTab('daily')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}><Sparkles size={18} /> לימוד יומי</button>
      </div>

      {activeTab === 'haggadah' && (
        <div className="space-y-4">
          {HAGGADAH_DATA.map(passage => (
            <div key={passage.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 cursor-pointer flex justify-between items-center" onClick={() => setExpandedPassage(expandedPassage === passage.id ? null : passage.id)}>
                <h3 className="text-2xl font-bold text-blue-900">{passage.title}</h3>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(passage.id); }} 
                    className={`p-2 rounded-full transition-colors ${favorites.includes(passage.id) ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    <Heart size={24} fill={favorites.includes(passage.id) ? "currentColor" : "none"} />
                  </button>
                  {expandedPassage === passage.id ? <ChevronUp size={24} className="text-gray-500" /> : <ChevronDown size={24} className="text-gray-500" />}
                </div>
              </div>
              
              {expandedPassage === passage.id && (
                <div className="p-6 pt-0 border-t border-gray-100 bg-gray-50">
                  <p className="text-xl leading-relaxed text-gray-900 font-serif my-6 text-center">{passage.text}</p>
                  
                  <div className="mt-8">
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                      {(Object.keys(commentaryLabels) as Array<keyof typeof commentaryLabels>).map(level => (
                        <button 
                          key={level}
                          onClick={() => setActiveCommentary(level)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeCommentary === level ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                          {commentaryLabels[level]}
                        </button>
                      ))}
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 text-gray-700 leading-relaxed">
                      <span className="font-bold text-blue-800 ml-2">{commentaryLabels[activeCommentary]}:</span>
                      {passage.commentaries[activeCommentary]}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'stories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STORIES_DATA.map(story => (
            <div key={story.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{story.title}</h3>
              <p className="text-gray-700 leading-relaxed">{story.text}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'daily' && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100 text-center">
          <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-blue-900 mb-2">הלימוד היומי שלך</h2>
          <p className="text-gray-600 mb-6">רגע של השראה לקראת חג החירות</p>
          <div className="bg-white p-6 rounded-2xl shadow-sm text-right">
            <h3 className="text-lg font-bold text-gray-900 mb-2">עבדות וחירות בנפש</h3>
            <p className="text-gray-700 leading-relaxed">
              "בכל דור ודור חייב אדם לראות את עצמו כאילו הוא יצא ממצרים." 
              היציאה ממצרים אינה רק אירוע היסטורי, אלא תהליך נפשי יומיומי. 
              מצרים מסמלת את המיצרים והגבולות שאנו שמים לעצמנו. החירות האמיתית מתחילה במחשבה.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
