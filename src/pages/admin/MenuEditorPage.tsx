import React, { useState } from 'react';
import { useMockApp, CATEGORIES, Product } from '../../lib/MockAppContext';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { isFoodCategory, isNormalCocktailCategory } from '../../lib/orderUtils';

const canAttachRecipeToCategory = (category: string) => !isNormalCocktailCategory(category) && !isFoodCategory(category);

export function MenuEditorPage() {
  const { products, addProduct, updateProduct, deleteProduct, users, currentUser } = useMockApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    category: CATEGORIES[0],
    price: 0,
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80',
    isAvailable: true,
    isRecommended: false,
    isCastOriginal: false,
    castId: '',
    recipeText: '',
    notes: '',
    recommendationText: ''
  });

  const casts = users.filter(u => (u.role === 'cast' || u.role === 'admin') && !u.isDeleted);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 3000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const openNew = () => {
    setFormData({
      name: '',
      category: CATEGORIES[3], // Default to Recommended for new items
      price: 0,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1541546006121-5c3bc5e8c7b9?auto=format&fit=crop&w=400&q=80',
      isAvailable: true,
      isRecommended: false,
      isCastOriginal: false,
      castId: '',
      recipeText: '',
      notes: '',
      recommendationText: ''
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setFormData({ 
      ...product,
      recipeText: product.recipeText || '',
      notes: product.notes || '',
      recommendationText: product.recommendationText || ''
    });
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const saveProduct = async () => {
    if (!formData.name) return showToast('商品名は必須です', true);
    const canAttachRecipe = canAttachRecipeToCategory(String(formData.category));
    if (formData.category === 'キャストオリジナルカクテル' && !formData.recipeText?.trim()) {
      return showToast('オリジナルカクテルにはレシピ本文を入力してください', true);
    }
    
    const finalData = { ...formData };
    if (!canAttachRecipe) {
      finalData.recipeText = '';
      finalData.notes = '';
      finalData.recommendationText = '';
    }
    if (finalData.category !== 'キャストオリジナルカクテル') {
      finalData.isCastOriginal = false;
      finalData.castId = '';
    } else {
      finalData.isCastOriginal = true;
    }

    try {
      if (editingId) {
        await updateProduct(editingId, finalData);
      } else {
        await addProduct(finalData);
      }
      showToast('商品を保存しました');
      setIsModalOpen(false);
    } catch (e: any) {
      showToast(e?.message || '保存に失敗しました', true);
    }
  };

  const toggleStatus = async (product: Product) => {
    try {
      await updateProduct(product.id, { isAvailable: !product.isAvailable });
    } catch (e: any) {
      showToast(e?.message || '更新に失敗しました', true);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!currentUser || currentUser.role !== 'admin' || currentUser.approvalStatus !== 'approved' || currentUser.isDeleted) {
      showToast('権限がありません。商品削除は管理者のみ実行可能です。', true);
      return;
    }
    
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(productToDelete.id);
    try {
      await deleteProduct(productToDelete.id);
      showToast('商品を削除しました');
      setProductToDelete(null);
    } catch (e: any) {
      console.error("Product delete error:", e);
      showToast('削除に失敗しました: ' + e.message, true);
    } finally {
      setIsDeleting(null);
    }
  };

  const activeProducts = products.filter(p => !p.isDeleted);

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
        {successMsg && (
          <div className="bg-green-500/90 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-500/20 pointer-events-auto flex items-center gap-2">
            <Star size={16} /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-500/90 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-500/20 pointer-events-auto flex items-center gap-2">
            <X size={16} /> {errorMsg}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center bg-black/30 p-4 rounded-xl border border-[#d4af37]/20">
        <div>
          <h3 className="text-lg font-medium text-[#d4af37]">メニュー管理</h3>
          <p className="text-xs text-gray-400">登録された商品はリアルタイムで注文画面に反映されます。</p>
        </div>
        <button onClick={openNew} className="btn-gold px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Plus size={16} />
          新規登録
        </button>
      </div>

      <div className="space-y-8">
        {CATEGORIES.map(category => {
          const categoryProducts = activeProducts.filter(p => p.category === category);
          if (categoryProducts.length === 0) return null;
          
          return (
            <div key={category} className="space-y-3">
              <h4 className="font-lux text-lg text-[#d4af37] border-b border-white/10 pb-2">{category}</h4>
              <div className="grid gap-3">
                {categoryProducts.map(product => (
                  <div key={product.id} className={cn("glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between border-l-4 transition", product.isAvailable ? "border-l-green-500" : "border-l-gray-600 opacity-60")}>
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-white">{product.name}</h5>
                          {product.isRecommended && <Star size={12} className="text-[#d4af37] fill-[#d4af37]" />}
                          {!product.isAvailable && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 rounded border border-red-500/30">販売停止中</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{product.description}</p>
                        <div className="text-[#d4af37] text-sm mt-1">¥{product.price.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => toggleStatus(product)} className="w-8 h-8 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-gray-300">
                        {product.isAvailable ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button onClick={() => openEdit(product)} className="w-8 h-8 flex items-center justify-center rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product)} 
                        disabled={isDeleting === product.id}
                        className={cn("w-8 h-8 flex items-center justify-center rounded transition", isDeleting === product.id ? "bg-red-500/10 text-red-500/50" : "bg-red-500/20 hover:bg-red-500/30 text-red-500")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {productToDelete && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-red-500/30 p-6 rounded-2xl w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-red-500 flex items-center gap-2"><Trash2 size={20} />削除の確認</h3>
            <p className="text-sm text-gray-300">
              <span className="font-bold text-white">{productToDelete.name}</span> を削除しますか？<br/><br/>
              ※ 削除後、注文画面やレシピ一覧には表示されなくなります。
            </p>
            <div className="flex gap-3 pt-4">
              <button disabled={isDeleting === productToDelete.id} onClick={() => setProductToDelete(null)} className="flex-1 bg-white/5 py-3 rounded-lg text-sm hover:bg-white/10 transition">キャンセル</button>
              <button 
                disabled={isDeleting === productToDelete.id}
                onClick={confirmDelete} 
                className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2"
              >
                {isDeleting === productToDelete.id ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#d4af37]/30 p-6 rounded-2xl w-full max-w-lg space-y-6 shadow-[0_0_30px_rgba(212,175,55,0.1)] max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-xl font-lux gold-gradient-text">{editingId ? '商品を編集' : '商品を新規登録'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">商品名 <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#d4af37]" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">カテゴリー</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#d4af37]">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">価格 (円)</label>
                  <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#d4af37]" />
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 block mb-1">説明</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#d4af37] h-20" />
              </div>
              
              <div>
                <label className="text-xs text-gray-400 block mb-1">画像URL</label>
                <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#d4af37]" />
              </div>

              {canAttachRecipeToCategory(String(formData.category)) ? (
                <div className="space-y-4 border-t border-[#d4af37]/20 pt-4 mt-2">
                  <div className="flex items-center gap-2 text-[#d4af37] mb-2">
                    <Save size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">Recipe / Operation Details</span>
                  </div>
                  
                  {formData.category === 'キャストオリジナルカクテル' && (
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">担当キャスト (ID)</label>
                      <select value={formData.castId} onChange={e => setFormData({...formData, castId: e.target.value, isCastOriginal: true})} className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#d4af37]">
                         <option value="">-- 担当なし --</option>
                         {casts.map(c => <option key={c.id} value={c.id}>{c.displayName} (@{c.loginId})</option>)}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      レシピ本文
                      {formData.category === 'キャストオリジナルカクテル' && <span className="text-red-500"> *</span>}
                    </label>
                    <textarea 
                      placeholder="・ベース：〇〇&#10;・材料：〇〇&#10;・作り方：〇〇"
                      value={formData.recipeText || ''} 
                      onChange={e => setFormData({...formData, recipeText: e.target.value})} 
                      className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#d4af37] h-32 font-mono" 
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">おすすめポイント</label>
                    <input type="text" value={formData.recommendationText || ''} onChange={e => setFormData({...formData, recommendationText: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#d4af37]" placeholder="例：甘くて飲みやすいです！" />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">注意事項 (備考)</label>
                    <textarea value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#d4af37] h-20" placeholder="例：デコレーションは季節により異なります。" />
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 mt-1 italic">
                  ※ 普通/通常カクテルとフードはレシピ表示対象外です。限定メニュー・キャストオリジナル・その他にはレシピを登録できます。
                </p>
              )}
              
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isAvailable} onChange={e => setFormData({...formData, isAvailable: e.target.checked})} className="w-4 h-4 accent-[#d4af37]" />
                  <span className="text-sm">販売中にする</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isRecommended} onChange={e => setFormData({...formData, isRecommended: e.target.checked})} className="w-4 h-4 accent-[#d4af37]" />
                  <span className="text-sm">おすすめ表示 (ON)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-lg text-sm transition">キャンセル</button>
              <button onClick={saveProduct} className="flex-1 btn-gold py-3 rounded-lg text-sm flex justify-center items-center gap-2"><Save size={16}/> 保存する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
