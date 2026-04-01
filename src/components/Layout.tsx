import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  MessageSquare, 
  MessageCircle,
  Settings, 
  LogOut, 
  Menu,
  Info,
  ListTodo,
  FileText,
  Coins,
  Utensils,
  BookOpen,
  Wine,
  Gamepad2,
  Sparkles,
  Users,
  Library as LibraryIcon
} from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Modals } from './Modals';

export function Layout({ children, user, tokenCount, isAdmin }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const navItems = [
    { path: '/', label: 'ראשי', icon: Home },
    { path: '/tasks', label: 'משימות ניקיון', icon: CheckSquare },
    { path: '/meals', label: 'תפריטים וקניות', icon: Utensils },
    { path: '/learning', label: 'מרכז לימוד', icon: BookOpen },
    { path: '/library', label: 'ספריית פסח', icon: LibraryIcon },
    { path: '/seder', label: 'ניהול ליל הסדר', icon: Wine },
    { path: '/kids', label: 'ילדים ומשחקים', icon: Gamepad2 },
    { path: '/spirituality', label: 'רוחניות והתפתחות', icon: Sparkles },
    { path: '/community', label: 'קהילה ושיתופים', icon: Users },
    { path: '/group-chat', label: 'שולחן דיונים', icon: MessageCircle },
    { path: '/chat', label: 'צ\'אט AI', icon: MessageSquare },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin', label: 'ניהול מערכת', icon: Settings });
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900" dir="rtl">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-blue-600">Pesach OS ✨</h1>
              <button 
                onClick={() => setActiveModal('changelog')}
                className="text-xs text-gray-500 hover:text-blue-500 text-right mt-1"
              >
                v1.0.3
              </button>
            </div>
            <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
              ✕
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 space-y-2">
            <button 
              onClick={() => setActiveModal('todo')}
              className="flex items-center gap-3 px-4 py-2 w-full text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ListTodo size={18} />
              <span className="text-sm">משימות עתידיות</span>
            </button>
            <button 
              onClick={() => setActiveModal('about')}
              className="flex items-center gap-3 px-4 py-2 w-full text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Info size={18} />
              <span className="text-sm">אודות</span>
            </button>
          </div>

          {user && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full"
                  referrerPolicy="no-referrer"
                />
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{user.displayName || 'משתמש'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:bg-red-50 w-full px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>התנתק</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between md:justify-end">
          <button 
            className="md:hidden p-2 text-gray-600"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full text-sm font-medium">
              <Coins size={16} />
              <span>{tokenCount.toLocaleString()} טוקנים</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Modals */}
      <Modals activeModal={activeModal} onClose={() => setActiveModal(null)} />
    </div>
  );
}
