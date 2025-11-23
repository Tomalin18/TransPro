"use client";

import { useState, useEffect } from "react";
import { Book, Globe, Save, Sparkles, Copy, Check, Trash2, History, X, Settings, ChevronUp } from "lucide-react";
import { translateText, TranslationData } from "@/actions/translate";
import { ThemeToggle } from "@/components/theme-toggle";

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
  const [showResultDrawer, setShowResultDrawer] = useState(false);
  
  // Tab 狀態 (提升到這裡以便連動名詞解釋)
  const [resultTab, setResultTab] = useState<'zh' | 'en' | 'ja'>('zh');

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
    setShowResultDrawer(false);

    try {
      const result = await translateText(apiKey, sourceText, industryContext);
      
      if (result.success && result.data) {
        setTranslations(result.data);
        setShowResultDrawer(true); // 翻譯成功後打開抽屜
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
    setShowResultDrawer(true); // 載入收藏後直接打開結果
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 relative transition-colors duration-300 pb-24">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">TransPro</h1>
          </div>
          <div className="flex items-center gap-2">
             <button 
              onClick={() => setShowFavorites(!showFavorites)}
              className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <History className="w-5 h-5" />
              <span className="hidden sm:inline">收藏 ({favorites.length})</span>
            </button>
            
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block"></div>
            
            <ThemeToggle />

            <button 
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="API 設定"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 設定 Dialog */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ touchAction: 'none' }}>
           {/* 背景遮罩 */}
           <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowSettings(false)}
          />
          
          {/* Dialog 內容 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative z-10 animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                 <Settings className="w-6 h-6 text-zinc-900 dark:text-white" /> 設定
               </h2>
               <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  OpenAI API Key
                 </label>
                 <input
                  type="password"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="sk-..."
                  className="w-full p-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 focus:border-transparent outline-none transition text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600"
                 />
                 <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                  您的 Key 僅會儲存在本地瀏覽器 (LocalStorage)，直接與 OpenAI 伺服器通訊，不會上傳至我們的後端伺服器。
                 </p>
               </div>
               
               <div className="pt-2 flex justify-end">
                 <button 
                   onClick={() => setShowSettings(false)}
                   className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition font-medium"
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
        <div className="fixed inset-0 z-50 flex justify-end" style={{ touchAction: 'pan-y' }}>
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowFavorites(false)}
          />
          
          {/* 側邊欄內容 */}
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Save className="w-5 h-5 text-zinc-900 dark:text-white" /> 我的收藏
              </h2>
              <button onClick={() => setShowFavorites(false)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {favorites.length === 0 ? (
                <div className="text-center text-zinc-400 dark:text-zinc-600 py-10">
                  暫無收藏內容
                </div>
              ) : (
                favorites.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleLoadFavorite(item)}
                    className="group bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition cursor-pointer relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                      <button 
                        onClick={(e) => handleDeleteFavorite(item.id, e)}
                        className="text-zinc-400 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2 mb-2">{item.source}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                       {item.context ? `[${item.context}]` : '[無背景]'} • {item.result.zh.substring(0, 20)}...
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* 單欄輸入區 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 h-fit">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  產業背景 / 上下文
                </label>
                <input
                  type="text"
                  value={industryContext}
                  onChange={(e) => setIndustryContext(e.target.value)}
                  placeholder="例如：醫學、法律、遊戲在地化..."
                  className="w-full p-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 outline-none transition text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  欲翻譯內容
                </label>
                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="請輸入中文、英文或日文..."
                  className="w-full h-48 p-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 outline-none transition resize-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600"
                />
              </div>

              <button
                onClick={handleTranslate}
                disabled={isLoading || !sourceText}
                className="w-full bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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
      </main>

      {/* 重新打開結果的浮動按鈕 (當有結果但抽屜被關閉時顯示) */}
      {translations && !showResultDrawer && (
        <div className="fixed bottom-8 right-8 z-40 animate-in zoom-in pointer-events-auto">
          <button
            onClick={() => setShowResultDrawer(true)}
            className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-3 rounded-full shadow-xl hover:scale-105 transition-transform font-medium"
          >
            <ChevronUp className="w-5 h-5" />
            查看結果
          </button>
        </div>
      )}

      {/* 結果抽屜 (Bottom Drawer) */}
      {showResultDrawer && translations && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ touchAction: 'none' }}>
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowResultDrawer(false)}
          />
          
          {/* Drawer 內容 */}
          <div 
            className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-t-2xl shadow-2xl border-t border-zinc-200 dark:border-zinc-800 max-h-[85vh] flex flex-col relative z-10 animate-in slide-in-from-bottom duration-300"
            style={{ touchAction: 'pan-y' }}
          >
            {/* Drawer Handle / Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 rounded-t-2xl sticky top-0 z-20">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-zinc-900 dark:text-white" /> 翻譯結果
              </h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleSaveFavorite}
                  className="flex items-center gap-1.5 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-1.5 rounded-full hover:opacity-90 transition"
                >
                  <Save className="w-4 h-4" /> 收藏
                </button>
                <button onClick={() => setShowResultDrawer(false)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               <UnifiedResultCard 
                data={translations} 
                activeTab={resultTab}
                setActiveTab={setResultTab}
               />
                
               <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                 <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                   <Book className="w-5 h-5" /> 名詞解釋 & 背景知識
                   <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 ml-2 px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded">
                     {resultTab === 'zh' ? '繁體中文' : resultTab === 'en' ? 'English' : '日本語'}
                   </span>
                 </h3>
                 <div 
                  key={resultTab} // 觸發動畫
                  className="prose prose-zinc dark:prose-invert max-w-none whitespace-pre-wrap text-zinc-800 dark:text-zinc-300 leading-relaxed animate-in fade-in duration-300"
                 >
                   {typeof translations.terms === 'string' 
                     ? translations.terms // 向下相容舊資料 (如果 localStorage 有舊格式)
                     : translations.terms[resultTab] // 顯示對應語言的名詞解釋
                   }
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 整合型顯示卡片 (含 Tab 切換)
function UnifiedResultCard({ 
  data, 
  activeTab, 
  setActiveTab 
}: { 
  data: TranslationData; 
  activeTab: 'zh' | 'en' | 'ja';
  setActiveTab: (tab: 'zh' | 'en' | 'ja') => void;
}) {
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
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition min-h-[200px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">翻譯結果</h3>
        
        {/* 右上角控制區：Tabs + Copy */}
        <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('zh')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                activeTab === 'zh' 
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              繁體中文
            </button>
            <button
              onClick={() => setActiveTab('en')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                activeTab === 'en' 
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setActiveTab('ja')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                activeTab === 'ja' 
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              日本語
            </button>
          </div>
          <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-600 mx-1"></div>
          <button 
            onClick={handleCopy}
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition p-1 mr-1"
            title="複製當前內容"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      <div className="text-lg text-zinc-800 dark:text-zinc-100 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-300 key={activeTab}">
        {getContent()}
      </div>
    </div>
  );
}
