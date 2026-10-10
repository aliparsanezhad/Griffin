import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  AlertTriangle, 
  Globe2, 
  HelpCircle
} from 'lucide-react';
import { ANTI_CENSORSHIP_RPCS, IRANIAN_SECURITY_TIPS } from '../services/securityTips';

interface SecurityHubProps {
  lang: 'fa' | 'en';
}

export const SecurityHub: React.FC<SecurityHubProps> = ({ lang }) => {
  const isFa = lang === 'fa';
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="w-full py-6 px-4 max-w-5xl mx-auto animate-fade-in space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-semibold text-emerald-300 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isFa ? 'مرکز امنیت، حریم خصوصی و ضدتحریم' : 'Anti-Censorship & Privacy Hub'}</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold griffin-gradient-text">
          {isFa ? 'راهنمای حفظ امنیت کاربر ایرانی در وب۳' : 'Iranian Web3 Safety Guide'}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          {isFa
            ? 'لیست ارائه‌دهندگان RPC آزاد، روش‌های دور زدن خطای ۴۰۳ و قوانین محافظت از سرمایه در برابر تحریم‌ها'
            : 'Uncensored RPC endpoints and best practices to safeguard assets against geoblocking.'}
        </p>
      </div>

      {/* Safety Tips Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {IRANIAN_SECURITY_TIPS.map((tip) => (
          <div
            key={tip.id}
            className={`glass-panel p-5 rounded-2xl border ${
              tip.critical 
                ? 'border-purple-500/30 bg-purple-950/20 shadow-purple-900/10' 
                : 'border-purple-500/15'
            } shadow-lg space-y-2`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20">
                {tip.badge}
              </span>
              {tip.critical && (
                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {isFa ? 'نکته حیاتی' : 'Critical'}
                </span>
              )}
            </div>
            <h3 className="font-extrabold text-white text-sm">{tip.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{tip.description}</p>
          </div>
        ))}
      </div>

      {/* Recommended Anti-Censorship RPCs */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-purple-500/25 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-emerald-400" />
              <span>{isFa ? 'آدرس‌های RPC آزاد و ضدتحریم (بدون فیلتر و تحریم)' : 'Recommended Anti-Censorship RPCs'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isFa
                ? 'برای حل مشکل ارور ۴۰۳ در متامسک یا ربی، آدرس RPC شبکه خود را به یکی از این موارد تغییر دهید:'
                : 'Replace default wallet RPCs with these privacy-first endpoints to bypass 403 errors.'}
            </p>
          </div>
        </div>

        <div className="divide-y divide-purple-500/10">
          {ANTI_CENSORSHIP_RPCS.map((rpc) => (
            <div key={rpc.url} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{rpc.chain}</span>
                  <span className="text-[10px] text-slate-400">({rpc.name})</span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.2 rounded-full">
                    {rpc.privacyRating}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{rpc.features}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/20 font-mono text-[11px] text-purple-200 select-all max-w-xs truncate">
                  {rpc.url}
                </div>
                <button
                  onClick={() => handleCopy(rpc.url)}
                  className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white transition-colors"
                  title="کپی آدرس RPC"
                >
                  {copiedUrl === rpc.url ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tutorial: How to change RPC in MetaMask / Rabby */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 bg-purple-950/20 text-xs text-slate-300 space-y-3">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-purple-400" />
          <span>{isFa ? 'چگونه RPC را در متامسک (MetaMask) تغییر دهیم؟' : 'How to Change RPC in MetaMask'}</span>
        </h4>
        <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
          <li>{isFa ? 'وارد متامسک شوید و روی علامت شبکه در بالای صفحه کلیک کنید.' : 'Open MetaMask and click network selector.'}</li>
          <li>{isFa ? 'گزینه Add Network یا تنظیمات شبکه مورد نظر را انتخاب نمایید.' : 'Select network settings.'}</li>
          <li>{isFa ? 'در کادر New RPC URL، یکی از آدرس‌های جدول بالا (مثلاً 1RPC) را جایگزین کنید.' : 'Paste the custom RPC URL into the New RPC URL field.'}</li>
          <li>{isFa ? 'روی دکمه Save کلیک کنید. اکنون بدون نیاز به تغییر آی‌پی یا فیلترشکن به شبکه متصل هستید.' : 'Click Save. Your wallet will now connect seamlessly.'}</li>
        </ol>
      </div>
    </div>
  );
};
