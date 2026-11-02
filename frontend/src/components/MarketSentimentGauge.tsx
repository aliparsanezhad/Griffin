import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  ArrowRight, 
  DollarSign, 
  Copy, 
  Check, 
  ExternalLink,
  Flame,
  Activity,
  TrendingUp,
  Clock,
  Layers,
  Zap,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { playClickSound, playSwapSuccessSound } from '../services/soundService';
import { toPersianDigits, formatToman } from '../services/tomanService';

interface MarketSentimentGaugeProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
  onNavigateSwap?: () => void;
  onNavigateDca?: () => void;
}

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

interface WhaleMovement {
  id: string;
  type: 'deposit' | 'withdrawal' | 'swap' | 'mint';
  asset: string;
  amount: string;
  usdValue: string;
  chain: string;
  chainColor: string;
  timeAgoFa: string;
  timeAgoEn: string;
  descriptionFa: string;
  descriptionEn: string;
}

export const MarketSentimentGauge: React.FC<MarketSentimentGaugeProps> = ({
  tomanRate,
  lang,
  isDarkMode = true,
  onNavigateSwap,
  onNavigateDca,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const isFa = lang === 'fa';

  // Live vs Simulated Score State
  const LIVE_SCORE = 78;
  const [activeScore, setActiveScore] = useState<number>(LIVE_SCORE);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  const getScoreInfo = (s: number) => {
    if (s <= 25) {
      return {
        labelFa: 'ترس شدید (Extreme Fear)',
        labelEn: 'Extreme Fear',
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
        adviceFa: '🚨 شرایط ترس شدید! شاخص نشان‌دهنده تسلیم فروشندگان است. بر اساس تجربه تاریخی، بهترین زمان برای فعال‌سازی خرید پله‌ای (DCA) در کف قیمتی است.',
        adviceEn: 'Extreme Fear detected. Historical data shows this is the optimal accumulation zone via DCA.'
      };
    }
    if (s <= 45) {
      return {
        labelFa: 'ترس ملایم (Fear)',
        labelEn: 'Fear',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20 border-orange-500/30 text-orange-300',
        adviceFa: '📉 بازار در حالت ترس و عدم‌قطعیت است. انباشت آرام در دارایی‌های بنیادین (BTC و ETH) با ریسک پایین انجام می‌شود.',
        adviceEn: 'Fear in the market. Steady accumulation of blue-chips is favored.'
      };
    }
    if (s <= 55) {
      return {
        labelFa: 'خنثی (Neutral)',
        labelEn: 'Neutral',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
        adviceFa: '⚖️ بازار در حالت تعادل و خنثی است. کسب سود سالانه استیکینگ (APY) و پس‌انداز تتر بهترین گزینه است.',
        adviceEn: 'Neutral market balance. Generating yield via staking vaults is optimal.'
      };
    }
    if (s <= 75) {
      return {
        labelFa: 'طمع (Greed)',
        labelEn: 'Greed',
        color: 'text-teal-400',
        bgColor: 'bg-teal-500/20 border-teal-500/30 text-teal-300',
        adviceFa: '📈 طمع در بازار در حال شکل‌گیری است. روندها صعودی هستند؛ سفارشات لیمیت برای سیو پله‌ای سود تنظیم کنید.',
        adviceEn: 'Greed is building up. Set limit take-profit orders at upcoming resistances.'
      };
    }
    return {
      labelFa: 'طمع شدید (Extreme Greed)',
      labelEn: 'Extreme Greed',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
      adviceFa: '🔥 طمع شدید حاکم است! از فومو در سقف قیمت‌ها پرهیز کنید. بخشی از سود خود را به تتر (USDT) یا طلای دیجیتال (PAXG) منتقل کنید.',
      adviceEn: 'Extreme Greed! Avoid FOMO at local peaks. Lock in gains into USDT or PAXG digital gold.'
    };
  };

  const scoreInfo = getScoreInfo(activeScore);
  const needleAngle = (activeScore / 100) * 180 - 90;

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopied(true);
    playClickSound();
    setTimeout(() => setCopied(false), 2000);
  };

  // 7-day historical timeline data
  const history7d = [
    { dayFa: 'شنبه', dayEn: 'Sat', score: 58, status: 'خنثی متمایل به طمع', catalyst: 'آرامش در بازار دلار تهران و ثبات بیت‌کوین روی ۶۵ هزار دلار' },
    { dayFa: '۱شنبه', dayEn: 'Sun', score: 64, status: 'طمع', catalyst: 'آغاز موج خرید هفتگی در آربیتروم و رشد حجم اسپات' },
    { dayFa: '۲شنبه', dayEn: 'Mon', score: 68, status: 'طمع', catalyst: 'شکست مقاومت تتر در تهران و حرکت به سوی ۹۳,۰۰۰ تومان' },
    { dayFa: '۳شنبه', dayEn: 'Tue', score: 74, status: 'طمع شدید', catalyst: 'ورودی ۱.۴ میلیارد دلار نقدینگی نهادی به ETF های کریپتو' },
    { dayFa: '۴شنبه', dayEn: 'Wed', score: 71, status: 'طمع', catalyst: 'اصلاح موقت و بازگشت پول به استخرهای سوددهی دیفای' },
    { dayFa: '۵شنبه', dayEn: 'Thu', score: 75, status: 'طمع شدید', catalyst: 'جهش طلای دیجیتال (PAXG) و رشد هیجانی تتر' },
    { dayFa: 'امروز', dayEn: 'Today', score: 78, status: 'طمع شدید', catalyst: 'ثبت رکورد جریان ورودی لایه دوها و حجم بالای خرید در تلگرام' },
  ];

  // 30-day aggregated checkpoints
  const history30d = [
    { dayFa: '۴ هفته پیش', dayEn: '4w ago', score: 46, status: 'ترس ملایم', catalyst: 'تردید در بازارهای مالی و بلاتکلیفی دلار' },
    { dayFa: '۳ هفته پیش', dayEn: '3w ago', score: 52, status: 'خنثی', catalyst: 'تثبیت کف بیت‌کوین و افزایش تقاضای استیبل‌کوین‌ها' },
    { dayFa: '۲ هفته پیش', dayEn: '2w ago', score: 63, status: 'طمع', catalyst: 'آغاز تقاضای سنگین کاربران ایرانی برای پوشش ریسک با تتر' },
    { dayFa: '۱ هفته پیش', dayEn: '1w ago', score: 70, status: 'طمع شدید', catalyst: 'رشد عمومی آلت‌کوین‌ها در شبکه‌های آربیتروم و بیس' },
    { dayFa: 'امروز', dayEn: 'Today', score: 78, status: 'طمع شدید', catalyst: 'اوج فومو خریداران در معاملات نقدی و فیوچرز' },
  ];

  const activeHistory = timeframe === '7d' ? history7d : history30d;

  // Live Simulated Institutional & Whale Movement Feed
  const whaleMovements: WhaleMovement[] = [
    {
      id: 'whale-1',
      type: 'deposit',
      asset: 'USDT',
      amount: '1,450,000 USDT',
      usdValue: '$1,450,000',
      chain: 'Arbitrum One',
      chainColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      timeAgoFa: '۲ دقیقه پیش',
      timeAgoEn: '2m ago',
      descriptionFa: 'ورودی سنگین نهنگ به استخر نقدینگی Uniswap v3 در لایه ۲ آربیتروم',
      descriptionEn: 'Large institutional LP deposit into Uniswap v3 Arbitrum'
    },
    {
      id: 'whale-2',
      type: 'withdrawal',
      asset: 'ETH',
      amount: '2,400 ETH',
      usdValue: '$8,210,000',
      chain: 'Ethereum',
      chainColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      timeAgoFa: '۷ دقیقه پیش',
      timeAgoEn: '7m ago',
      descriptionFa: 'خروج ۲,۴۰۰ اتریوم از صرافی به کیف‌پول سرد چندامضایی (انباشت نهنگ)',
      descriptionEn: '2,400 ETH moved from exchange into cold storage (Bullish accumulation)'
    },
    {
      id: 'whale-3',
      type: 'mint',
      asset: 'PAXG',
      amount: '1,850 PAXG',
      usdValue: '$4,960,000',
      chain: 'Ethereum',
      chainColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      timeAgoFa: '۱۴ دقیقه پیش',
      timeAgoEn: '14m ago',
      descriptionFa: 'ضرب طلای دیجیتال با ۱۰۰٪ شمش فیزیکی جهت پوشش ریسک تورم ریالی',
      descriptionEn: 'Digital gold minted backed 1:1 by LBMA vault gold bullion'
    },
    {
      id: 'whale-4',
      type: 'swap',
      asset: 'TON',
      amount: '380,000 TON',
      usdValue: '$2,050,000',
      chain: 'TON Bridge',
      chainColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      timeAgoFa: '۲۲ دقیقه پیش',
      timeAgoEn: '22m ago',
      descriptionFa: 'تبادل کراس‌چین از اکوسیستم تلگرام به تتر آربیتروم در گریفین‌سواپ',
      descriptionEn: 'Cross-chain bridge execution from TON ecosystem to Arbitrum USDT'
    }
  ];

  const sentimentFactors = [
    {
      titleFa: 'نوسانات نرخ دلار در بازار تهران',
      titleEn: 'Tehran FX Volatility',
      score: 22,
      statusFa: 'آرام و صعودی پیوسته',
      statusEn: 'Low Volatility',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      titleFa: 'سنتیمنت کانال‌های تلگرام کریپتو ایران',
      titleEn: 'Persian Web3 Social Volume',
      score: 86,
      statusFa: 'بسیار صعودی (Bullish)',
      statusEn: 'High Bullish',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      titleFa: 'تسلط بیت‌کوین بر کل بازار (Dominance)',
      titleEn: 'BTC Dominance Index',
      score: 58.4,
      statusFa: 'آماده آلت‌سیزن',
      statusEn: 'Altseason Approaching',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      titleFa: 'ورودی خالص استخرهای نقدینگی آربیتروم',
      titleEn: 'Layer-2 Liquidity Inflow',
      score: 79,
      statusFa: 'انباشت نهنگ‌ها (+۱۸.۴M$)',
      statusEn: 'Whale Accumulation',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  // SVG Sparkline geometry calculation
  const svgWidth = 400;
  const svgHeight = 120;
  const padding = 25;
  const minScore = 40;
  const maxScore = 90;

  const points = activeHistory.map((item, index) => {
    const x = padding + (index * (svgWidth - 2 * padding)) / (activeHistory.length - 1);
    const y = svgHeight - padding - ((item.score - minScore) / (maxScore - minScore)) * (svgHeight - 2 * padding);
    return { x, y, ...item };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`;

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
              src="/mascot/griffi-sentiment.jpg" 
              alt="Griffi Sentiment Astrologer" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl lg:text-2xl font-black griffin-gradient-text">
                {isFa ? 'رادار شاخص ترس و طمع و سنتیمنت بازار' : 'Market Sentiment & Fear & Greed Radar'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" />
                تحلیل نجومی گریفی
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {isFa
                ? 'پایش ۲۴ ساعته نبض بازار کریپتو و دلار تهران؛ تشخیص زمان بهینه خرید در کف‌ها و سیو سود در اوج‌ها'
                : 'Real-time composite sentiment index combining global metrics and Iranian FX momentum.'}
            </p>
          </div>
        </div>

        {/* Live Score Pill */}
        <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
          isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 animate-pulse">
            <Flame className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold flex items-center gap-1">
              <span>{isFa ? 'شاخص فعلی:' : 'Current Index:'}</span>
              {isSimulated && (
                <span className="px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300 text-[9px] font-bold">
                  {isFa ? 'شبیه‌سازی' : 'Sim'}
                </span>
              )}
            </span>
            <span className="text-base font-extrabold text-amber-400 font-mono">
              {activeScore} / 100
            </span>
          </div>
        </div>
      </div>

      {/* Main Gauge & Speedometer Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-center">
        
        {/* Left Column: Visual Speedometer Gauge (5 Cols) */}
        <div className={`lg:col-span-5 p-6 rounded-2xl border text-center flex flex-col justify-between items-center ${
          isDarkMode ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50/70 border-purple-200'
        }`}>
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">
              {isFa ? 'وضعیت احساسات کلی بازار:' : 'Market Sentiment State:'}
            </span>
            {isSimulated && (
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveScore(LIVE_SCORE);
                  setIsSimulated(false);
                }}
                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isFa ? 'بازگشت به زنده' : 'Reset to Live'}</span>
              </button>
            )}
          </div>

          {/* Real Curved SVG Speedometer Dial with Animated Needle */}
          <div className="relative w-56 h-32 my-1 flex flex-col items-center justify-end">
            <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="25%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="75%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Background Arc Track */}
              <path
                d="M 25 105 A 75 75 0 0 1 175 105"
                fill="none"
                stroke="#1e1838"
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* Colored Gauge Arc */}
              <path
                d="M 25 105 A 75 75 0 0 1 175 105"
                fill="none"
                stroke="url(#gaugeGrad)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray="235.6"
                strokeDashoffset={235.6 * (1 - activeScore / 100)}
                className="transition-all duration-700 ease-out"
              />

              {/* Center Needle */}
              <g 
                transform={`rotate(${needleAngle}, 100, 105)`}
                className="transition-transform duration-700 ease-out"
              >
                <line 
                  x1="100" 
                  y1="105" 
                  x2="100" 
                  y2="38" 
                  stroke="#ffffff" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
                />
                <circle cx="100" cy="105" r="7" fill="#fbbf24" stroke="#1e1838" strokeWidth="2" />
                <circle cx="100" cy="105" r="3" fill="#ffffff" />
              </g>

              {/* Min and Max markers */}
              <text x="22" y="115" fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">0</text>
              <text x="100" y="24" fontSize="9" fill="#eab308" textAnchor="middle" fontFamily="monospace">50</text>
              <text x="178" y="115" fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">100</text>
            </svg>

            {/* Score Display Tag */}
            <div className="text-center mt-1">
              <span className={`text-3xl font-black font-mono tracking-tight ${scoreInfo.color}`}>
                {activeScore}
              </span>
              <span className="text-[11px] font-bold text-slate-300 block">
                {isFa ? scoreInfo.labelFa : scoreInfo.labelEn}
              </span>
            </div>
          </div>

          {/* Interactive Sentiment Simulator Presets */}
          <div className="w-full mt-3 pt-2.5 border-t border-purple-500/20">
            <span className="text-[10px] text-slate-400 block mb-1.5 flex items-center justify-center gap-1">
              <Sliders className="w-3 h-3 text-purple-400" />
              <span>{isFa ? 'شبیه‌ساز احساسات بازار (تست استراتژی):' : 'Sentiment Simulator:'}</span>
            </span>
            <div className="grid grid-cols-5 gap-1 text-[10px] font-bold">
              {[
                { score: 18, label: 'ترس شدید', color: 'bg-rose-950/60 text-rose-300 border-rose-500/30' },
                { score: 35, label: 'ترس', color: 'bg-orange-950/60 text-orange-300 border-orange-500/30' },
                { score: 50, label: 'خنثی', color: 'bg-amber-950/60 text-amber-300 border-amber-500/30' },
                { score: 68, label: 'طمع', color: 'bg-teal-950/60 text-teal-300 border-teal-500/30' },
                { score: 78, label: 'زنده ۷۸', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' }
              ].map(item => (
                <button
                  key={item.score}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setActiveScore(item.score);
                    setIsSimulated(item.score !== LIVE_SCORE);
                  }}
                  className={`py-1 rounded-lg border transition-all cursor-pointer ${item.color} ${
                    activeScore === item.score ? 'ring-2 ring-purple-400 font-extrabold shadow-sm' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Historical comparison pills */}
          <div className="grid grid-cols-3 gap-2 w-full mt-3 pt-2 border-t border-purple-500/20 text-xs">
            <div className="p-1.5 rounded-lg bg-black/20 text-center">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'دیروز' : 'Yesterday'}</span>
              <span className="font-mono font-bold text-amber-300">75</span>
            </div>
            <div className="p-1.5 rounded-lg bg-black/20 text-center">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'هفته پیش' : 'Last Week'}</span>
              <span className="font-mono font-bold text-amber-300">64</span>
            </div>
            <div className="p-1.5 rounded-lg bg-black/20 text-center">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'ماه پیش' : 'Last Month'}</span>
              <span className="font-mono font-bold text-slate-300">46</span>
            </div>
          </div>
        </div>

        {/* Right Column: Breakdown Factors (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 text-right">
            <Activity className="w-4 h-4 text-purple-400" />
            {isFa ? 'تفکیک عوامل تاثیرگذار بر شاخص در ایران و جهان:' : 'Sentiment Breakdown Factors:'}
          </span>

          {sentimentFactors.map((factor) => (
            <div
              key={factor.titleFa}
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-right text-xs ${
                isDarkMode ? 'bg-purple-950/20 border-purple-500/20' : 'bg-white border-purple-200'
              }`}
            >
              <div>
                <span className="font-bold text-white block">{isFa ? factor.titleFa : factor.titleEn}</span>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${factor.color}`}>
                  {isFa ? factor.statusFa : factor.statusEn}
                </span>
              </div>
              <div className="text-left">
                <span className="font-mono text-base font-extrabold text-amber-400">
                  {typeof factor.score === 'number' ? factor.score : factor.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Sentiment History Timeline Sparkline */}
      <div className={`p-5 rounded-2xl border my-6 ${
        isDarkMode ? 'bg-purple-950/25 border-purple-500/25' : 'bg-purple-50/50 border-purple-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="text-right">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>{isFa ? 'نمودار روند تاریخی شاخص و کاتالیزورهای تغییر جهت' : 'Historical Sentiment Trajectory & Catalysts'}</span>
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {isFa ? 'بر روی نقاط نمودار بروید تا دلایل صعود یا نزول شاخص را مشاهده کنید' : 'Hover over nodes to inspect market catalysts'}
            </span>
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto bg-black/40 p-1 rounded-xl border border-purple-500/20">
            <button
              onClick={() => {
                playClickSound();
                setTimeframe('7d');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                timeframe === '7d' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isFa ? '۷ روز گذشته' : '7 Days'}
            </button>
            <button
              onClick={() => {
                playClickSound();
                setTimeframe('30d');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                timeframe === '30d' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isFa ? '۳۰ روز گذشته' : '30 Days'}
            </button>
          </div>
        </div>

        {/* SVG Sparkline Curve */}
        <div className="relative w-full h-32 flex items-center justify-center">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="sentimentGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Subtle Horizontal grid lines */}
            <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
            <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
            <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="currentColor" strokeOpacity="0.08" />

            {/* Gradient Fill under line */}
            <path d={areaD} fill="url(#sentimentGradient)" />

            {/* Line Stroke */}
            <path 
              d={pathD} 
              fill="none" 
              stroke="#f59e0b" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]"
            />

            {/* Interactive Circles / Data Nodes */}
            {points.map((p, idx) => (
              <g 
                key={idx} 
                className="cursor-pointer" 
                onMouseEnter={() => setHoveredPoint(idx)} 
                onClick={() => setHoveredPoint(idx)}
              >
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={hoveredPoint === idx ? 6 : 4} 
                  fill={hoveredPoint === idx ? '#fbbf24' : '#1e1b4b'} 
                  stroke="#f59e0b" 
                  strokeWidth={hoveredPoint === idx ? 3 : 2} 
                  className="transition-all duration-200"
                />
                <text 
                  x={p.x} 
                  y={svgHeight - 6} 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill={hoveredPoint === idx ? '#fbbf24' : '#94a3b8'} 
                  fontWeight={hoveredPoint === idx ? 'bold' : 'normal'}
                >
                  {isFa ? p.dayFa : p.dayEn}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Dynamic Tooltip / Catalyst Inspector Card */}
        {hoveredPoint !== null && points[hoveredPoint] && (
          <div className="mt-3 p-3 rounded-xl bg-purple-950/70 border border-amber-400/40 text-right animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-400/20 text-amber-300 font-mono font-bold">
                {isFa ? points[hoveredPoint].dayFa : points[hoveredPoint].dayEn}
              </span>
              <span className="font-mono font-extrabold text-amber-400 text-sm">
                امتیاز: {points[hoveredPoint].score}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {points[hoveredPoint].status}
              </span>
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed max-w-xl">
              {points[hoveredPoint].catalyst}
            </p>
          </div>
        )}
      </div>

      {/* Real-time Institutional & Whale Flow Radar Cards */}
      <div className={`p-5 rounded-2xl border my-6 ${
        isDarkMode ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50/60 border-purple-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 text-right">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>{isFa ? 'دیدبان زنده جریان سرمایه نهنگ‌ها (Whale Flow Radar)' : 'Live Whale Flow Radar'}</span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isFa ? 'رهگیری آن‌چین تراکنش‌های میلیونی نهادها در لایه ۲ آربیتروم، بیس و اکوسیستم تلگرام' : 'On-chain tracking of institutional transfers across Arbitrum, Base & TON'}
            </p>
          </div>

          <span className="text-[10px] font-mono text-cyan-400 px-2 py-1 rounded-lg bg-black/40 border border-cyan-500/20 self-start sm:self-auto">
            LIVE BLOCKS SYNC
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {whaleMovements.map((whale) => (
            <div 
              key={whale.id}
              className={`p-3.5 rounded-2xl border transition-all text-right flex flex-col justify-between ${
                isDarkMode ? 'bg-black/30 border-purple-500/20 hover:border-cyan-500/40' : 'bg-white border-purple-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono ${whale.chainColor}`}>
                    {whale.chain}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {isFa ? whale.timeAgoFa : whale.timeAgoEn}
                  </span>
                </div>
                <div className="text-left font-mono">
                  <span className="font-mono font-black text-emerald-400 text-xs block">
                    {whale.amount} ({whale.usdValue})
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold block">
                    ≈ {isFa ? `${toPersianDigits(formatToman(parseFloat(whale.usdValue.replace(/[^0-9.]/g, '')) * tomanRate))} تومان` : `${formatToman(parseFloat(whale.usdValue.replace(/[^0-9.]/g, '')) * tomanRate)} T`}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                {isFa ? whale.descriptionFa : whale.descriptionEn}
              </p>

              {onNavigateSwap && (
                <button
                  onClick={() => {
                    playSwapSuccessSound();
                    onNavigateSwap();
                  }}
                  className="self-end text-[11px] font-bold text-cyan-300 hover:text-white px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 transition-all flex items-center gap-1 active:scale-95"
                >
                  <Zap className="w-3 h-3 text-amber-300" />
                  <span>{isFa ? 'سواپ همگام با نهنگ' : 'Follow Whale'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Griffi Strategic Advice Box */}
      <div className={`p-5 rounded-2xl border my-6 flex flex-col md:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-purple-950/40 border-purple-500/30' : 'bg-purple-50 border-purple-200'
      }`}>
        <div className="text-right space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {isFa ? 'استراتژی پیشنهادی گریفی بر اساس شاخص:' : 'Griffi Recommended Action:'}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${scoreInfo.bgColor}`}>
              {isFa ? scoreInfo.labelFa : scoreInfo.labelEn}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed max-w-2xl">
            {isFa ? scoreInfo.adviceFa : scoreInfo.adviceEn}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          {onNavigateDca && (
            <button
              onClick={() => {
                playClickSound();
                onNavigateDca();
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              {isFa ? 'تنظیم خرید پله‌ای (DCA)' : 'Setup DCA'}
            </button>
          )}

          {onNavigateSwap && (
            <button
              onClick={() => {
                playSwapSuccessSound();
                onNavigateSwap();
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-purple-950 font-black text-xs shadow-md transition-all flex items-center gap-1 active:scale-95"
            >
              <span>{isFa ? 'سواپ و سیو سود' : 'Take Profit Swap'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
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
              ? 'کارمزد پروتکل گریفین سواپ (۰.۵٪) مستقیماً به خزانه‌داری رسمی واریز می‌شود:' 
              : 'Platform commission (0.5%) routes to verified treasury:'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <code className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 text-purple-300 border border-purple-500/20">
            {COMMISSION_WALLET.slice(0, 6)}...{COMMISSION_WALLET.slice(-4)}
          </code>
          <button
            onClick={handleCopyWallet}
            className="p-1 rounded-lg hover:bg-white/10 text-purple-300 transition-colors cursor-pointer"
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
