import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckSquare, MessageSquare, BookOpen, Utensils } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ברוכים הבאים ל-Pesach OS ✨</h1>
          <p className="text-gray-600 mt-1">המערכת החכמה לניהול חג הפסח שלכם</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/tasks" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CheckSquare size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">משימות ניקיון</h2>
          <p className="text-gray-600 text-sm">ניהול משימות ניקיון לקראת פסח עם חלוקה לחדרים ואזורים.</p>
        </Link>

        <Link to="/chat" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">צ'אט AI חכם</h2>
          <p className="text-gray-600 text-sm">עוזר אישי חכם לשאלות, טיפים לניקיון, וחידושי תורה.</p>
        </Link>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 opacity-75 relative overflow-hidden">
          <div className="absolute top-4 left-4 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">בקרוב</div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
            <Utensils size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">מנהל תפריטים</h2>
          <p className="text-gray-600 text-sm">תכנון סעודות החג, רשימות קניות אוטומטיות ומתכונים.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 opacity-75 relative overflow-hidden">
          <div className="absolute top-4 left-4 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">בקרוב</div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
            <BookOpen size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">מרכז לימוד</h2>
          <p className="text-gray-600 text-sm">הגדה של פסח, פירושים, סיפורי יציאת מצרים וחידושים.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 md:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">לוח זמנים חכם</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex flex-col items-center justify-center text-blue-600 font-bold border border-gray-100">
                  <span className="text-xs text-gray-500">ניסן</span>
                  <span>י"ד</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">ערב פסח</h3>
                  <p className="text-sm text-gray-600">בדיקת חמץ, ביעור חמץ, ליל הסדר</p>
                </div>
              </div>
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">מתקרב</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex flex-col items-center justify-center text-blue-600 font-bold border border-gray-100">
                  <span className="text-xs text-gray-500">ניסן</span>
                  <span>ט"ו</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">חג ראשון</h3>
                  <p className="text-sm text-gray-600">תפילת טל, תחילת ספירת העומר</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
