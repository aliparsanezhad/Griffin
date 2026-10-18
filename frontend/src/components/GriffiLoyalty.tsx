import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Award, 
  Flame, 
  Share2, 
  Check, 
  Copy, 
  Gift, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink,
  Lock,
  Unlock,
  Coins
} from 'lucide-react';
import { toPersianDigits } from '../services/tomanService';
import { LIFI_CONFIG } from '../services/lifiService';
import { playCoinDingSound, playClickSound, playSwapSuccessSound } from '../services/soundService';

interface GriffiLoyaltyProps {
  lang: 'fa' | 'en';
  isDarkMode: boolean;
  walletAddress: string | null;
  onConnectWallet: () => void;
}

interface LoyaltyTask {
  id: string;
  category: 'daily' | 'defi' | 'security';
  titleFa: string;
  titleEn: string;
  points: number;
  completed: boolean;
  icon: string;
}

export const GriffiLoyalty: React.FC<GriffiLoyaltyProps> = ({
  lang,
  isDarkMode,
  walletAddress,
  onConnectWallet,
}) => {
  const isFa = lang === 'fa';
  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem('griffi_points');
    return saved ? Number(saved) : 180;
  });
  const [streak, setStreak] = useState<number>(3);
  const [checkedInToday, setCheckedInToday] = useState<boolean>(false);
  const [copiedReferral, setCopiedReferral] = useState<boolean>(false);
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'daily' | 'defi' | 'security'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(LIFI_CONFIG.feeRecipient);
    setCopiedWallet(true);
    playClickSound();
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const showFeatherToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const streakDays = [
    { day: 1, reward: 25, labelFa: 'روز ۱', labelEn: 'Day 1' },
    { day: 2, reward: 35, labelFa: 'روز ۲', labelEn: 'Day 2' },
    { day: 3, reward: 45, labelFa: 'روز ۳', labelEn: 'Day 3' },
    { day: 4, reward: 55, labelFa: 'روز ۴', labelEn: 'Day 4' },
    { day: 5, reward: 70, labelFa: 'روز ۵', labelEn: 'Day 5' },
    { day: 6, reward: 90, labelFa: 'روز ۶', labelEn: 'Day 6' },
    { day: 7, reward: 250, labelFa: 'روز ۷ 🎁', labelEn: 'Day 7 🎁', isGrand: true },
  ];

  const [tasks, setTasks] = useState<LoyaltyTask[]>([
    {
      id: 'task-checkin',
      category: 'daily',
      titleFa: 'ورود روزانه و سلام به گریفی',
      titleEn: 'Daily check-in with Griffi',
      points: 25,
      completed: false,
      icon: '👋'
    },
    {
      id: 'task-first-swap',
      category: 'defi',
      titleFa: 'انجام اولین سواپ بدون تحریم در شبکه لایه ۲',
      titleEn: 'First cross-chain swap on Layer 2',
      points: 150,
      completed: true,
      icon: '⚡'
    },
    {
      id: 'task-rpc-test',
      category: 'security',
      titleFa: 'تست پینگ و اتصال به نودهای RPC ضدتحریم',
      titleEn: 'Test anti-censorship RPC latency',
      points: 50,
      completed: true,
      icon: '🛡️'
    },
    {
      id: 'task-calculator',
      category: 'daily',
      titleFa: 'محاسبه نرخ ریالی تتر در ماشین‌حساب هوشمند',
      titleEn: 'Calculate Toman rate with calculator',
      points: 30,
      completed: false,
      icon: '🧮'
    },
    {
      id: 'task-earn-vault',
      category: 'defi',
      titleFa: 'بررسی صندوق‌های سود سالانه دیفای (Earn Vaults)',
      titleEn: 'Explore curated DeFi Earn Vaults',
      points: 80,
      completed: false,
      icon: '🌼'
    },
    {
      id: 'task-limit-order',
      category: 'defi',
      titleFa: 'ثبت یک سفارش لیمیت آف‌چین بدون گس با Permit2',
      titleEn: 'Place a gasless Permit2 limit order',
      points: 60,
      completed: true,
      icon: '📈'
    },
    {
      id: 'task-audit-token',
      category: 'security',
      titleFa: 'اسکن سلامت یک قرارداد در دیدبان هانی‌پات گریفی',
      titleEn: 'Audit a token contract with Griffi Honeypot Scanner',
      points: 40,
      completed: true,
      icon: '🔍'
    },
    {
      id: 'task-cex-compare',
      category: 'defi',
      titleFa: 'محاسبه صرفه‌جویی کارمزد خروج در مقایسه دکس با صرافی‌ها',
      titleEn: 'Calculate CEX vs DEX withdrawal savings',
      points: 30,
      completed: false,
      icon: '⚖️'
    },
    {
      id: 'task-paymaster',
      category: 'daily',
      titleFa: 'دریافت سهمیه سوخت رایگان در جایگاه گریفین (Paymaster)',
      titleEn: 'Claim daily free fuel in Griffi Gas Station',
      points: 50,
      completed: false,
      icon: '⛽'
    },
    {
      id: 'task-smart-router',
      category: 'defi',
      titleFa: 'شبیه‌سازی تفکیک استخرها در مسیریاب هوشمند چندمسیری',
      titleEn: 'Simulate liquidity split in Smart Multi-Hop Router',
      points: 45,
      completed: false,
      icon: '🔀'
    },
    {
      id: 'task-tax-statement',
      category: 'security',
      titleFa: 'بررسی و دانلود گزارش حسابداری و مالیاتی معاملات به تومان',
      titleEn: 'Inspect Web3 Tax & PnL accounting statement in Tomans',
      points: 35,
      completed: false,
      icon: '📑'
    }
  ]);

  // Sync points with localStorage
  useEffect(() => {
    localStorage.setItem('griffi_points', points.toString());
  }, [points]);

  const handleDailyCheckIn = () => {
    if (checkedInToday) return;
    playCoinDingSound();
    playSwapSuccessSound();
    setCheckedInToday(true);
    const addedPoints = 25;
    setPoints(prev => prev + addedPoints);
    setStreak(prev => prev + 1);
    setTasks(prev => prev.map(t => t.id === 'task-checkin' ? { ...t, completed: true } : t));
    showFeatherToast(isFa ? `🎉 +۲۵ پر طلایی به کیف‌پول شما اضافه شد!` : `🎉 +25 Golden Feathers added to your pass!`);
  };

  const handleCompleteTask = (taskId: string, taskPoints: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && !t.completed) {
        playCoinDingSound();
        setPoints(p => p + taskPoints);
        showFeatherToast(isFa ? `✨ +${taskPoints} پر طلایی بابت مأموریت دریافت شد!` : `✨ +${taskPoints} Feathers claimed!`);
        return { ...t, completed: true };
      }
      return t;
    }));
  };

  // Determine user rank level based on points
  const ranks = [
    { 
      level: 1, 
      nameFa: 'جوجه گریفین 🥚', 
      nameEn: 'Baby Hatchling 🥚', 
      minPoints: 0, 
      image: '/mascot/griffi-egg.jpg',
      perksFa: ['کارمزد پروتکل پایه ۰.۵٪', 'اتصال به نودهای RPC ضدتحریم', 'دسترسی کامل به مینی‌اپ تلگرام'],
      perksEn: ['Base 0.5% fee', 'Anti-censorship RPC nodes', 'Telegram Mini App access']
    },
    { 
      level: 2, 
      nameFa: 'پیشاهنگ تیزبال 🌼', 
      nameEn: 'Winged Scout 🌼', 
      minPoints: 200, 
      image: '/mascot/griffi-flower.jpg',
      perksFa: ['۱۰٪ ریبیت کارمزد گس در Paymaster', 'دسترسی به هشدارهای لحظه‌ای رادار آربیتراژ', 'هشدارهای اختصاصی ربات تلگرام'],
      perksEn: ['10% Gas rebate in Paymaster', 'Real-time Arbitrage alerts', 'Dedicated Telegram bot pings']
    },
    { 
      level: 3, 
      nameFa: 'نگهبان آسمان 👋', 
      nameEn: 'Sky Guardian 👋', 
      minPoints: 600, 
      image: '/mascot/griffi-wave.jpg',
      perksFa: ['۲۰٪ ریبیت کارمزد گس با تتر', 'تخصیص اولویت‌دار در پیش‌فروش لانچ‌پد گریفین', 'نشان VIP در کانال ارتباطی دکس'],
      perksEn: ['20% Gas rebate in USDT', 'Priority Launchpad pool quota', 'VIP chat badge']
    },
    { 
      level: 4, 
      nameFa: 'شیردال اساطیری 🏆', 
      nameEn: 'Mythical Griffin 🏆', 
      minPoints: 1500, 
      image: '/mascot/griffi-hero.jpg',
      perksFa: ['تخفیف استثنایی کارمزد سواپ تا ۰.۳۵٪', 'تسویه آنی VIP شتاب و پایا در بخش P2P', '۵۰٪ تخفیف در ثبت دامنه‌های وب۳ (.griffi)'],
      perksEn: ['0.35% discounted swap fee', 'Instant VIP Paya settlement in P2P', '50% off .griffi Web3 domain mints']
    }
  ];

  const currentRank = ranks.slice().reverse().find(r => points >= r.minPoints) || ranks[0];
  const nextRank = ranks.find(r => r.level === currentRank.level + 1);
  const progressPercent = nextRank 
    ? Math.min(100, Math.round(((points - currentRank.minPoints) / (nextRank.minPoints - currentRank.minPoints)) * 100))
    : 100;

  const referralCode = walletAddress ? walletAddress.substring(0, 8) : 'GRIFFI-77';
  const referralLink = `https://griffinswap.io/?ref=${referralCode}&treasury=${LIFI_CONFIG.feeRecipient}`;

  const handleCopyReferral = () => {
    playClickSound();
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const filteredTasks = tasks.filter(t => selectedCategory === 'all' || t.category === selectedCategory);

  return (
    <div className={`w-full rounded-3xl p-6 border shadow-2xl transition-all relative ${
      isDarkMode 
        ? 'bg-[#100b24]/90 border-purple-500/25 text-slate-100 shadow-purple-950/30' 
        : 'bg-white border-purple-200 text-slate-800 shadow-xl'
    }`}>
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 p-4 rounded-2xl bg-amber-500 text-purple-950 font-black text-xs shadow-2xl border-2 border-white flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-purple-500/20">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold mb-2">
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFa ? 'باشگاه وفاداری و ایردراپ پرهای گریفی' : 'Griffi Feathers Loyalty Pass'}</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">
            {isFa ? 'باشگاه وفاداری گریفی (Griffi Pass) 🪶' : 'Griffi Loyalty & Rewards Pass 🪶'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isFa 
              ? 'با انجام سواپ، ورود روزانه و معرفی دوستان، «پرهای گریفی» جمع‌آوری کرده و رتبه خود را ارتقا دهید.' 
              : 'Earn Griffi Feathers by swapping, checking in daily, and inviting peers.'}
          </p>
        </div>

        {/* Daily Check-in & Streak Stats */}
        <div className="flex flex-wrap items-center gap-3">
          {!walletAddress && (
            <button
              onClick={onConnectWallet}
              className="px-3.5 py-2 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-purple-200 text-xs font-bold transition-all"
            >
              {isFa ? 'اتصال کیف پول' : 'Connect Wallet'}
            </button>
          )}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{isFa ? `${toPersianDigits(streak)} روز متوالی` : `${streak} Days Streak`}</span>
          </div>

          <button
            onClick={handleDailyCheckIn}
            disabled={checkedInToday}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
              checkedInToday
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/30'
            }`}
          >
            {checkedInToday ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Sparkles className="w-4 h-4" />}
            <span>{isFa ? (checkedInToday ? 'امروز دریافت شد (+۲۵ پر)' : 'حضور روزانه (+۲۵ پر)') : (checkedInToday ? 'Claimed Today (+25)' : 'Daily Check-in (+25)')}</span>
          </button>
        </div>
      </div>

      {/* 7-Day Interactive Streak Calendar Card */}
      <div className="my-6 p-5 rounded-2xl bg-purple-950/40 border border-purple-500/25">
        <div className="flex items-center justify-between mb-3 text-right">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>{isFa ? 'زنجیره حضور هفتگی و پاداش استریک (Daily Streak Map)' : '7-Day Check-in Streak Map'}</span>
          </span>
          <span className="text-[11px] text-slate-400">
            {isFa ? 'ورود متوالی روز هفتم = ۲۵۰ پر طلایی + نشان افتخار' : 'Day 7 = 250 Feathers Bonus'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {streakDays.map((s) => {
            const isCompleted = s.day < streak || (s.day === streak && checkedInToday);
            const isCurrent = s.day === streak && !checkedInToday;

            return (
              <div 
                key={s.day}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col justify-between ${
                  isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : isCurrent
                      ? 'bg-gradient-to-b from-amber-500/20 to-purple-900/40 border-amber-400/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                      : 'bg-black/30 border-purple-500/20 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                  <span>{isFa ? s.labelFa : s.labelEn}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  ) : (
                    <Lock className="w-3 h-3 text-slate-500" />
                  )}
                </div>

                <div className="my-1.5">
                  <span className="text-base font-black font-mono text-amber-400 block">
                    +{s.reward}
                  </span>
                  <span className="text-[10px] text-purple-300 block">🪶 پر طلایی</span>
                </div>

                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 ${
                  isCompleted 
                    ? 'bg-emerald-500/20 text-emerald-300' 
                    : isCurrent 
                      ? 'bg-amber-400 text-purple-950 font-black' 
                      : 'bg-white/5 text-slate-500'
                }`}>
                  {isCompleted ? (isFa ? 'دریافت شد' : 'Claimed') : isCurrent ? (isFa ? 'امروز' : 'Today') : (isFa ? 'قفل' : 'Locked')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hero Level & Points Progression Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-6 p-5 rounded-2xl bg-purple-950/40 border border-purple-500/20">
        
        {/* Mascot Avatar for Current Rank */}
        <div className="md:col-span-4 flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-amber-400/80 shadow-xl bg-purple-900/40 shrink-0">
            <img 
              src={currentRank.image} 
              alt={currentRank.nameFa} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <span className="text-[11px] text-purple-300 block mb-0.5">{isFa ? 'سطح و عنوان فعلی:' : 'Current Rank:'}</span>
            <h4 className="text-base font-black text-amber-300">{isFa ? currentRank.nameFa : currentRank.nameEn}</h4>
            <span className="text-xs text-slate-300 font-bold block mt-1">
              سطح {currentRank.level} از ۴
            </span>
          </div>
        </div>

        {/* Progress Bar & Points Stats */}
        <div className="md:col-span-8 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-white flex items-center gap-1.5">
              <span>{isFa ? 'موجودی پرهای طلایی:' : 'Total Griffi Feathers:'}</span>
              <span className="font-mono text-amber-400 text-sm font-black">{isFa ? toPersianDigits(points) : points} 🪶</span>
            </span>
            {nextRank && (
              <span className="text-slate-400 text-[11px]">
                {isFa 
                  ? `${toPersianDigits(nextRank.minPoints - points)} پر تا رتبه بعدی (${nextRank.nameFa})` 
                  : `${nextRank.minPoints - points} to next tier`}
              </span>
            )}
          </div>

          {/* Bar */}
          <div className="w-full h-3 rounded-full bg-black/50 border border-purple-500/30 overflow-hidden p-0.5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-400 to-amber-400 transition-all duration-500 shadow-md"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 block text-left font-mono">{progressPercent}% Completed</span>
        </div>
      </div>

      {/* Tier Perks & Rewards Unlock Showcase */}
      <div className="my-6">
        <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5 text-right">
          <Award className="w-4 h-4 text-purple-400" />
          <span>{isFa ? 'امتیازات و جوایز ویژه هر سطح کاربری:' : 'Tier Privileges & Rewards Matrix:'}</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {ranks.map((r) => {
            const isUserTier = points >= r.minPoints;
            const isExactTier = currentRank.level === r.level;

            return (
              <div 
                key={r.level}
                className={`p-4 rounded-2xl border transition-all text-right flex flex-col justify-between ${
                  isExactTier
                    ? 'bg-purple-950/60 border-amber-400/60 ring-2 ring-amber-400/40 shadow-xl shadow-purple-950/40'
                    : isUserTier
                      ? 'bg-purple-950/30 border-emerald-500/30'
                      : 'bg-black/30 border-purple-500/20 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-amber-400 font-black">
                      {r.minPoints} 🪶
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isUserTier ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-500'
                    }`}>
                      {isUserTier ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      <span>{isUserTier ? (isExactTier ? (isFa ? 'سطح شما' : 'Active') : (isFa ? 'باز شده' : 'Unlocked')) : (isFa ? 'قفل' : 'Locked')}</span>
                    </span>
                  </div>

                  <h5 className="text-sm font-extrabold text-white mb-2">{isFa ? r.nameFa : r.nameEn}</h5>

                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    {(isFa ? r.perksFa : r.perksEn).map((perk, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-snug">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 pt-2 border-t border-purple-500/20 text-left">
                  <span className="text-[10px] text-slate-400 font-mono">Tier {r.level} of 4</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quests & Tasks List with Category Filter */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 text-right">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{isFa ? 'مأموریت‌های فعال برای کسب امتیاز و ایردراپ:' : 'Active Loyalty Quests & Airdrop Tasks:'}</span>
          </h4>

          {/* Category Filter Pills */}
          <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-purple-500/20 self-start sm:self-auto">
            {[
              { id: 'all', labelFa: 'همه', labelEn: 'All' },
              { id: 'daily', labelFa: 'روزانه', labelEn: 'Daily' },
              { id: 'defi', labelFa: 'دیفای و سواپ', labelEn: 'DeFi' },
              { id: 'security', labelFa: 'امنیت و نود', labelEn: 'Security' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  playClickSound();
                  setSelectedCategory(cat.id as any);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? cat.labelFa : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-right ${
                task.completed 
                  ? isDarkMode ? 'bg-purple-950/30 border-emerald-500/30' : 'bg-emerald-50/70 border-emerald-200'
                  : isDarkMode ? 'bg-purple-950/50 border-purple-500/25 hover:border-purple-500/40' : 'bg-white border-purple-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-xl p-2 rounded-xl border ${
                  isDarkMode ? 'bg-purple-900/40 border-purple-500/20' : 'bg-purple-100 border-purple-200'
                }`}>
                  {task.icon}
                </span>
                <div>
                  <span className={`text-xs font-bold block ${
                    task.completed 
                      ? isDarkMode ? 'text-emerald-400 line-through' : 'text-emerald-700 line-through'
                      : isDarkMode ? 'text-slate-100' : 'text-slate-900'
                  }`}>
                    {isFa ? task.titleFa : task.titleEn}
                  </span>
                  <span className="text-[11px] font-mono text-amber-500 dark:text-amber-400 font-semibold">
                    +{isFa ? toPersianDigits(task.points) : task.points} {isFa ? 'پر گریفی' : 'Feathers'}
                  </span>
                </div>
              </div>

              <div>
                {task.completed ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isFa ? 'انجام شد' : 'Claimed'}</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleCompleteTask(task.id, task.points)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all active:scale-95 shadow"
                  >
                    {isFa ? 'دریافت پاداش' : 'Complete Quest'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Program Banner */}
      <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-amber-900/20 border border-purple-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>{isFa ? 'برنامه ریفرال و معرفی به دوستان' : 'Referral Link'}</span>
            </span>
            <p className="text-[11px] text-slate-300">
              {isFa 
                ? 'با اشتراک لینک اختصاصی خود، دوستانتان را با صرافی بدون تحریم آشنا کنید و به ازای هر تراکنش ۱۵۰ پر هدیه بگیرید.' 
                : 'Share your personal referral link and earn 150 Feathers for every active user.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-purple-500/30 max-w-sm w-full font-mono text-xs text-purple-200">
            <span className="truncate flex-1">{referralLink}</span>
            <button
              onClick={handleCopyReferral}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 transition-all active:scale-95"
            >
              {copiedReferral ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReferral ? (isFa ? 'کپی شد' : 'Copied') : (isFa ? 'کپی لینک' : 'Copy')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verified Protocol Treasury Fee Guarantee */}
      <div className="mt-6 p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-right">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-slate-300">
            {isFa 
              ? 'کارمزد پروتکل گریفین‌سواپ در تمام معاملات پلتفرم (۰.۵٪) مستقیماً به خزانه‌داری رسمی واریز می‌گردد:' 
              : 'Platform protocol fee (0.5%) routes directly to verified treasury:'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <code className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/50 text-purple-300 border border-purple-500/20">
            {LIFI_CONFIG.feeRecipient.slice(0, 6)}...{LIFI_CONFIG.feeRecipient.slice(-4)}
          </code>
          <button
            onClick={handleCopyWallet}
            className="p-1.5 rounded-lg hover:bg-white/10 text-purple-300 transition-colors cursor-pointer"
            title="کپی آدرس خزانه"
          >
            {copiedWallet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <a
            href={`https://etherscan.io/address/${LIFI_CONFIG.feeRecipient}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="مشاهده در ایترسکن"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
