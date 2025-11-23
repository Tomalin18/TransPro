"use client";

import { useState, useEffect } from "react";
import { Book, Globe, Save, Sparkles, Copy, Check, Trash2, History, X, Settings } from "lucide-react";
import { translateText, TranslationData } from "@/actions/translate";

interface FavoriteItem {
  id: string;
  source: string;
  context: string;
  result: TranslationData;
  timestamp: number;
}

export default function Home() {
  // 輸入狀態
  const [apiKey, setApiKey] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [industryContext, setIndustryContext] = useState("");

  // 輸出狀態
  const [translations, setTranslations] = useState<TranslationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 收藏與設定狀態
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 初始化：讀取 LocalStorage
  useEffect(() => {
    const storedKey = localStorage.getItem("openai_api_key");
    if (storedKey) setApiKey(storedKey);

    const storedFavs = localStorage.getItem("transpro_favorites");
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  // API Key 變更處理
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setApiKey(value);
    localStorage.setItem("openai_api_key", value);
  };

  // 翻譯功能
  const handleTranslate = async () => {
    if (!apiKey) {
      setShowSettings(true); // 如果沒有 Key，自動打開設定
      alert("請先設定 OpenAI API Key");
      return;
    }
    if (!sourceText) return;

    setIsLoading(true);
    setTranslations(null);

    try {
      const result = await translateText(apiKey, sourceText, industryContext);
      
      if (result.success && result.data) {
        setTranslations(result.data);
      } else {
        alert(result.error || "翻譯發生錯誤，請檢查 API Key 或網路連線");
      }
    } catch (error) {
      alert("發生未預期的錯誤");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 加入收藏
  const handleSaveFavorite = () => {
    if (!translations || !sourceText) return;
    
    const newItem: FavoriteItem = {
      id: Date.now().toString(),
      source: sourceText,
      context: industryContext,
      result: translations,
      timestamp: Date.now(),
    };
    
    const newFavorites = [newItem, ...favorites];
    setFavorites(newFavorites);
    localStorage.setItem("transpro_favorites", JSON.stringify(newFavorites));
    alert("已加入收藏！");
  };

  // 刪除收藏
  const handleDeleteFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("確定要刪除此收藏嗎？")) return;
    
    const newFavorites = favorites.filter(item => item.id !== id);
    setFavorites(newFavorites);
    localStorage.setItem("transpro_favorites", JSON.stringify(newFavorites));
  };

  // 載入收藏
  const handleLoadFavorite = (item: FavoriteItem) => {
    setSourceText(item.source);
    setIndustryContext(item.context);
    setTranslations(item.result);
    setShowFavorites(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">TransPro 翻譯助手</h1>
          </div>
          <div className="flex items-center gap-2">
             <button 
              onClick={() => setShowFavorites(!showFavorites)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <History className="w-5 h-5" />
              <span className="hidden sm:inline">收藏 ({favorites.length})</span>
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block"></div>
            <button 
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition px-3 py-2 rounded-lg hover:bg-gray-100"
              title="API 設定"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 設定 Dialog */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           {/* 背景遮罩 */}
           <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowSettings(false)}
          />
          
          {/* Dialog 內容 */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative z-10 animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                 <Settings className="w-6 h-6 text-blue-600" /> 設定
               </h2>
               <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                 </label>
                 <input
                  type="password"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="sk-..."
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                 />
                 <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  您的 Key 僅會儲存在本地瀏覽器 (LocalStorage)，直接與 OpenAI 伺服器通訊，不會上傳至我們的後端伺服器。
                 </p>
               </div>
               
               <div className="pt-2 flex justify-end">
                 <button 
                   onClick={() => setShowSettings(false)}
                   className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                 >
                   完成
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* 收藏列表側邊欄 (Drawer) */}
      {showFavorites && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowFavorites(false)}
          />
          
          {/* 側邊欄內容 */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Save className="w-5 h-5 text-blue-600" /> 我的收藏
              </h2>
              <button onClick={() => setShowFavorites(false)} className="p-2 hover:bg-gray-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {favorites.length === 0 ? (
                <div className="text-center text-gray-400 py-10">
                  暫無收藏內容
                </div>
              ) : (
                favorites.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleLoadFavorite(item)}
                    className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition cursor-pointer relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                      <button 
                        onClick={(e) => handleDeleteFavorite(item.id, e)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-medium text-gray-800 line-clamp-2 mb-2">{item.source}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                       {item.context ? `[${item.context}]` : '[無背景]'} • {item.result.zh.substring(0, 20)}...
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 左側：輸入區 (佔 5/12) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 移除原本的 API Key 設定區塊 */}

            {/* 翻譯輸入 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    產業背景 / 上下文
                  </label>
                  <input
                    type="text"
                    value={industryContext}
                    onChange={(e) => setIndustryContext(e.target.value)}
                    placeholder="例如：醫學、法律、遊戲在地化..."
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    欲翻譯內容
                  </label>
                  <textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="請輸入中文、英文或日文..."
                    className="w-full h-48 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                  />
                </div>

                <button
                  onClick={handleTranslate}
                  disabled={isLoading || !sourceText}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin">⌛</span> 翻譯中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" /> 開始翻譯
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 右側：輸出區 (佔 7/12) */}
          <div className="lg:col-span-7 space-y-6">
            {!translations && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[400px] bg-white rounded-xl border border-dashed border-gray-300">
                <Book className="w-12 h-12 mb-4 opacity-20" />
                <p>輸入內容並開始翻譯，結果將顯示於此</p>
              </div>
            )}

            {isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[400px] bg-white rounded-xl border border-dashed border-gray-300">
                 <span className="animate-pulse">正在思考翻譯與術語解釋...</span>
              </div>
            )}

            {translations && !isLoading && (
              <>
                <UnifiedResultCard data={translations} />
                
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                  <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                    <Book className="w-5 h-5" /> 名詞解釋 & 背景知識
                  </h3>
                  <div className="prose prose-amber max-w-none whitespace-pre-wrap text-gray-800">
                    {translations.terms}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={handleSaveFavorite}
                    className="flex items-center gap-2 bg-gray-800 text-white px-6 py-2 rounded-full hover:bg-gray-700 transition shadow-lg active:scale-95"
                  >
                    <Save className="w-4 h-4" /> 加入收藏
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// 整合型顯示卡片 (含 Tab 切換)
function UnifiedResultCard({ data }: { data: TranslationData }) {
  const [activeTab, setActiveTab] = useState<'zh' | 'en' | 'ja'>('zh');
  const [copied, setCopied] = useState(false);

  const getContent = () => {
    switch (activeTab) {
      case 'zh': return data.zh;
      case 'en': return data.en;
      case 'ja': return data.ja;
      default: return data.zh;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition min-h-[200px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">翻譯結果</h3>
        
        {/* 右上角控制區：Tabs + Copy */}
        <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg border border-gray-200">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('zh')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                activeTab === 'zh' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              繁體中文
            </button>
            <button
              onClick={() => setActiveTab('en')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                activeTab === 'en' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setActiveTab('ja')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                activeTab === 'ja' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              日本語
            </button>
          </div>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          <button 
            onClick={handleCopy}
            className="text-gray-400 hover:text-blue-600 transition p-1 mr-1"
            title="複製當前內容"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      <div className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-300 key={activeTab}">
        {getContent()}
      </div>
    </div>
  );
}
