import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Plus, CheckCircle2, Circle, Play, Pause, RotateCcw, Info, AlertTriangle } from 'lucide-react';

export function Tasks({ user }: { user: any }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [category, setCategory] = useState('cleaning');

  // Pomodoro State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      if (!isBreak) {
        setToastMessage("כל הכבוד! סיימת 25 דקות של ניקיון. קח 5 דקות הפסקה.");
        setTimeLeft(5 * 60);
        setIsBreak(true);
      } else {
        setToastMessage("ההפסקה הסתיימה. חוזרים לנקות!");
        setTimeLeft(25 * 60);
        setIsBreak(false);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, isBreak]);

  const toggleTimer = () => setIsTimerActive(!isTimerActive);
  const resetTimer = () => {
    setIsTimerActive(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
  };
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleChametz = async (taskId: string, currentStatus: boolean | undefined) => {
    try {
      const newStatus = !currentStatus;
      await updateDoc(doc(db, 'tasks', taskId), {
        hasChametz: newStatus
      });
      if (newStatus) {
        setToastMessage("⚠️ חמץ נמצא! זכור להעביר אותו לארגז החמץ המיועד למכירה או ביעור.");
      }
    } catch (error) {
      console.error("Error toggling chametz", error);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData.sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
    });
    
    return () => unsubscribe();
  }, [user]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    try {
      await addDoc(collection(db, 'tasks'), {
        userId: user.uid,
        title: newTask,
        category,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setNewTask('');
    } catch (error) {
      console.error("Error adding task", error);
    }
  };

  const toggleTask = async (taskId: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: currentStatus === 'pending' ? 'done' : 'pending'
      });
    } catch (error) {
      console.error("Error updating task", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error("Error deleting task", error);
    }
  };

  const categories = [
    { id: 'cleaning', label: 'ניקיון 🧹' },
    { id: 'shopping', label: 'קניות 🛒' },
    { id: 'cooking', label: 'בישולים 🍲' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">משימות והכנות</h1>
        <p className="text-gray-600 mt-1">נהלו את כל ההכנות לפסח במקום אחד</p>
      </div>

      {/* Pomodoro Timer Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {isBreak ? 'הפסקת התרעננות ☕' : 'זמן ניקיון (Pomodoro) 🧹'}
        </h2>
        <div className={`text-5xl font-mono font-bold mb-6 ${isBreak ? 'text-green-600' : 'text-blue-600'}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-4">
          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-colors ${
              isTimerActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isTimerActive ? <Pause size={20} /> : <Play size={20} />}
            {isTimerActive ? 'השהה' : 'התחל'}
          </button>
          <button
            onClick={resetTimer}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <RotateCcw size={20} />
            אפס
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={addTask} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="הוסיפו משימה חדשה..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            הוסף
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {categories.map(cat => {
          const catTasks = tasks.filter(t => t.category === cat.id);
          if (catTasks.length === 0) return null;
          
          return (
            <div key={cat.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">{cat.label}</h2>
              <div className="space-y-2">
                {catTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                      task.status === 'done' ? 'bg-gray-50 opacity-75' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleTask(task.id, task.status)}>
                      <button className={`text-${task.status === 'done' ? 'green-500' : 'gray-400'} hover:text-green-600 transition-colors`}>
                        {task.status === 'done' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      </button>
                      <span className={`text-lg ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleChametz(task.id, task.hasChametz)}
                        className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium ${
                          task.hasChametz 
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                            : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
                        }`}
                        title="סמן אם נמצא חמץ"
                      >
                        <AlertTriangle size={18} />
                        <span className="hidden sm:inline">{task.hasChametz ? 'חמץ נמצא' : 'סמן חמץ'}</span>
                      </button>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {tasks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-lg font-medium text-gray-900">אין משימות כרגע</h3>
            <p className="text-gray-500">הוסיפו משימות חדשות כדי להתחיל להתארגן לפסח!</p>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-8">
          <Info className="w-6 h-6 flex-shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white mr-4 p-1 text-xl leading-none">
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
