import React, { useState } from 'react';
import { 
  CreditCard, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  DollarSign
} from 'lucide-react';
import { toPersianDigits, formatToman, usdToToman } from '../services/tomanService';
import { playClickSound, playSwapStartSound, playSwapSuccessSound } from '../services/soundService';

interface Web3CardsProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
}

interface VoucherItem {
  id: string;
  name: string;
  nameFa: string;
  category: 'card' | 'subscription' | 'giftcard';
  priceUsd: number;
  badge: string;
  badgeFa: string;
  descriptionFa: string;
  descriptionEn: string;
  iconText: string;
}

const VOUCHERS: VoucherItem[] = [
  {
    id: 'mastercard-50',
    name: 'Virtual Mastercard ($50)',
    nameFa: 'مسترکارت مجازی بین‌المللی ۵۰ دلاری',
    category: 'card',
    priceUsd: 50,
    badge: 'Popular',
    badgeFa: 'پرفروش‌ترین',
    descriptionFa: 'قابل استفاده در خرید اشتراک ChatGPT Plus، Claude Pro، سرورهای خارج و درگاه‌های ویزا/مستر',
    descriptionEn: 'Accepted globally for OpenAI, Claude, VPS hosting, and international checkout.',
    iconText: '💳',
  },
  {
    id: 'mastercard-100',
    name: 'Virtual Mastercard ($100)',
    nameFa: 'مسترکارت مجازی بین‌المللی ۱۰۰ دلاری',
    category: 'card',
    priceUsd: 100,
    badge: 'Zero KYC',
    badgeFa: 'بدون احراز هویت',
    descriptionFa: 'کارت اعتباری متصل به استیبل‌کوین با ۳ سال اعتبار جهت خریدهای ارزی بزرگ بدون مسدودی',
    descriptionEn: 'Prepaid 3-year validity virtual card for high-value foreign payments.',
    iconText: '💳',
  },
  {
    id: 'telegram-premium-1y',
    name: 'Telegram Premium (1 Year Gift)',
    nameFa: 'اشتراک یکساله تلگرام پریمیوم',
    category: 'subscription',
    priceUsd: 28.5,
    badge: 'Instant Activation',
    badgeFa: 'فعال‌سازی آنی',
    descriptionFa: 'لینک هدیه رسمی تلگرام؛ استوری، سرعت دانلود نامحدود، ایموجی اختصاصی و هوش مصنوعی',
    descriptionEn: 'Official Telegram Gift link for 1 year of unrestricted features.',
    iconText: '✈️',
  },
  {
    id: 'apple-gift-25',
    name: 'Apple App Store ($25)',
    nameFa: 'گیفت‌کارت اپل آیتونز ۲۵ دلاری',
    category: 'giftcard',
    priceUsd: 25,
    badge: 'US Region',
    badgeFa: 'ریجن آمریکا',
    descriptionFa: 'شارژ فوری اکانت اپل آیدی جهت خرید اپلیکیشن‌ها، بازی‌ها و فضای ابری iCloud',
    descriptionEn: 'Instant Apple ID redeem code for US App Store purchases.',
    iconText: '🍎',
  },
  {
    id: 'spotify-3m',
    name: 'Spotify Premium (3 Months)',
    nameFa: 'اشتراک ۳ ماهه اسپاتیفای پریمیوم',
    category: 'subscription',
    priceUsd: 18,
    badge: 'Family Plan',
    badgeFa: 'بدون نیاز به وی‌پی‌ان',
    descriptionFa: 'پخش موسیقی با بالاترین کیفیت، دانلود آفلاین و بدون تبلیغات مزاحم',
    descriptionEn: '3 months of ad-free high fidelity streaming with offline playback.',
    iconText: '🎵',
  },
  {
    id: 'steam-50',
    name: 'Steam Wallet Card ($50)',
    nameFa: 'گیفت‌کارت ۵۰ دلاری استیم گیمینگ',
    category: 'giftcard',
    priceUsd: 50,
    badge: 'Global Gamer',
    badgeFa: 'ریجن گلوبال',
    descriptionFa: 'شارژ مستقیم کیف‌پول استیم جهت خرید بازی‌های اورجینال کامپیوتر بدون کارمزد واسطه',
    descriptionEn: 'Global Steam wallet voucher code for direct PC game purchases.',
    iconText: '🎮',
  },
];

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

