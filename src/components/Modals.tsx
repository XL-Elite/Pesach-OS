import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export function Modals({ activeModal, onClose }: { activeModal: string | null, onClose: () => void }) {
  const [changelog, setChangelog] = useState('');
  const [todo, setTodo] = useState('');
  const [todoState, setTodoState] = useState<Record<string, boolean>>({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().role === 'admin') {
          setIsAdmin(true);
        }
      }
    };
    checkAdmin();
  }, [activeModal]);

  useEffect(() => {
    if (activeModal === 'changelog' && !changelog) {
      fetch('/changelog.md')
        .then(res => res.text())
        .then(text => setChangelog(text))
        .catch(err => console.error(err));
    }
    if (activeModal === 'todo') {
      if (!todo) {
        fetch('/todo.md')
          .then(res => res.text())
          .then(text => setTodo(text))
          .catch(err => console.error(err));
      }
      // Load todo state from Firestore
      const loadTodoState = async () => {
        try {
          const docRef = doc(db, 'system', 'todoState');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setTodoState(docSnap.data().states || {});
          }
        } catch (error) {
          console.error("Error loading todo state", error);
        }
      };
      loadTodoState();
    }
  }, [activeModal]);

  const handleTodoToggle = async (taskText: string, isChecked: boolean) => {
    if (!isAdmin) return;
    
    const newState = { ...todoState, [taskText]: isChecked };
    setTodoState(newState);
    
    try {
      await setDoc(doc(db, 'system', 'todoState'), { states: newState }, { merge: true });
    } catch (error) {
      console.error("Error saving todo state", error);
    }
  };

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {activeModal === 'changelog' && 'יומן אירועים ועדכונים'}
            {activeModal === 'todo' && 'משימות ושדרוגים עתידיים'}
            {activeModal === 'about' && 'אודות המערכת'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {activeModal === 'changelog' && (
            <div className="prose prose-blue max-w-none text-right" dir="rtl">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{changelog}</ReactMarkdown>
            </div>
          )}
          
          {activeModal === 'todo' && (
            <div className="prose prose-blue max-w-none text-right" dir="rtl">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  li: ({ node, checked, children, ...props }) => {
                    // Check if this is a task list item
                    if (checked !== null && checked !== undefined) {
                      // Extract text content for the key
                      let textContent = '';
                      React.Children.forEach(children, child => {
                        if (typeof child === 'string') textContent += child;
                        else if (React.isValidElement(child) && child.props.children) {
                          if (typeof child.props.children === 'string') {
                            textContent += child.props.children;
                          } else if (Array.isArray(child.props.children)) {
                            textContent += child.props.children.join('');
                          }
                        }
                      });
                      
                      const key = textContent.trim().substring(0, 50); // Use first 50 chars as key
                      const isActuallyChecked = todoState[key] !== undefined ? todoState[key] : checked;
                      
                      return (
                        <li className="flex items-start gap-3 my-2 list-none" {...props}>
                          <input 
                            type="checkbox" 
                            checked={isActuallyChecked}
                            disabled={!isAdmin}
                            onChange={(e) => handleTodoToggle(key, e.target.checked)}
                            className="mt-1.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                          />
                          <span className={isActuallyChecked ? 'line-through text-gray-400' : 'text-gray-700'}>
                            {children}
                          </span>
                        </li>
                      );
                    }
                    return <li {...props}>{children}</li>;
                  }
                }}
              >
                {todo}
              </ReactMarkdown>
            </div>
          )}
          
          {activeModal === 'about' && (
            <div className="space-y-6 text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                <span className="text-4xl">✨</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pesach OS</h3>
                <p className="text-gray-600">מערכת חכמה לניהול חג הפסח</p>
                <p className="text-sm text-gray-500 mt-1">גרסה 1.0.3</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl text-right space-y-4 border border-gray-100">
                <h4 className="font-bold text-gray-900 border-b pb-2">קרדיטים ופרטי קשר</h4>
                <p className="font-medium text-blue-600">לאון יעקובוב (AnLoMinus)</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <a href="https://wa.me/972543285967" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-600 transition-colors">
                    <span className="text-lg">📱</span> 054-328-5967 (WhatsApp)
                  </a>
                  <a href="mailto:GlobalElite8200@gmail.com" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                    <span className="text-lg">📧</span> GlobalElite8200@gmail.com
                  </a>
                  <a href="https://www.linkedin.com/in/anlominus/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                    <span className="text-lg">💼</span> LinkedIn
                  </a>
                  <a href="https://github.com/Anlominus" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gray-900 transition-colors">
                    <span className="text-lg">💻</span> GitHub
                  </a>
                  <a href="https://www.facebook.com/AnlominusX" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                    <span className="text-lg">👥</span> Facebook
                  </a>
                  <a href="https://codepen.io/Anlominus" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gray-900 transition-colors">
                    <span className="text-lg">✒️</span> CodePen
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
