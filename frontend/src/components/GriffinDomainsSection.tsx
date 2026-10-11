import React, { useState } from 'react';
import { 
  Globe, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Tag, 
  QrCode, 
  DollarSign
} from 'lucide-react';
import { toPersianDigits, formatToman, usdToToman } from '../services/tomanService';
import { playClickSound, playSwapStartSound, playSwapSuccessSound } from '../services/soundService';

interface GriffinDomainsProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
}

interface DomainRecord {
  name: string;
  tld: '.griffi' | '.iran';
  ownerAddress: string;
  registeredDate: string;
  isPrimary: boolean;
}

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

export const GriffinDomainsSection: React.FC<GriffinDomainsProps> = ({
  tomanRate,
  lang,
  isDarkMode = true,
}) => {
  const isFa = lang === 'fa';

  const [searchTerm, setSearchTerm] = useState<string>('tehran');
  const [selectedTld, setSelectedTld] = useState<'.griffi' | '.iran'>('.griffi');
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Sample registered domains for demonstration
  const [myDomains, setMyDomains] = useState<DomainRecord[]>([
    {
      name: 'rostam',
      tld: '.griffi',
      ownerAddress: '0x71C8705a2B88e3083feC7B58273683243354438F',
      registeredDate: '1403/06/15',
      isPrimary: true,
    },
    {
      name: 'shiraz',
      tld: '.iran',
      ownerAddress: '0x71C8705a2B88e3083feC7B58273683243354438F',
      registeredDate: '1403/07/02',
      isPrimary: false,
    },
  ]);

  // Clean domain name string (alphanumeric only, lowercase)
  const cleanName = searchTerm.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const fullName = `${cleanName || 'yourname'}${selectedTld}`;

  // Pricing formula: 3 chars = 30 USDT, 4 chars = 15 USDT, 5+ chars = 5 USDT
  const domainPriceUsd = cleanName.length <= 3 ? 30 : cleanName.length === 4 ? 15 : 5;
  const domainPriceToman = usdToToman(domainPriceUsd, tomanRate);

  // Availability simulation: already owned names check
  const isAvailable = !myDomains.some(d => d.name === cleanName && d.tld === selectedTld) && cleanName !== 'griffin' && cleanName !== 'admin';

  const handleRegisterDomain = () => {
    if (!cleanName || !isAvailable) return;
    playSwapStartSound();
    setIsMinting(true);

    setTimeout(() => {
      setIsMinting(false);
      const newDomain: DomainRecord = {
        name: cleanName,
        tld: selectedTld,
        ownerAddress: '0x71C8705a2B88e3083feC7B58273683243354438F',
        registeredDate: isFa ? 'هم‌اکنون' : 'Just now',
        isPrimary: myDomains.length === 0,
      };
      setMyDomains([newDomain, ...myDomains]);
      playSwapSuccessSound();
    }, 1200);
  };

  const handleSetPrimary = (name: string, tld: string) => {
    playClickSound();
    setMyDomains(prev =>
      prev.map(d => ({
        ...d,
        isPrimary: d.name === name && d.tld === tld,
      }))
    );
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopiedWallet(true);
    playClickSound();
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    playClickSound();
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <div className={`w-full rounded-3xl p-6 lg:p-8 border shadow-2xl relative overflow-hidden transition-all ${
      isDarkMode ? 'bg-[#120c24]/90 border-purple-500/30' : 'bg-white/95 border-purple-200'
    }`}>
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header with Mascot & Title */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-purple-500/20">
        <div className="flex items-center gap-4 text-right">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-purple-400/60 shadow-xl shadow-purple-500/20 shrink-0">
            <img 
              src="/mascot/griffi-domains.jpg" 
              alt="Griffi Domain Scribe" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl lg:text-2xl font-black griffin-gradient-text">
                {isFa ? 'سرویس نام‌های غیرمتمرکز وب۳ (.griffi و .iran)' : 'Decentralized Web3 Domains & Identity'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Globe className="w-3 h-3 text-amber-400" />
                Lifetime Ownership
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {isFa
                ? 'پایان آدرس‌های طولانی و گیج‌کننده رمزارزها؛ آدرس کیف‌پول خود را به یک شناسه کوتاه، خوانا و همیشگی مانند tehran.griffi تبدیل کنید بدون هزینه تمدید سالانه'
                : 'Replace confusing hex addresses with human-readable Web3 domains on Layer 2. Zero yearly renewal fees.'}
            </p>
          </div>
        </div>

        {/* Zero Renewal Badge */}
        <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
          isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">
              {isFa ? 'هزینه تمدید سالانه:' : 'Annual Renewal:'}
            </span>
            <span className="text-xs font-mono font-black text-emerald-400">
              0$ (مالکیت دائمی مادام‌العمر)
            </span>
          </div>
        </div>
      </div>

      {/* Domain Search & Register Interactive Bar */}
      <div className="my-8 max-w-3xl mx-auto">
        <div className={`p-2 rounded-2xl border flex flex-col sm:flex-row items-center gap-2 shadow-xl ${
          isDarkMode ? 'bg-black/50 border-purple-500/30' : 'bg-white border-purple-200'
        }`}>
          {/* TLD Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-purple-950/50 border border-purple-500/20 shrink-0">
            {(['.griffi', '.iran'] as const).map((tld) => (
              <button
                key={tld}
                onClick={() => {
                  playClickSound();
                  setSelectedTld(tld);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  selectedTld === tld
                    ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tld}
              </button>
            ))}
          </div>

          {/* Input text */}
          <div className="relative flex-1 w-full flex items-center">
            <Search className="w-4 h-4 text-purple-400 absolute right-3 shrink-0" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isFa ? 'نام کاربری دلخواه خود را جستجو کنید (مثلاً tehran)...' : 'Search domain (e.g. tehran)...'}
              className="w-full py-2.5 pr-10 pl-3 bg-transparent text-white font-mono text-sm focus:outline-none placeholder-slate-500 text-right"
              dir="ltr"
            />
          </div>

          {/* Action Register Button */}
          <button
            onClick={handleRegisterDomain}
            disabled={!cleanName || !isAvailable || isMinting}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-lg ${
              isAvailable && cleanName
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>
              {isMinting 
                ? (isFa ? 'در حال ثبت دامنه...' : 'Minting...') 
                : isAvailable 
                  ? (isFa ? `ثبت دامنه با $${domainPriceUsd}` : `Mint for $${domainPriceUsd}`)
                  : (isFa ? 'دامنه قبلاً رزرو شده' : 'Already Taken')
              }
            </span>
          </button>
        </div>

        {/* Live Search Status Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-3 px-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-amber-300 text-sm">{fullName}</span>
            {isAvailable ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {isFa ? 'آزاد و قابل ثبت' : 'Available'}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <XCircle className="w-3 h-3 text-rose-400" />
                {isFa ? 'رزرو شده' : 'Unavailable'}
              </span>
            )}
          </div>

          <div className="font-mono text-slate-300">
            {isFa ? 'معادل تومانی:' : 'Toman Rate:'}{' '}
            <span className="text-amber-400 font-bold">
              {isFa ? toPersianDigits(formatToman(domainPriceToman)) : formatToman(domainPriceToman)} {isFa ? 'تومان' : 'IRT'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Web3 NFT Passport Badge & My Domains */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 items-start">
        
        {/* Left Column: NFT Identity Passport Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <span className="text-xs font-bold text-slate-300 block text-right">
            {isFa ? 'کارت هویت پاسپورت وب۳ شما (پیش‌نمایش NFT):' : 'Web3 Identity NFT Passport Preview:'}
          </span>

          <div className="w-full rounded-3xl p-6 bg-gradient-to-br from-[#1a0e2e] via-[#2a134a] to-[#120824] border-2 border-amber-400/50 shadow-2xl shadow-purple-950/60 relative overflow-hidden text-right space-y-5">
            {/* Ambient gold glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-amber-400/60">
                  <img src="/mascot/griffi-avatar.jpg" alt="Mascot" className="w-full h-full object-cover" />
                </div>
                <span className="font-extrabold text-xs text-amber-300 tracking-wider">
                  GRIFFIN IDENTITY PASSPORT
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                ERC-721 NFT
              </span>
            </div>

            {/* Center Domain Display */}
            <div className="text-center py-4 bg-black/40 rounded-2xl border border-purple-500/20 space-y-1">
              <span className="text-2xl lg:text-3xl font-black font-mono griffin-gradient-text tracking-tight block">
                {fullName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Decentralized Arbitrum Layer-2 Domain
              </span>
            </div>

            {/* Resolved Wallet Address */}
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 font-mono text-xs flex items-center justify-between gap-2">
              <div className="text-left">
                <span className="text-[9px] text-slate-400 block font-sans">RESOLVED WALLET ADDRESS:</span>
                <span className="text-purple-200 font-bold truncate block max-w-[200px]">0x71C8705a2B88e3083feC7B58273683243354438F</span>
              </div>
              <QrCode className="w-6 h-6 text-amber-400 shrink-0" />
            </div>

            {/* Card Footer Details */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>{isFa ? 'شبکه: آربیتروم وان (Arbitrum)' : 'Network: Arbitrum One'}</span>
              <span>{isFa ? 'کارمزد ثبت: ۰.۰۴ دلار گس' : 'Gas: ~$0.04'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: User's Registered Domains & Pricing Guide (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* User's Domains List */}
          <div className={`p-5 rounded-2xl border ${
            isDarkMode ? 'bg-purple-950/30 border-purple-500/25' : 'bg-purple-50/70 border-purple-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-sm text-white">
                  {isFa ? 'دامنه‌های ثبت‌شده این کیف‌پول' : 'Your Registered Domains'}
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 font-bold">
                {myDomains.length} {isFa ? 'دامنه فعال' : 'Domains'}
              </span>
            </div>

            <div className="space-y-2.5">
              {myDomains.map((domain) => (
                <div
                  key={`${domain.name}${domain.tld}`}
                  className="p-3.5 rounded-xl bg-black/40 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center font-bold text-white text-xs">
                      {domain.tld === '.griffi' ? '🦅' : '🦁'}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-white">{domain.name}{domain.tld}</span>
                        {domain.isPrimary && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {isFa ? 'شناسه اصلی' : 'Primary'}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {isFa ? 'تاریخ ثبت:' : 'Registered:'} {domain.registeredDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => handleCopyAddress(`${domain.name}${domain.tld}`)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                      title="کپی آدرس دامنه"
                    >
                      {copiedAddress === `${domain.name}${domain.tld}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    {!domain.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(domain.name, domain.tld)}
                        className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 font-bold text-[10px] transition-all"
                      >
                        {isFa ? 'تنظیم به عنوان شناسه اصلی' : 'Set as Primary'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Tier Guide */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className={`p-3 rounded-2xl border ${
              isDarkMode ? 'bg-purple-950/20 border-purple-500/20' : 'bg-purple-50 border-purple-200'
            }`}>
              <span className="text-[10px] text-slate-400 block">{isFa ? '۵ حرف یا بیشتر' : '5+ Chars'}</span>
              <span className="font-mono font-black text-emerald-400 text-sm">$5 USDT</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">{isFa ? 'معمولی و خوانا' : 'Standard'}</span>
            </div>

            <div className={`p-3 rounded-2xl border ${
              isDarkMode ? 'bg-purple-950/20 border-purple-500/20' : 'bg-purple-50 border-purple-200'
            }`}>
              <span className="text-[10px] text-slate-400 block">{isFa ? '۴ حرف' : '4 Chars'}</span>
              <span className="font-mono font-black text-amber-400 text-sm">$15 USDT</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">{isFa ? 'کمیاب' : 'Rare'}</span>
            </div>

            <div className={`p-3 rounded-2xl border ${
              isDarkMode ? 'bg-purple-950/20 border-purple-500/20' : 'bg-purple-50 border-purple-200'
            }`}>
              <span className="text-[10px] text-slate-400 block">{isFa ? '۳ حرف' : '3 Chars'}</span>
              <span className="font-mono font-black text-pink-400 text-sm">$30 USDT</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">{isFa ? 'بسیار نایاب' : 'Ultra Rare'}</span>
            </div>
          </div>

          {/* Feature highlights */}
          <div className={`p-4 rounded-2xl border text-right space-y-1.5 ${
            isDarkMode ? 'bg-purple-950/20 border-purple-500/20' : 'bg-purple-50 border-purple-200'
          }`}>
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              {isFa ? 'مزایای سرویس نام‌های گریفین سواپ:' : 'Why Griffin Web3 Domains?'}
            </span>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside leading-relaxed">
              <li>{isFa ? 'دریافت رمزارز مستقیم: ارسال تتر و اتریوم با وارد کردن tehran.griffi به جای آدرس‌های طولانی 0x.' : 'Send & receive tokens using human handles.'}</li>
              <li>{isFa ? 'هزینه گس کمتر از ۲ هزار تومان روی شبکه آربیتروم در مقایسه با ۴ میلیون تومان اتریوم.' : 'Pennies in gas fees on Layer 2.'}</li>
              <li>{isFa ? 'امکان اتصال به مینی‌اپ تلگرام و نمایش نشان پاسپورت در جامعه کاربری گریفین.' : 'Telegram Mini App and community badge integration.'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Protocol Commission & Treasury Notice */}
      <div className={`mt-4 p-3 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
        isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50 border-purple-200'
      }`}>
        <div className="flex items-center gap-2 text-right">
          <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
            {isFa 
              ? 'کارمزد پروتکل گریفین سواپ (۰.۵٪) برای ثبت دامنه‌ها مستقیماً به خزانه‌داری رسمی واریز می‌شود:' 
              : 'Platform commission (0.5%) for domain mints routes directly to verified treasury:'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <code className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 text-purple-300 border border-purple-500/20">
            {COMMISSION_WALLET.slice(0, 6)}...{COMMISSION_WALLET.slice(-4)}
          </code>
          <button
            onClick={handleCopyWallet}
            className="p-1 rounded-lg hover:bg-white/10 text-purple-300 transition-colors"
            title="کپی آدرس خزانه"
          >
            {copiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={`https://etherscan.io/address/${COMMISSION_WALLET}`}
            target="_blank"
            rel="noreferrer"
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
