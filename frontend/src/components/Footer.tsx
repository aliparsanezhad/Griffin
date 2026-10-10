import React, { useState } from 'react';
import { 
  Heart, 
  ExternalLink, 
  HelpCircle,
  X
} from 'lucide-react';

interface FooterProps {
  lang: 'fa' | 'en';
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const isFa = lang === 'fa';
  const [showAboutModal, setShowAboutModal] = useState(false);

  return (
    <footer className="w-full border-t border-purple-500/20 glass-panel py-8 px-4 lg:px-8 mt-16 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Mission */}
        <div className="flex flex-col items-center md:items-start text-center md:text-right gap-1.5">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Griffin" className="w-6 h-6 object-contain rounded-md" />
            <span className="font-extrabold text-sm text-white griffin-gradient-text">
              {isFa ? 'گریفین سواپ (GriffinSwap)' : 'GriffinSwap'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-sm">
            {isFa 
              ? 'پل و صرافی غیرمتمرکز، چندزنجیره‌ای و ضدتحریم؛ طراحی شده برای جامعه وب۳ و رمزارز ایران'
              : 'Decentralized, non-custodial cross-chain DEX aggregator engineered for censorship resistance.'}
          </p>
        </div>

        {/* Links & About */}
        <div className="flex items-center gap-6 font-medium">
          <button
            onClick={() => setShowAboutModal(true)}
            className="hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>{isFa ? 'درباره پروژه' : 'About Griffin'}</span>
          </button>

          <a 
            href="https://docs.li.fi/" 
            target="_blank" 
            rel="noreferrer"
            className="hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            <span>{isFa ? 'مستندات LI.FI' : 'LI.FI Docs'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <a 
            href="https://jumper.exchange/" 
            target="_blank" 
            rel="noreferrer"
            className="hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            <span>{isFa ? 'اکوسیستم Jumper' : 'Jumper Ecosystem'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Made with passion & security guarantee */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>{isFa ? 'توسعه‌یافته برای جامعه فارسی‌زبان' : 'Crafted with'}</span>
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
        </div>
      </div>

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in text-right">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-purple-500/30 shadow-2xl relative text-slate-200">
            <button 
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 left-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600/30 flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">
                  {isFa ? 'پروژه گریفین سواپ (GriffinSwap)' : 'About GriffinSwap'}
                </h3>
                <span className="text-xs text-purple-300">
                  {isFa ? 'طراحی شده برای کاربران فارسی‌زبان' : 'Built for the Global Persian Web3 Community'}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                گریفین سواپ (شیردال) یک پلتفرم مبادله غیرمتمرکز، سریع و ضدتحریم است که با هدف ارتقای دسترسی آزاد هموطنان و کاربران فارسی‌زبان به امور مالی غیرمتمرکز (DeFi) توسعه داده شده است.
              </p>
              <p>
                با بهره‌گیری از پروتکل‌های قدرتمند LI.FI و Moralis، گریفین سواپ امکان انتقال نقدینگی را میان ۵۸ شبکه بلاک‌چین با کمترین کارمزد، بدون نیاز به احراز هویت (KYC) و بدون خطر مسدودسازی حساب فراهم می‌آورد.
              </p>
              <p className="text-[11px] text-amber-300 bg-amber-400/10 p-2.5 rounded-xl border border-amber-400/20">
                🔒 گریفین سواپ کاملاً غیرحضانتی (Non-Custodial) است؛ هیچ نهادی کلید خصوصی یا دارایی‌های شما را کنترل نمی‌کند.
              </p>
            </div>

            <button
              onClick={() => setShowAboutModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
            >
              {isFa ? 'بستن' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
