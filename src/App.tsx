import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Meals } from './pages/Meals';
import { Learning } from './pages/Learning';
import { Seder } from './pages/Seder';
import { Kids } from './pages/Kids';
import { Spirituality } from './pages/Spirituality';
import { Community } from './pages/Community';
import { GroupChat } from './pages/GroupChat';
import { Chat } from './pages/Chat';
import { Admin } from './pages/Admin';
import { Library } from './pages/Library';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenCount, setTokenCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Check if user exists in DB, if not create
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        let role = 'user';
        if (currentUser.email === 'globalelite8200@gmail.com') {
          role = 'admin';
        }
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName,
            photoURL: currentUser.photoURL,
            role: role,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            tokenCount: 10000 // Initial free tokens
          });
          setTokenCount(10000);
        } else {
          await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
          setTokenCount(userSnap.data().tokenCount || 0);
          role = userSnap.data().role || role;
        }
        
        setIsAdmin(role === 'admin');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold text-2xl">טוען את המערכת... ✨</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-4xl">
            ✨
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Pesach OS</h1>
          <p className="text-gray-600">מערכת חכמה לניהול חג הפסח</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" />
            התחבר עם Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} tokenCount={tokenCount} isAdmin={isAdmin}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks user={user} />} />
        <Route path="/meals" element={<Meals user={user} />} />
        <Route path="/learning" element={<Learning user={user} />} />
        <Route path="/seder" element={<Seder user={user} />} />
        <Route path="/kids" element={<Kids user={user} />} />
        <Route path="/spirituality" element={<Spirituality user={user} />} />
        <Route path="/community" element={<Community user={user} />} />
        <Route path="/group-chat" element={<GroupChat user={user} />} />
        <Route path="/library" element={<Library />} />
        <Route path="/chat" element={<Chat user={user} setTokenCount={setTokenCount} />} />
        {isAdmin && <Route path="/admin" element={<Admin />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
