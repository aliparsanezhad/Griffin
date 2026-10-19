import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Search, 
  DollarSign, 
  Copy, 
  Check, 
  ExternalLink,
  UploadCloud,
  CreditCard,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';
import { playClickSound, playSwapSuccessSound } from '../services/soundService';

interface P2pEscrowSectionProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
}

interface MerchantOffer {
  id: string;
  name: string;
  reputation: number; // percentage e.g. 99.8%
  tradesCount: number;
  type: 'sell' | 'buy';
  token: string;
  priceToman: number;
  minAmountToman: number;
  maxAmountToman: number;
  paymentMethods: string[];
  avgReleaseTimeMinutes: number;
}

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

const IRANIAN_BANKS_BIN: Record<string, string> = {
  '603799': 'بانک ملی ایران',
  '610433': 'بانک ملت',
  '621986': 'بانک سامان / بلوبانک',
  '627412': 'بانک اقتصاد نوین',
  '502229': 'بانک پاسارگاد',
  '622106': 'بانک پارسیان',
  '589210': 'بانک سپه',
  '627381': 'بانک انصار',
  '505785': 'بانک ایران زمین',
  '639346': 'بانک سینا',
  '628023': 'بانک مسکن',
  '504706': 'بانک شهر',
};

export const P2pEscrowSection: React.FC<P2pEscrowSectionProps> = ({
  tomanRate,
  lang,
  isDarkMode = true,
}) => {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [selectedOffer, setSelectedOffer] = useState<MerchantOffer | null>(null);
  const [escrowAmountUsdt, setEscrowAmountUsdt] = useState<number>(500);
  const [escrowStep, setEscrowStep] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedSheba, setCopiedSheba] = useState<boolean>(false);
  const [bankTrackingId, setBankTrackingId] = useState<string>('');
  const [userCardNumber, setUserCardNumber] = useState<string>('6219 8610 ');
  const [detectedBankName, setDetectedBankName] = useState<string>('بانک سامان / بلوبانک');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState<boolean>(false);
  const [receiptVerified, setReceiptVerified] = useState<boolean>(false);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [countdownSeconds, setCountdownSeconds] = useState<number>(900);
  const [showEscrowModal, setShowEscrowModal] = useState<boolean>(false);
  const [showDisputeModal, setShowDisputeModal] = useState<boolean>(false);
  const [disputeTriggered, setDisputeTriggered] = useState<boolean>(false);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'sheba' | 'card' | 'vip'>('all');

  const handleCardNumberChange = (raw: string) => {
    const cleaned = raw.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setUserCardNumber(formatted);

    const bin = cleaned.slice(0, 6);
    if (IRANIAN_BANKS_BIN[bin]) {
      setDetectedBankName(IRANIAN_BANKS_BIN[bin]);
    } else if (cleaned.length >= 6) {
      setDetectedBankName('بانک عضو شتاب');
    } else {
      setDetectedBankName('');
    }
  };

  const handleSimulateReceiptUpload = () => {
    playClickSound();
    setIsUploadingReceipt(true);
    setReceiptFileName('fish-variz-shatna-98234581.png');
    setTimeout(() => {
      setIsUploadingReceipt(false);
      setReceiptVerified(true);
      setBankTrackingId('۹۸۲۳۴۵۸۱');
      playClickSound();
    }, 1200);
  };

  useEffect(() => {
    let timer: any;
    if (showEscrowModal && escrowStep === 2 && countdownSeconds > 0) {
      timer = setInterval(() => {
        setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showEscrowModal, escrowStep, countdownSeconds]);

  const isFa = lang === 'fa';

  const merchants: (MerchantOffer & { bankBadges: string[]; isVip: boolean })[] = [
    {
      id: 'm-1',
      name: 'آریا اکسچنج (تایید هویت طلایی)',
      reputation: 99.9,
      tradesCount: 1420,
      type: 'buy',
      token: 'USDT',
      priceToman: tomanRate - 200,
      minAmountToman: 5000000,
      maxAmountToman: 200000000,
      paymentMethods: ['پایا و ساتنا', 'کارت به کارت بانک ملت/سامان'],
      bankBadges: ['بانک ملت', 'بانک سامان'],
      isVip: true,
      avgReleaseTimeMinutes: 4,
    },
    {
      id: 'm-2',
      name: 'شیردال تریدرز (ضمانت قرارداد گریفین)',
      reputation: 99.7,
      tradesCount: 890,
      type: 'buy',
      token: 'USDT',
      priceToman: tomanRate - 150,
      minAmountToman: 10000000,
      maxAmountToman: 450000000,
      paymentMethods: ['حواله ساتنا فوری', 'بانک پاسارگاد'],
      bankBadges: ['پاسارگاد', 'ساتنا آنی'],
      isVip: true,
      avgReleaseTimeMinutes: 6,
    },
    {
      id: 'm-3',
      name: 'امیر کریپتو (مارکت میکر رسمی)',
      reputation: 98.9,
      tradesCount: 512,
      type: 'buy',
      token: 'USDT',
      priceToman: tomanRate - 100,
      minAmountToman: 2000000,
      maxAmountToman: 80000000,
      paymentMethods: ['کارت به کارت', 'پایا'],
      bankBadges: ['بانک ملی', 'کارت‌به‌کارت'],
      isVip: false,
      avgReleaseTimeMinutes: 5,
    },
    {
      id: 'm-4',
      name: 'پارس پیمنت VIP',
      reputation: 100.0,
      tradesCount: 2310,
      type: 'sell',
      token: 'USDT',
      priceToman: tomanRate + 300,
      minAmountToman: 15000000,
      maxAmountToman: 600000000,
      paymentMethods: ['پایا و ساتنا امن', 'تسويه در ۱۰ دقیقه'],
      bankBadges: ['تجارت', 'سامان'],
      isVip: true,
      avgReleaseTimeMinutes: 7,
    },
    {
      id: 'm-5',
      name: 'سینا اکسچنجر (تسویه کارت آنی)',
      reputation: 99.4,
      tradesCount: 640,
      type: 'sell',
      token: 'USDT',
      priceToman: tomanRate + 250,
      minAmountToman: 3000000,
      maxAmountToman: 120000000,
      paymentMethods: ['کارت به کارت شتابی', 'پایا'],
      bankBadges: ['بلوبانک', 'بانک ملت'],
      isVip: false,
      avgReleaseTimeMinutes: 4,
    },
  ];

  const filteredMerchants = merchants
    .filter((m) => m.type === tradeType)
    .filter((m) => {
      if (paymentFilter === 'vip') return m.isVip;
      if (paymentFilter === 'sheba') return m.paymentMethods.some(p => p.includes('پایا') || p.includes('ساتنا'));
      if (paymentFilter === 'card') return m.paymentMethods.some(p => p.includes('کارت'));
      return true;
    });

  const handleOpenEscrow = (offer: MerchantOffer) => {
    playClickSound();
    setSelectedOffer(offer);
    setEscrowStep(1);
    setBankTrackingId('');
    setCountdownSeconds(900);
    setShowEscrowModal(true);
  };

  const handleNextStep = () => {
    playClickSound();
    if (escrowStep === 1) {
      setEscrowStep(2);
    } else if (escrowStep === 2) {
      if (bankTrackingId.trim().length < 4) {
        return;
      }
      setEscrowStep(3);
      playSwapSuccessSound();
    }
  };

  const handleCopySheba = () => {
    navigator.clipboard.writeText('IR720120000000001234567890');
    setCopiedSheba(true);
    playClickSound();
    setTimeout(() => setCopiedSheba(false), 2000);
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopied(true);
    playClickSound();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full rounded-3xl p-6 lg:p-8 border shadow-2xl relative overflow-hidden transition-all ${
      isDarkMode ? 'bg-[#120c24]/90 border-purple-500/30' : 'bg-white/95 border-purple-200'
    }`}>
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header with Mascot & Title */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-purple-500/20">
        <div className="flex items-center gap-4 text-right">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-emerald-400/60 shadow-xl shadow-emerald-500/20 shrink-0">
            <img 
              src="/mascot/griffi-escrow.jpg" 
              alt="Griffi Escrow Guardian" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl lg:text-2xl font-black griffin-gradient-text">
                {isFa ? 'دیدبان همتا‌به‌همتا و اسکرو هوشمند غیرحضانتی (P2P Escrow)' : 'Griffin P2P Non-Custodial Smart Escrow'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                تضمین قرارداد هوشمند
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {isFa
                ? 'خرید و فروش مستقیم تتر با تومان بین کاربران؛ ارز دیجیتال در قرارداد هوشمند قفل شده و پس از واریز ریالی آزاد می‌شود.'
                : 'Trade USDT for Iranian Tomans peer-to-peer. Funds are securely locked in smart contracts until bank settlement.'}
            </p>
          </div>
        </div>

        {/* Buy / Sell Tab Toggle */}
        <div className={`flex items-center p-1 rounded-2xl border ${
          isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50 border-purple-200'
        }`}>
          <button
            onClick={() => {
              playClickSound();
              setTradeType('buy');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tradeType === 'buy'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{isFa ? 'خرید تتر با تومان' : 'Buy USDT'}</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              setTradeType('sell');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tradeType === 'sell'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{isFa ? 'فروش تتر به تومان' : 'Sell USDT'}</span>
          </button>
        </div>
      </div>

      {/* Escrow Mechanism Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className={`p-4 rounded-2xl border ${
          isDarkMode ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs">
            <Lock className="w-4 h-4" />
            <span>{isFa ? 'قفل هوشمند دارایی' : 'Smart Contract Lock'}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed text-right">
            {isFa 
              ? 'تترهای فروشنده تا زمان تأیید واریز ریالی در قرارداد هوشمند قفل می‌ماند و هیچ طرفی نمی‌تواند بدون اجازه آن را برداشت کند.' 
              : 'USDT remains timelocked on-chain until bank payment confirmation.'}
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDarkMode ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xs">
            <Clock className="w-4 h-4" />
            <span>{isFa ? 'حل اختلاف بی‌طرفانه با گریفی' : 'Decentralized Dispute'}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed text-right">
            {isFa 
              ? 'در صورت بروز هرگونه اختلاف، رسید پایا یا ساتنا توسط داور غیرمتمرکز بررسی شده و ارز به صاحب واقعی منتقل می‌شود.' 
              : 'Disputes are arbitrated trustlessly with verified banking transaction IDs.'}
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDarkMode ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="flex items-center gap-2 mb-2 text-purple-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>{isFa ? 'حفاظت در برابر کارت اجاره‌ای' : 'Anti-Fraud Shield'}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed text-right">
            {isFa 
              ? 'واریز تنها از شماره شبای تاییدشده صاحب کیف پول مجاز است تا خطر مسدودی حساب بانکی به صفر برسد.' 
              : 'Bank transfers must strictly match the verified account holder name.'}
          </p>
        </div>
      </div>

      {/* Paya Clearing Cycle & Anti-Fraud Live Alert */}
      <div className={`mb-4 p-3.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
        isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50 border-purple-200'
      }`}>
        <div className="flex items-center gap-2 text-right">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
            {isFa 
              ? 'سیکل تسویه بعدی پایا شاپرک: ساعت ۱۵:۴۵ • حواله ساتنا و کارت به کارت ظرف حداکثر ۱۰ دقیقه تسویه و تایید می‌گردد.' 
              : 'Next Iranian Paya cycle: 15:45 • Satna & Card transfers clear within 10 minutes.'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setShowDisputeModal(true);
          }}
          className="px-3 py-1.5 rounded-xl border font-bold text-[11px] bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>{isFa ? 'داوری و ضمانت گریفی 🛡️' : 'Griffi Guardian Arb 🛡️'}</span>
        </button>
      </div>

      {/* Merchants List Table with Filter Chips */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDarkMode ? 'bg-black/20 border-purple-500/20' : 'bg-white border-purple-200'
      }`}>
        <div className="p-4 border-b border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-purple-400" />
              {isFa ? 'صرافان و خریداران همتابه‌همتای برگزیده:' : 'Verified P2P Merchants:'}
            </span>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono text-[11px]">
            {[
              { id: 'all', label: isFa ? 'همه' : 'All' },
              { id: 'sheba', label: isFa ? 'شبا / پایا / ساتنا' : 'IBAN / Paya' },
              { id: 'card', label: isFa ? 'کارت‌به‌کارت' : 'Card' },
              { id: 'vip', label: isFa ? 'صرافان طلایی VIP' : 'VIP Only' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  playClickSound();
                  setPaymentFilter(f.id as any);
                }}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  paymentFilter === f.id
                    ? 'bg-purple-600 text-white border-purple-400 font-bold shadow-sm'
                    : isDarkMode
                      ? 'bg-purple-950/40 border-purple-500/20 text-slate-400 hover:text-white'
                      : 'bg-white border-purple-200 text-slate-600 hover:bg-purple-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-purple-500/10">
          {filteredMerchants.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              {isFa ? 'صرافی با فیلتر انتخابی شما یافت نشد.' : 'No merchants found for this filter.'}
            </div>
          ) : (
            filteredMerchants.map((merchant) => (
              <div 
                key={merchant.id}
                className={`p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
                  isDarkMode ? 'hover:bg-white/5' : 'hover:bg-purple-50/50'
                }`}
              >
                {/* Merchant Info */}
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{merchant.name}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded font-bold">
                      ★ {merchant.reputation}% ({merchant.tradesCount} معامله)
                    </span>
                    {merchant.isVip && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                        تضمین طلایی VIP
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span>روش‌ها: {merchant.paymentMethods.join(' ، ')}</span>
                    <span>•</span>
                    <span>میانگین آزادسازی: {merchant.avgReleaseTimeMinutes} دقیقه</span>
                  </div>

                  {/* Bank Badges */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {merchant.bankBadges.map((b) => (
                      <span 
                        key={b} 
                        className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-500/20 text-purple-300 font-medium"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price & Limits */}
                <div className="text-right md:text-left">
                  <span className="text-base font-extrabold text-amber-400 font-mono block">
                    {isFa ? `${toPersianDigits(formatToman(merchant.priceToman, false))} تومان` : `${formatToman(merchant.priceToman, false)} T`}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                    محدوده: {toPersianDigits(formatToman(merchant.minAmountToman, false))} تا {toPersianDigits(formatToman(merchant.maxAmountToman, false))} ت
                  </span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleOpenEscrow(merchant)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md hover:scale-105 cursor-pointer active:scale-95 ${
                    tradeType === 'buy'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20'
                      : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-rose-500/20'
                  }`}
                >
                  {tradeType === 'buy' ? (isFa ? 'خرید با اسکرو هوشمند ⚡' : 'Buy with Escrow ⚡') : (isFa ? 'فروش با اسکرو هوشمند ⚡' : 'Sell with Escrow ⚡')}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Escrow Interactive Simulation Modal */}
      {showEscrowModal && selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-lg rounded-3xl p-6 lg:p-8 border shadow-2xl relative text-right transition-all ${
            isDarkMode ? 'bg-[#120c24] border-purple-500/30' : 'bg-white border-purple-200'
          }`}>
            <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{isFa ? 'معامله اسکرو هوشمند با' : 'Smart Escrow with'} {selectedOffer.name}</span>
            </h3>

            {/* Stepper progress */}
            <div className="flex items-center justify-between my-5 text-xs font-bold text-slate-400">
              <span className={escrowStep >= 1 ? 'text-amber-400' : ''}>۱. قفل تتر در قرارداد</span>
              <span>➔</span>
              <span className={escrowStep >= 2 ? 'text-amber-400' : ''}>۲. پرداخت ریالی بانکی</span>
              <span>➔</span>
              <span className={escrowStep >= 3 ? 'text-emerald-400' : ''}>۳. آزادسازی امن</span>
            </div>

            {escrowStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isFa
                    ? 'مقدار تتر مورد نظر خود را برای شروع مبادله وارد نمایید. وجه بلافاصله در قرارداد هوشمند گریفین قفل خواهد شد.'
                    : 'Enter the USDT amount for this escrow trade.'}
                </p>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">مقدار تتر:</span>
                    <span className="font-mono text-amber-400 font-bold">{escrowAmountUsdt} USDT</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="5000"
                    step="50"
                    value={escrowAmountUsdt}
                    onChange={(e) => setEscrowAmountUsdt(Number(e.target.value))}
                    className="w-full h-2 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <div className="text-xs text-purple-300 font-semibold mt-2">
                    معادل تومانی واریزی: {toPersianDigits(formatToman(escrowAmountUsdt * selectedOffer.priceToman))} تومان
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/30"
                >
                  {isFa ? 'تایید و قفل وجه در قرارداد هوشمند' : 'Confirm & Lock Funds'}
                </button>
              </div>
            )}

            {escrowStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{isFa ? 'تترها در قرارداد هوشمند قفل شدند!' : 'USDT locked in escrow!'}</span>
                  </div>
                  {/* Countdown Timer */}
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/40 text-amber-300 font-mono text-[11px] border border-amber-500/20">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>
                      {Math.floor(countdownSeconds / 60)}:{String(countdownSeconds % 60).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Bank Sheba Card */}
                <div className="p-4 rounded-2xl bg-black/50 border border-purple-500/20 font-mono text-xs space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-sans text-[11px]">{isFa ? 'شماره شبا (بانک سامان):' : 'IBAN (Saman Bank):'}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-300 font-bold tracking-wide">IR72 0120 0000 0000 1234 5678 90</span>
                      <button
                        type="button"
                        onClick={handleCopySheba}
                        className="p-1 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 transition-colors"
                        title={isFa ? 'کپی شبا' : 'Copy IBAN'}
                      >
                        {copiedSheba ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans text-[11px]">{isFa ? 'نام صاحب حساب:' : 'Account Holder:'}</span>
                    <span className="text-white font-sans font-bold">{isFa ? 'امیررضا رضایی (تایید هویت شده)' : 'Amirreza Rezaei (Verified)'}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-purple-500/15">
                    <span className="text-slate-400 font-sans text-[11px]">{isFa ? 'مبلغ واریزی دقیق:' : 'Exact Transfer Amount:'}</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {isFa ? toPersianDigits(formatToman(escrowAmountUsdt * selectedOffer.priceToman)) : formatToman(escrowAmountUsdt * selectedOffer.priceToman)} {isFa ? 'تومان' : 'IRT'}
                    </span>
                  </div>
                </div>

                {/* Originating Bank Card Verification */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/20 space-y-2 text-right">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                      <span>{isFa ? 'کارت بانکی مبدأ (واریزکننده):' : 'Originating Bank Card:'}</span>
                    </span>
                    {detectedBankName && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                        {detectedBankName}
                      </span>
                    )}
                  </div>
                  
                  <input
                    type="text"
                    value={userCardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white font-mono text-xs text-left tracking-widest focus:outline-none focus:border-purple-400"
                    dir="ltr"
                  />

                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>{isFa ? 'تطابق هویت: کارت به نام امیررضا رضایی ثبت و تایید شده است' : 'Verified card matches KYC identity'}</span>
                  </div>
                </div>

                {/* Upload Receipt Simulator / OCR scanner */}
                <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-2.5 text-right">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isFa ? 'آپلود رسید / فیش بانکی (OCR هوشمند):' : 'Upload Bank Transfer Receipt (AI OCR):'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{isFa ? 'اختیاری جهت تسریع' : 'Optional'}</span>
                  </div>

                  {!receiptVerified ? (
                    <button
                      type="button"
                      onClick={handleSimulateReceiptUpload}
                      disabled={isUploadingReceipt}
                      className="w-full py-3 px-4 rounded-xl border border-dashed border-purple-500/40 hover:border-amber-400/60 bg-black/20 hover:bg-purple-950/40 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-300 group"
                    >
                      {isUploadingReceipt ? (
                        <>
                          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-amber-300 font-bold">{isFa ? 'در حال اسکن OCR رسید بانکی...' : 'Scanning receipt OCR...'}</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-5 h-5 text-purple-400 group-hover:text-amber-400 transition-colors" />
                          <span className="text-xs font-semibold">{isFa ? 'انتخاب یا رها کردن تصویر فیش واریز' : 'Upload receipt file (PNG, JPG, PDF)'}</span>
                          <span className="text-[10px] text-slate-500">{isFa ? 'شناسایی خودکار کد پیگیری و مبالغ واریز شده' : 'Auto-extracts transaction ID and amounts'}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-bold block">{receiptFileName}</span>
                          <span className="text-[10px] text-emerald-400/80">{isFa ? 'رسید معتبر تایید شد • کد رهگیری: ۹۸۲۳۴۵۸۱' : 'Receipt verified • Tx ID: 98234581'}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                        {isFa ? '۱۰۰٪ تطابق' : '100% Match'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Iranian Bank Tracking Code Input */}
                <div className="space-y-1.5 text-right">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                    <span>{isFa ? 'کد پیگیری تراکنش بانکی (پایا / ساتنا / کارت):' : 'Bank Reference / Tx ID:'}</span>
                    <span className="text-[10px] text-amber-400 font-normal">{isFa ? 'الزامی جهت آزادسازی' : 'Required'}</span>
                  </label>
                  <input
                    type="text"
                    value={bankTrackingId}
                    onChange={(e) => setBankTrackingId(e.target.value)}
                    placeholder={isFa ? 'مثال: ۹۸۲۳۴۵۸۱' : 'e.g. 98234581'}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white font-mono text-xs focus:outline-none focus:border-amber-400 text-left"
                    dir="ltr"
                  />
                </div>

                <button
                  onClick={handleNextStep}
                  disabled={bankTrackingId.trim().length < 4}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-purple-950 font-black text-xs shadow-md shadow-amber-500/30 hover:opacity-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {isFa ? 'تایید واریز و آزادسازی تتر توسط اسکرو' : 'Submit Bank Tx ID & Release Escrow'}
                </button>
              </div>
            )}

            {escrowStep === 3 && (
              <div className="space-y-4 text-center animate-fade-in">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-emerald-400/80 shadow-xl shadow-emerald-500/30 mx-auto">
                  <img
                    src="/mascot/griffi-escrow.jpg"
                    alt="Griffi Escrow Guardian"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-black text-white text-base">
                  {isFa ? 'تراکنش اسکرو با موفقیت تکمیل شد! 🎉' : 'Escrow Completed Successfully! 🎉'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  {isFa 
                    ? `تعداد ${escrowAmountUsdt} تتر با ضمانت قرارداد هوشمند گریفین سواپ به کیف پول شما واریز گردید.`
                    : `${escrowAmountUsdt} USDT has been safely released to your wallet via smart contract.`}
                </p>

                <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isFa ? 'کد رهگیری ثبت‌شده:' : 'Bank Ref:'}</span>
                    <span className="text-white font-bold">{bankTrackingId || '۹۸۲۳۴۵۸۱'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isFa ? 'کارمزد خزانه‌داری گریفین (۰.۵٪):' : 'Treasury Fee (0.5%):'}</span>
                    <span className="text-amber-300">0xD9C1...A2D3 ✓</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowEscrowModal(false)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
                >
                  {isFa ? 'بستن پنجره و مشاهده پورتفولیو' : 'Close'}
                </button>
              </div>
            )}

            {escrowStep !== 3 && (
              <button
                onClick={() => setShowEscrowModal(false)}
                className="w-full mt-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
              >
                {isFa ? 'انصراف' : 'Cancel'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Griffi Escrow Guardian Dispute Resolver Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-right">
          <div className="w-full max-w-lg rounded-3xl p-6 lg:p-8 border border-purple-500/40 bg-gradient-to-b from-[#190f38] via-[#100a26] to-[#0a0618] text-white shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-4 pb-4 mb-4 border-b border-purple-500/20">
              <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-emerald-400/80 shadow-lg shrink-0 bg-black/40">
                <img src="/mascot/griffi-escrow.jpg" alt="Griffi Escrow Guardian" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-black text-base griffin-gradient-text">
                  {isFa ? 'داوری و حل اختلاف هوشمند گریفی (Guardian Dispute)' : 'Griffi Trustless Escrow Arbitration'}
                </h3>
                <p className="text-xs text-slate-300">
                  {isFa ? 'مکانیزم حل اختلاف چندامضایی (Multi-Sig) قراردادهای هوشمند وب۳' : 'Decentralized 2-of-3 multi-sig protection'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300 mb-6">
              <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/20 space-y-1.5">
                <span className="font-bold text-amber-300 block">
                  {isFa ? '۱. قفل زمانی تایم‌لاک (Timelock Lock):' : '1. On-Chain Timelock:'}
                </span>
                <p>
                  {isFa
                    ? 'تا ۱۵ دقیقه پس از ثبت سفارش، تترها منحصراً در قرارداد هوشمند قفل هستند و هیچ شخص یا صرافی نمی‌تواند به آن دسترسی داشته باشد.'
                    : 'USDT is strictly locked in smart contracts for 15 minutes.'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/20 space-y-1.5">
                <span className="font-bold text-emerald-300 block">
                  {isFa ? '۲. اعتبارسنجی استعلام شماره پیگیری شبا / پایا:' : '2. Bank Receipt Verification:'}
                </span>
                <p>
                  {isFa
                    ? 'در صورت بروز اختلاف، کد رهگیری ثبت‌شده توسط خریدار با استعلام خودکار سامانه ساتنا/پایا مقایسه می‌گردد.'
                    : 'Bank tracking codes are validated automatically against clearing settlement timestamps.'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/20 space-y-1.5">
                <span className="font-bold text-purple-300 block">
                  {isFa ? '۳. تسویه قطعی به کیف‌پول کاربر:' : '3. Guaranteed Resolution:'}
                </span>
                <p>
                  {isFa
                    ? 'در صورت اثبات واریز، قرارداد دارایی را مستقیماً به کیف‌پول خریدار آزاد می‌کند؛ در غیر اینصورت، ودیعه به فروشنده بازگردانده می‌شود.'
                    : 'Funds are trustlessly unlocked to the buyer or refunded to seller based on verifiable proof.'}
                </p>
              </div>
            </div>

            {/* Active Dispute Status or Trigger Button */}
            {disputeTriggered ? (
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 space-y-2 mb-4 animate-fade-in font-mono">
                <div className="flex justify-between items-center text-amber-300 font-sans font-bold">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 animate-spin text-amber-400" />
                    <span>{isFa ? 'پرونده داوری اضطراری فعال شد' : 'Emergency Arbitration Active'}</span>
                  </span>
                  <span>کد: #ARB-9481</span>
                </div>
                <div className="flex justify-between text-[11px] font-sans text-slate-300">
                  <span>{isFa ? 'داور منصوب:' : 'Arbitrator:'}</span>
                  <span className="text-white font-bold">{isFa ? 'شورای چندامضایی گریفین (۲ از ۳)' : 'Griffin Multi-Sig (2-of-3)'}</span>
                </div>
                <div className="flex justify-between text-[11px] font-sans text-slate-300">
                  <span>{isFa ? 'زمان باقیمانده رسیدگی:' : 'Est. Time:'}</span>
                  <span className="text-emerald-400 font-bold">۱۲ دقیقه</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-purple-500/20">
                  <span>هش آن‌چین:</span>
                  <span>0x8b3f491c...21c9a4</span>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setDisputeTriggered(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 hover:opacity-95 text-purple-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{isFa ? 'ثبت درخواست داوری اضطراری با گریفی 🛡️' : 'Request Emergency Arbitration 🛡️'}</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setShowDisputeModal(false);
              }}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              {isFa ? 'بستن پنجره داوری' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Protocol Commission & Treasury Notice */}
      <div className={`mt-4 p-3 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
        isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50 border-purple-200'
      }`}>
        <div className="flex items-center gap-2 text-right">
          <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
            {isFa 
              ? 'کارمزد ضمانت اسکرو هوشمند گریفین سواپ (۰.۵٪) مستقیماً به خزانه‌داری رسمی واریز می‌شود:' 
              : 'Platform commission (0.5%) for smart escrow routes to verified treasury:'}
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
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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
