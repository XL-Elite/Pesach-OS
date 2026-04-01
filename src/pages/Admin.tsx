import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, MessageSquare, Activity } from 'lucide-react';

export function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [chatSessions, setChatSessions] = useState<any[]>([]);

  useEffect(() => {
    // Fetch users
    const qUsers = query(collection(db, 'users'), orderBy('lastLogin', 'desc'), limit(50));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch recent chat sessions
    const qChats = query(collection(db, 'chatSessions'), orderBy('updatedAt', 'desc'), limit(50));
    const unsubChats = onSnapshot(qChats, (snapshot) => {
      setChatSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubUsers();
      unsubChats();
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">פאנל ניהול</h1>
        <p className="text-gray-600 mt-1">מבט על המערכת ופעילות המשתמשים</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">סה"כ משתמשים</p>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">שיחות AI פעילות</p>
            <p className="text-2xl font-bold text-gray-900">{chatSessions.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">סטטוס מערכת</p>
            <p className="text-2xl font-bold text-gray-900">תקין</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              משתמשים אחרונים
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {users.map(u => (
              <div key={u.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.email}`} alt="" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                  <div>
                    <p className="font-medium text-gray-900">{u.name || 'משתמש'}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </div>
                <div className="text-left">
                  <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {u.role === 'admin' ? 'מנהל' : 'משתמש'}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {u.lastLogin?.toDate().toLocaleDateString('he-IL')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-purple-600" />
              שיחות AI אחרונות
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {chatSessions.map(session => {
              const sessionUser = users.find(u => u.uid === session.userId);
              return (
                <div key={session.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{sessionUser?.name || 'משתמש לא ידוע'}</span>
                      <span className="text-xs text-gray-500">({sessionUser?.email})</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {session.updatedAt?.toDate().toLocaleString('he-IL')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{session.title}</span>
                    <span className="text-xs font-medium bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">
                      {session.tokenUsage || 0} טוקנים
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
