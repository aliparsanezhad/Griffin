import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Award, 
  Flame, 
  Share2, 
  Check, 
  Copy, 
  Gift, 
  CheckCircle2
} from 'lucide-react';
import { toPersianDigits } from '../services/tomanService';
import { LIFI_CONFIG } from '../services/lifiService';
import { playCoinDingSound, playClickSound } from '../services/soundService';

interface GriffiLoyaltyProps {
  lang: 'fa' | 'en';
  isDarkMode: boolean;
  walletAddress: string | null;
  onConnectWallet: () => void;
}

interface LoyaltyTask {
  id: string;
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

  const [tasks, setTasks] = useState<LoyaltyTask[]>([
    {
      id: 'task-checkin',
      titleFa: 'ورود روزانه و سلام به گریفی',
      titleEn: 'Daily check-in with Griffi',
      points: 25,
      completed: false,
      icon: '👋'
    },
    {
      id: 'task-first-swap',
      titleFa: 'انجام اولین سواپ بدون تحریم در شبکه لایه ۲',
      titleEn: 'First cross-chain swap on Layer 2',
      points: 150,
      completed: true,
      icon: '⚡'
    },
    {
      id: 'task-rpc-test',
      titleFa: 'تست پینگ و اتصال به نودهای RPC ضدتحریم',
      titleEn: 'Test anti-censorship RPC latency',
      points: 50,
      completed: true,
      icon: '🛡️'
    },
    {
      id: 'task-calculator',
      titleFa: 'محاسبه نرخ ریالی تتر در ماشین‌حساب هوشمند',
      titleEn: 'Calculate Toman rate with calculator',
      points: 30,
      completed: false,
      icon: '🧮'
    },
    {
      id: 'task-earn-vault',
      titleFa: 'بررسی صندوق‌های سود سالانه دیفای (Earn Vaults)',
      titleEn: 'Explore curated DeFi Earn Vaults',
      points: 80,
      completed: false,
      icon: '🌼'
    },
    {
      id: 'task-limit-order',
      titleFa: 'ثبت یک سفارش لیمیت آف‌چین بدون گس با Permit2',
      titleEn: 'Place a gasless Permit2 limit order',
      points: 60,
      completed: true,
      icon: '📈'
    },
    {
      id: 'task-audit-token',
      titleFa: 'اسکن سلامت یک قرارداد در دیدبان هانی‌پات گریفی',
      titleEn: 'Audit a token contract with Griffi Honeypot Scanner',
      points: 40,
      completed: true,
      icon: '🔍'
    },
    {
      id: 'task-cex-compare',
      titleFa: 'محاسبه صرفه‌جویی کارمزد خروج در مقایسه دکس با صرافی‌ها',
      titleEn: 'Calculate CEX vs DEX withdrawal savings',
      points: 30,
      completed: false,
      icon: '⚖️'
    },
    {
      id: 'task-paymaster',
      titleFa: 'دریافت سهمیه سوخت رایگان در جایگاه گریفین (Paymaster)',
      titleEn: 'Claim daily free fuel in Griffi Gas Station',
      points: 50,
      completed: false,
      icon: '⛽'
    },
    {
      id: 'task-smart-router',
      titleFa: 'شبیه‌سازی تفکیک استخرها در مسیریاب هوشمند چندمسیری',
      titleEn: 'Simulate liquidity split in Smart Multi-Hop Router',
      points: 45,
      completed: false,
      icon: '🔀'
    },
    {
      id: 'task-tax-statement',
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
    setCheckedInToday(true);
    setPoints(prev => prev + 25);
    setStreak(prev => prev + 1);
    setTasks(prev => prev.map(t => t.id === 'task-checkin' ? { ...t, completed: true } : t));
  };

  const handleCompleteTask = (taskId: string, taskPoints: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && !t.completed) {
        playCoinDingSound();
        setPoints(p => p + taskPoints);
        return { ...t, completed: true };
      }
      return t;
    }));
  };

  // Determine user rank level based on points
  const ranks = [
    { level: 1, nameFa: 'جوجه گریفین 🥚', nameEn: 'Baby Hatchling 🥚', minPoints: 0, image: '/mascot/griffi-egg.jpg' },
    { level: 2, nameFa: 'پیشاهنگ تیزبال 🌼', nameEn: 'Winged Scout 🌼', minPoints: 200, image: '/mascot/griffi-flower.jpg' },
    { level: 3, nameFa: 'نگهبان آسمان 👋', nameEn: 'Sky Guardian 👋', minPoints: 600, image: '/mascot/griffi-wave.jpg' },
    { level: 4, nameFa: 'شیردال اساطیری 🏆', nameEn: 'Mythical Griffin 🏆', minPoints: 1500, image: '/mascot/griffi-hero.jpg' }
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

  return (
    <div className={`w-full rounded-3xl p-6 border shadow-2xl transition-all ${
      isDarkMode 
        ? 'bg-[#100b24]/90 border-purple-500/25 text-slate-100 shadow-purple-950/30' 
        : 'bg-white border-purple-200 text-slate-800 shadow-xl'
    }`}>
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

        {/* Daily Check-in Button */}
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

      {/* Quests & Tasks List */}
      <div>
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-400" />
          <span>{isFa ? 'مأموریت‌های فعال برای کسب امتیاز:' : 'Active Loyalty Quests:'}</span>
        </h4>

        <div className="space-y-2.5">
          {tasks.map((task) => (
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
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all active:scale-95"
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
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-amber-900/20 border border-purple-500/30">
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
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 transition-all"
            >
              {copiedReferral ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReferral ? (isFa ? 'کپی شد' : 'Copied') : (isFa ? 'کپی لینک' : 'Copy')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
