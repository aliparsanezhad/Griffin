import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  Key, 
  Globe2, 
  X, 
  ExternalLink,
  Save
} from 'lucide-react';
import { playClickSound, playSwapSuccessSound } from '../services/soundService';

interface AntiPhishingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
  onSavePhrase?: (phrase: string, emoji: string) => void;
}

export const AntiPhishingModal: React.FC<AntiPhishingModalProps> = ({
  isOpen,
  onClose,
  lang,
  isDarkMode = true,
  onSavePhrase
}) => {
  const isFa = lang === 'fa';

  // Secret Anti-Phishing phrase stored locally
  const [securityPhrase, setSecurityPhrase] = useState<string>(() => {
    return localStorage.getItem('griffi_antiphishing_phrase') || 'شیردال زرین وب۳';
  });
  const [selectedEmoji, setSelectedEmoji] = useState<string>(() => {
    return localStorage.getItem('griffi_antiphishing_emoji') || '🦅🛡️';
  });

  const [inputPhrase, setInputPhrase] = useState<string>(securityPhrase);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    setInputPhrase(securityPhrase);
  }, [securityPhrase]);

  if (!isOpen) return null;

  const handleSavePhrase = () => {
    playSwapSuccessSound();
    const clean = inputPhrase.trim() || 'شیردال زرین وب۳';
    setSecurityPhrase(clean);
    localStorage.setItem('griffi_antiphishing_phrase', clean);
    localStorage.setItem('griffi_antiphishing_emoji', selectedEmoji);
    onSavePhrase?.(clean, selectedEmoji);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const emojiOptions = ['🦅🛡️', '🦁💎', '⚡👑', '🪙✨', '🔮🔒'];

  const officialDomains = [
    { name: 'وبسایت رسمی پروتکل', url: 'https://griffinswap.io', status: 'امن و تایید شده' },
    { name: 'کانال رسمی تلگرام', url: 'https://t.me/GriffinSwap', status: 'تایید شده رسمی' },
    { name: 'ربات تلگرام و مینی‌اپ', url: 'https://t.me/GriffinSwapBot', status: 'نشان اصالت آبی' }
  ];

  const fakePhishingExamples = [
    { url: 'griffnswap.net', reasonFa: 'دامنه فیک با املای غلط برای سرقت کلید خصوصی' },
    { url: 'griffinswap-airdrop.com', reasonFa: 'صفحه درینر تقلبی برای خالی کردن موجودی ولت' },
    { url: 'grifin-swap.io', reasonFa: 'تبلیغ جعلی گوگل ادز هدایت‌کننده به قرارداد فیشینگ' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-right">
      <div className={`w-full max-w-xl rounded-3xl p-6 md:p-8 border shadow-2xl relative overflow-hidden transition-all max-h-[90vh] overflow-y-auto ${
        isDarkMode 
          ? 'bg-[#120d2d] border-purple-500/30 text-slate-100 shadow-purple-950/70' 
          : 'bg-white border-purple-200 text-slate-800 shadow-2xl'
      }`}>
        
        {/* Close Button */}
        <button 
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="absolute top-5 left-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header with 3D Mascot Sentinel */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-purple-500/20">
          <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-emerald-400/80 shadow-xl bg-black/40 shrink-0">
            <img 
              src="/mascot/griffi-phishing-shield.jpg" 
              alt="Griffi Phishing Sentinel" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isFa ? 'سپر ضد فیشینگ و راستی‌آزمایی اصالت دامنه' : 'Anti-Phishing & Domain Verifier'}</span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-white">
              {isFa ? 'امنیت ۱۰۰٪ در برابر سایت‌ها و ربات‌های جعلی' : 'Guard Against Phishing & Fake Clones'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isFa
                ? 'با تنظیم عبارت محرمانه، هر زمان وارد سایت شدید از اصالت دامنه و عدم فیشینگ بودن آن مطمئن شوید.'
                : 'Set your personal security phrase to verify you are on the genuine GriffinSwap website.'}
            </p>
          </div>
        </div>

        {/* Feature 1: Personal Anti-Phishing Phrase Configuration */}
        <div className="mt-5 p-5 rounded-2xl bg-purple-950/40 border border-purple-500/25 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-400" />
              <span>{isFa ? 'کد و عبارت ضد فیشینگ اختصاصی شما:' : 'Your Personal Anti-Phishing Phrase:'}</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              {isFa ? 'ذخیره در مرورگر (بدون ارسال به سرور)' : 'Stored Locally in Browser'}
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            {isFa
              ? 'یک جمله کوتاه یا نماد دلخواه انتخاب کنید. این کد همیشه در نوار بالای سایت نمایش داده می‌شود. اگر وارد صفحه‌ای شدید و این کد وجود نداشت، آن سایت ۱۰۰٪ فیشینگ و جعلی است!'
              : 'Choose a phrase and emoji. It will always display in the top bar. If you visit a site without it, it is a phishing clone!'}
          </p>

          {/* Emoji Picker + Text Input */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-purple-500/30">
              {emojiOptions.map(em => (
                <button
                  key={em}
                  onClick={() => {
                    playClickSound();
                    setSelectedEmoji(em);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-sm transition-all ${
                    selectedEmoji === em ? 'bg-purple-600 shadow-md scale-105' : 'hover:bg-white/10'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>

            <input 
              type="text"
              value={inputPhrase}
              onChange={(e) => setInputPhrase(e.target.value)}
              placeholder="مثلاً: شیردال زرین وب۳"
              maxLength={30}
              className="w-full bg-black/60 border border-purple-500/40 rounded-xl px-4 py-2 text-white font-bold text-xs focus:outline-none focus:border-emerald-400"
            />

            <button
              onClick={handleSavePhrase}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition-all shrink-0 active:scale-95 flex items-center justify-center gap-1.5"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? (isFa ? 'ذخیره شد!' : 'Saved!') : (isFa ? 'ذخیره' : 'Save')}</span>
            </button>
          </div>

          {/* Current Live Badge Preview */}
          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-[10px] text-slate-400">{isFa ? 'پیش‌نمایش نشان شما در هدر:' : 'Preview in Header:'}</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] shadow">
              <span>{selectedEmoji}</span>
              <span className="text-white">{securityPhrase}</span>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Feature 2: Official Verified Domains */}
        <div className="mt-5 space-y-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-purple-400" />
            <span>{isFa ? 'دامنه‌ها و کانال‌های رسمی و تاییدشده گریفین‌سواپ:' : 'Official Verified Channels:'}</span>
          </span>

          <div className="space-y-1.5">
            {officialDomains.map((dom, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-black/40 border border-purple-500/20 flex items-center justify-between text-xs">
                <div>
                  <span className="text-white font-bold block">{dom.name}</span>
                  <a href={dom.url} target="_blank" rel="noreferrer" className="text-[11px] font-mono text-purple-300 hover:underline flex items-center gap-1">
                    <span>{dom.url}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {dom.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature 3: Phishing Blacklist Radar */}
        <div className="mt-5 p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2 text-xs">
          <span className="text-rose-300 font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{isFa ? 'نمونه دامنه‌های جعلی گزارش‌شده (هرگز وارد نشوید):' : 'Known Phishing Blacklist:'}</span>
          </span>
          <div className="space-y-1.5">
            {fakePhishingExamples.map((fake, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-black/40 border border-rose-500/20 flex items-center justify-between text-[11px]">
                <span className="font-mono text-rose-400 line-through font-bold">{fake.url}</span>
                <span className="text-slate-400 text-[10px]">{fake.reasonFa}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Official Commission Wallet Guarantee */}
        <div className="mt-5 p-3 rounded-xl bg-purple-950/50 border border-purple-500/20 flex items-center justify-between text-[11px] font-mono text-slate-300">
          <span className="text-slate-400">{isFa ? 'خزانه رسمی کارمزدها:' : 'Treasury Fee Wallet:'}</span>
          <span className="text-amber-300 font-bold select-all">0xD9C10B10945D85396f0838EA045587a25FD2A2D3</span>
        </div>

      </div>
    </div>
  );
};
