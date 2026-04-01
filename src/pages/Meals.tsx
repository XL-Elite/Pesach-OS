import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Utensils, ShoppingCart, Package, Plus, CheckCircle2, Circle, Trash2, Wand2 } from 'lucide-react';

export function Meals({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState('menu');
  const [guests, setGuests] = useState(10);
  const [style, setStyle] = useState('traditional');
  const [generatedMenu, setGeneratedMenu] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'inventoryItems'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const generateMenu = () => {
    const menu = style === 'traditional' ? [
      { name: 'מרק עוף עם קניידלך', qty: guests },
      { name: 'גפילטע פיש', qty: guests },
      { name: 'צלי בקר (בריסקט)', qty: (guests * 0.2).toFixed(1) + ' ק"ג' },
      { name: 'קוגל תפוחי אדמה', qty: Math.ceil(guests / 5) + ' תבניות' },
      { name: 'צימעס', qty: Math.ceil(guests / 5) + ' קערות' },
      { name: 'עוגיות בוטנים וקוקוס', qty: guests * 3 }
    ] : [
      { name: 'סביצ\'ה סלמון', qty: guests },
      { name: 'סלט קינואה חגיגי', qty: Math.ceil(guests / 4) + ' קערות' },
      { name: 'עוף צלוי בעשבי תיבול', qty: Math.ceil(guests / 4) + ' עופות' },
      { name: 'אספרגוס צלוי', qty: (guests * 0.15).toFixed(1) + ' ק"ג' },
      { name: 'עוגת שוקולד ללא קמח', qty: Math.ceil(guests / 8) + ' עוגות' }
    ];
    setGeneratedMenu({ title: `תפריט ${style === 'traditional' ? 'מסורתי' : 'מודרני'} ל-${guests} סועדים`, items: menu });
  };

  const saveMenuAndShoppingList = async () => {
    if (!generatedMenu) return;
    
    // Add items to shopping list
    for (const item of generatedMenu.items) {
      await addDoc(collection(db, 'inventoryItems'), {
        userId: user.uid,
        name: `${item.name} (${item.qty})`,
        category: 'food',
        isPurchased: false,
        createdAt: serverTimestamp()
      });
    }
    
    setActiveTab('shopping');
    setGeneratedMenu(null);
  };

  const addInventoryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    await addDoc(collection(db, 'inventoryItems'), {
      userId: user.uid,
      name: newItemName,
      category: 'general',
      isPurchased: false,
      createdAt: serverTimestamp()
    });
    setNewItemName('');
  };

  const toggleItem = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'inventoryItems', id), { isPurchased: !current });
  };

  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, 'inventoryItems', id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">תפריטים וקניות</h1>
        <p className="text-gray-600 mt-1">תכנון סעודות החג וניהול מלאי חכם</p>
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        <button onClick={() => setActiveTab('menu')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === 'menu' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}><Utensils size={18} /> תכנון תפריט</button>
        <button onClick={() => setActiveTab('shopping')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === 'shopping' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}><ShoppingCart size={18} /> רשימת קניות</button>
        <button onClick={() => setActiveTab('inventory')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === 'inventory' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}><Package size={18} /> מלאי בבית</button>
      </div>

      {activeTab === 'menu' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">כמות סועדים</label>
              <input type="number" min="1" value={guests} onChange={e => setGuests(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סגנון ארוחה</label>
              <select value={style} onChange={e => setStyle(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="traditional">מסורתי (קניידלך, גפילטע...)</option>
                <option value="modern">מודרני (סביצ'ה, קינואה...)</option>
              </select>
            </div>
          </div>
          <button onClick={generateMenu} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <Wand2 size={20} /> צור תפריט אוטומטי
          </button>

          {generatedMenu && (
            <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="text-xl font-bold text-blue-900 mb-4">{generatedMenu.title}</h3>
              <ul className="space-y-2 mb-6">
                {generatedMenu.items.map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span className="text-gray-500 text-sm">{item.qty}</span>
                  </li>
                ))}
              </ul>
              <button onClick={saveMenuAndShoppingList} className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                <ShoppingCart size={20} /> הוסף מצרכים לרשימת הקניות
              </button>
            </div>
          )}
        </div>
      )}

      {(activeTab === 'shopping' || activeTab === 'inventory') && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <form onSubmit={addInventoryItem} className="flex gap-2">
            <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="הוסף פריט חדש..." className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            <button type="submit" disabled={!newItemName.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"><Plus size={24} /></button>
          </form>

          <div className="space-y-2">
            {inventory.filter(item => activeTab === 'shopping' ? !item.isPurchased : item.isPurchased).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleItem(item.id, item.isPurchased)}>
                  <button className={`text-${item.isPurchased ? 'green-500' : 'gray-400'}`}>
                    {item.isPurchased ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>
                  <span className={`text-lg ${item.isPurchased ? 'line-through text-gray-500' : 'text-gray-900'}`}>{item.name}</span>
                </div>
                <button onClick={() => deleteItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
              </div>
            ))}
            {inventory.filter(item => activeTab === 'shopping' ? !item.isPurchased : item.isPurchased).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                אין פריטים ברשימה זו.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