export const Web3CardsSection: React.FC<Web3CardsProps> = ({
  tomanRate,
  lang,
  isDarkMode = true,
}) => {
  const isFa = lang === 'fa';

  const [selectedVoucher, setSelectedVoucher] = useState<VoucherItem>(VOUCHERS[0]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'card' | 'subscription' | 'giftcard'>('all');
  const [showCardNumber, setShowCardNumber] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);

  const priceToman = usdToToman(selectedVoucher.priceUsd, tomanRate);

  const filteredVouchers = activeCategory === 'all'
    ? VOUCHERS
    : VOUCHERS.filter(v => v.category === activeCategory);

  const handleMintCard = () => {
    playSwapStartSound();
    setIsMinting(true);

    setTimeout(() => {
      setIsMinting(false);
      // Generate simulated voucher code
      const randSeg = () => Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `GRF-${randSeg()}-${randSeg()}-${randSeg()}`;
      setIssuedCode(code);
      playSwapSuccessSound();
    }, 1200);
  };

  const handleCopyCode = () => {
    if (!issuedCode) return;
    navigator.clipboard.writeText(issuedCode);
    setCopiedCode(true);
    playClickSound();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopiedWallet(true);
    playClickSound();
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  return (
    <div className={`w-full rounded-3xl p-6 lg:p-8 border shadow-2xl relative overflow-hidden transition-all ${
      isDarkMode ? 'bg-[#120c24]/90 border-purple-500/30' : 'bg-white/95 border-purple-200'
    }`}>
      {/* Ambient background lighting */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header with Mascot & Title */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-purple-500/20">
        <div className="flex items-center gap-4 text-right">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-purple-400/60 shadow-xl shadow-purple-500/20 shrink-0">
            <img 
              src="/mascot/griffi-card.jpg" 
              alt="Griffi Web3 Card Master" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl lg:text-2xl font-black griffin-gradient-text">
                {isFa ? 'کارت‌های اعتباری وب۳ و گیفت‌کارت‌های بین‌المللی' : 'Web3 Virtual Cards & Global Vouchers'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-400/20 text-pink-300 border border-pink-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-pink-400" />
                Zero KYC
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {isFa
                ? 'خرید مستقیم مسترکارت، تلگرام پریمیوم، اپل و اسپاتیفای با تتر و ارزهای دیجیتال؛ بدون نیاز به ویزاکارت فیزیکی یا احراز هویت بین‌المللی'
                : 'Mint prepaid virtual Mastercards and subscription vouchers directly with crypto. 100% self-custody and instant delivery.'}
            </p>
          </div>
        </div>

        {/* 100% Guaranteed Shield */}
        <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
          isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="p-2 rounded-xl bg-pink-500/20 text-pink-300">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">
              {isFa ? 'وضعیت اتصال بانکی:' : 'Card Network:'}
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isFa ? 'مسترکارت جهانی فعال' : 'Mastercard 3D Secure'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Card Interactive Preview & Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
        
        {/* Left Column: Holographic 3D Virtual Card Visual (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card Realistic Mockup Container */}
          <div className="relative w-full aspect-[1.58/1] rounded-3xl p-6 bg-gradient-to-tr from-[#1b0a2a] via-[#321147] to-[#160c38] border border-purple-400/40 shadow-2xl shadow-purple-900/50 flex flex-col justify-between overflow-hidden group">
            {/* Holographic light reflection sheen */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            
            {/* Top Card Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-purple-600 p-0.5 shadow-md">
                  <img src="/mascot/griffi-avatar.jpg" alt="Logo" className="w-full h-full object-cover rounded-[10px]" />
                </div>
                <span className="font-extrabold text-sm tracking-widest text-white">GRIFFIN PAY</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                DEBIT
              </span>
            </div>

            {/* Middle: EMV Chip & Contactless */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-inner flex items-center justify-center">
                <div className="w-7 h-5 border border-amber-800/40 rounded-sm" />
              </div>
              <div className="text-slate-400 text-xs font-mono">
                {selectedVoucher.name}
              </div>
            </div>

            {/* Card Number & Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-base md:text-lg font-black tracking-wider text-purple-100">
                <span>{showCardNumber ? '5412 8892 4102 9940' : '•••• •••• •••• 9940'}</span>
                <button
                  onClick={() => setShowCardNumber(!showCardNumber)}
                  className="p-1 text-slate-400 hover:text-white"
                  title="نمایش شماره کارت"
                >
                  {showCardNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                <div>
                  <span className="text-[9px] text-slate-400 block">CARDHOLDER</span>
                  <span className="font-bold">GRIFFI WEB3 USER</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">EXPIRES</span>
                  <span className="font-bold">09/29</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">CVV</span>
                  <span className="font-bold">{showCardNumber ? '842' : '•••'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Checkout Summary */}
          <div className={`p-5 rounded-2xl border text-right space-y-4 ${
            isDarkMode ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50 border-purple-200'
          }`}>
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <span className="text-xs text-slate-300 font-bold">{isFa ? 'مورد انتخابی:' : 'Selected:'}</span>
              <span className="text-xs font-black text-white">{isFa ? selectedVoucher.nameFa : selectedVoucher.name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">{isFa ? 'مبلغ دلاری:' : 'USD Price:'}</span>
              <span className="font-mono text-base font-black text-amber-400">${selectedVoucher.priceUsd} USDT</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">{isFa ? 'معادل تومانی روز:' : 'Toman Rate:'}</span>
              <span className="font-mono text-sm font-black text-purple-300">
                {isFa ? toPersianDigits(formatToman(priceToman)) : formatToman(priceToman)} {isFa ? 'تومان' : 'IRT'}
              </span>
            </div>

            {/* Mint Action Button */}
            <button
              onClick={handleMintCard}
              disabled={isMinting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-purple-950/50 transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {isMinting 
                  ? (isFa ? 'در حال صدور آنی کارت زنجیره‌ای...' : 'Issuing Card on Chain...') 
                  : (isFa ? `صدور و خرید آنی با ${selectedVoucher.priceUsd} تتر` : `Mint Now for $${selectedVoucher.priceUsd}`)
                }
              </span>
            </button>

            {/* Issued Code Display */}
            {issuedCode && (
              <div className="p-4 rounded-xl bg-black/60 border border-emerald-500/40 text-center space-y-2 animate-fade-in">
                <span className="text-[11px] font-bold text-emerald-300 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {isFa ? 'کارت با موفقیت صادر شد! کد ووچر شما:' : 'Card Minted Successfully! Your Voucher Code:'}
                </span>
                <div className="flex items-center justify-center gap-2 font-mono text-base font-black text-white bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30">
                  <span>{issuedCode}</span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 hover:bg-white/10 rounded text-emerald-300"
                    title="کپی کد"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Vouchers & Cards Catalog (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {[
              { id: 'all', labelFa: 'همه کارت‌ها', labelEn: 'All' },
              { id: 'card', labelFa: 'مسترکارت مجازی', labelEn: 'Mastercards' },
              { id: 'subscription', labelFa: 'اشتراک تلگرام و سرویس‌ها', labelEn: 'Subscriptions' },
              { id: 'giftcard', labelFa: 'گیفت‌کارت اپل و استیم', labelEn: 'Gift Cards' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  playClickSound();
                  setActiveCategory(cat.id as any);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : isDarkMode
                      ? 'bg-purple-950/30 text-slate-400 hover:text-white border border-purple-500/20'
                      : 'bg-purple-50 text-slate-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                {isFa ? cat.labelFa : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Cards List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredVouchers.map((voucher) => {
              const isSelected = selectedVoucher.id === voucher.id;
              const itemToman = usdToToman(voucher.priceUsd, tomanRate);

              return (
                <div
                  key={voucher.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedVoucher(voucher);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 text-right flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-900/30 border-pink-400/80 shadow-xl shadow-pink-500/10 ring-1 ring-pink-400'
                      : isDarkMode
                        ? 'bg-purple-950/20 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-950/40'
                        : 'bg-white border-purple-200 hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{voucher.iconText}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        {isFa ? voucher.badgeFa : voucher.badge}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-white">
                      {isFa ? voucher.nameFa : voucher.name}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {isFa ? voucher.descriptionFa : voucher.descriptionEn}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-purple-500/15 mt-3 flex items-center justify-between font-mono">
                    <span className="text-xs font-black text-amber-400">${voucher.priceUsd}</span>
                    <span className="text-[10px] text-purple-300">
                      {isFa ? toPersianDigits(formatToman(itemToman)) : formatToman(itemToman)} ت
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Privacy & Anti-Sanctions Notice Box */}
          <div className={`p-4 rounded-2xl border text-right space-y-1.5 ${
            isDarkMode ? 'bg-purple-950/20 border-purple-500/20' : 'bg-purple-50 border-purple-200'
          }`}>
            <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-pink-400" />
              {isFa ? 'ضمانت اصالت و امنیت کارت‌های گریفین سواپ:' : 'Guaranteed Security & Delivery:'}
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isFa
                ? 'تمام کارت‌ها و اشتراک‌ها به صورت مستقیم از طریق شبکه‌های رسمی صادر شده و فاقد اطلاعات هویتی شخصی (Zero-KYC) هستند. هیچ خطری از بابت مسدودی حساب یا قوانین تحریمی وجود ندارد.'
                : 'All vouchers and debit credentials are created pseudonymously to protect Iranian users from international banking geoblocking.'}
            </p>
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
              ? 'کارمزد پروتکل گریفین سواپ (۰.۵٪) برای صدور کارت‌های وب۳ مستقیماً به خزانه‌داری رسمی واریز می‌شود:' 
              : 'Platform commission (0.5%) for Web3 cards routes directly to verified treasury:'}
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
