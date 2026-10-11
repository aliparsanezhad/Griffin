import React, { useState } from 'react';
import { Sparkles, X, Copy, Check, ShieldCheck, Heart, HelpCircle, Volume2 } from 'lucide-react';
import { LIFI_CONFIG } from '../services/lifiService';
import { playClickSound } from '../services/soundService';

interface GriffiAssistantProps {
  lang: 'fa' | 'en';
  isDarkMode: boolean;
  onStartTour?: () => void;
}

type GriffiPose = 
  | 'wave' 
  | 'egg' 
  | 'flower' 
  | 'hero' 
  | 'flying' 
  | 'vault' 
  | 'navigator' 
  | 'analyst' 
  | 'trader' 
  | 'inspector'
  | 'gas'
  | 'gold'
  | 'accountant'
  | 'router'
  | 'escrow'
  | 'futures'
  | 'cards'
  | 'domains';

export const GriffiAssistant: React.FC<GriffiAssistantProps> = ({ lang, isDarkMode, onStartTour }) => {
  const isFa = lang === 'fa';
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedPose, setSelectedPose] = useState<GriffiPose>('wave');
  const commissionWallet = LIFI_CONFIG.feeRecipient;

  const handleCopy = () => {
    navigator.clipboard.writeText(commissionWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeakAdvice = (text: string) => {
    playClickSound();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = isFa ? 'fa-IR' : 'en-US';
        utterance.rate = 0.95;
        utterance.pitch = 1.15;
        window.speechSynthesis.speak(utterance);
      } catch (err) {}
    }
  };

  const getAdviceText = (pose: GriffiPose): string => {
    switch (pose) {
      case 'futures':
        return isFa
          ? 'با معاملات فیوچرز غیرمتمرکز، بدون نیاز به احراز هویت تا ۵۰ برابر اهرم بگیرید! همیشه حد ضرر بگذارید تا از نوسانات بازار در امان بمانید.'
          : 'Trade decentralized perpetuals with up to 50x leverage and zero KYC! Remember to manage margin and set stop-loss.';
      case 'cards':
        return isFa
          ? 'با کارت‌های اعتباری مجازی وب۳، اشتراک‌های هوش مصنوعی مثل ChatGPT Plus و تلگرام پریمیوم رو مستقیم با تتر بخرید بدون اینکه تحریم‌ها مانع بشن!'
          : 'Mint virtual Web3 Mastercards and vouchers for OpenAI, Claude, and Telegram with zero KYC!';
      case 'domains':
        return isFa
          ? 'آدرس‌های طولانی کیف پول رو با شناسه کوتاه tehran.griffi جایگزین کنید! مالکیت دائمی و مادام‌العمر بدون هزینه تمدید سالانه.'
          : 'Replace long 0x addresses with tehran.griffi! Lifetime ownership with zero annual renewal fees.';
      case 'gas':
        return isFa 
          ? 'دیگر نگران نداشتن اتریوم نباشید! با سیستم پی‌مستر گریفین، کارمزد تراکنش را مستقیماً با تتر پرداخت کنید یا هر روز یک سهمیه سوخت رایگان از من هدیه بگیرید.'
          : 'Never get stuck without ETH again! Pay gas directly in USDT with Griffi Paymaster.';
      case 'gold':
        return isFa 
          ? 'بیش از ۲۰ درصد قیمت سکه امامی حباب است! با تبدیل تتر به طلای دیجیتال پکس‌گلد، بدون حباب و بدون اجرت طلافروشی سرمایه‌گذاری کنید.'
          : 'Save on coin bubbles by swapping USDT directly to physical gold tokens (PAXG).';
      case 'accountant':
        return isFa 
          ? 'گزارش حسابداری تومانی تمام مبادلات خود را همراه با محاسبه سود و زیان محقق‌شده به راحتی در قالب اکسل استخراج کنید.'
          : 'Export your multi-chain Web3 tax and P&L statements calculated in Tomans with 1 click.';
      case 'router':
        return isFa 
          ? 'مسیریاب هوشمند چندمسیری گریفین، سفارش‌های بزرگ شما را بین استخرها تقسیم می‌کند تا اسلیپیج و لغزش قیمت به صفر میل کند.'
          : 'Our smart order router splits volume across Uniswap, Sushi, and Griffin deep liquidity pools.';
      case 'escrow':
        return isFa 
          ? 'خرید و فروش همتا‌به‌همتای تتر با تومان از طریق قرارداد هوشمند اسکرو امن است و ریال مستقیماً به شبای تاییدشده واریز می‌شود.'
          : 'Trade P2P safely with non-custodial smart contract escrow and verified bank Sheba accounts.';
      case 'trader':
        return isFa 
          ? 'سفارشات لیمیت آف‌چین با استاندارد Permit2 بدون نیاز به پرداخت گس ثبت می‌شوند! بدون ریسک مسدود شدن حساب معامله کنید.' 
          : 'Trade with gasless Permit2 limit orders with zero custodial risk!';
      case 'inspector':
        return isFa 
          ? 'پیش از خرید هر توکن، آن را با رادار گریفی اسکن کنید تا گرفتار هانی‌پات و دام‌های مالیاتی نشوید.' 
          : 'Scan any token with Griffi Radar before buying to avoid honeypots!';
      case 'analyst':
        return isFa 
          ? 'ماشین‌حساب هوشمند ما ارزش دارایی شما را بر مبنای تورم ریال و طلای ۱۸ عیار مقایسه می‌کند.' 
          : 'Compare returns against Rial inflation and gold purchasing power.';
      case 'navigator':
        return isFa 
          ? 'پل‌های چندزنجیره‌ای گریفین سریع‌ترین و کم‌کارمزدترین مسیرها را در میان ۵۸ بلاک‌چین برایتان انتخاب می‌کنند.' 
          : 'Bridge assets across 58 blockchains with minimum fees.';
      case 'vault':
        return isFa 
          ? 'استخرهای دیفای سود پایدار ارزی روی استیبل‌کوین‌ها تولید می‌کنند تا قدرت خرید سرمایه شما حفظ شود.' 
          : 'Earn high annual yield on stablecoins to beat inflation.';
      case 'flying':
        return isFa 
          ? 'بال‌های گریفین با سرعت صوت تراکنش‌های شما را میان آربیتروم، بیس و پالیگان جابجا می‌کنند!' 
          : 'Soar through Layer-2 networks with lightning speed!';
      case 'wave':
        return isFa 
          ? 'خوش آمدید! گریفین‌سواپ پلی امن، سریع و بدون تحریم میان ریال، تتر و رمزارزهاست.' 
          : 'Welcome to GriffinSwap, the cross-chain DEX tailored for Iranian traders.';
      case 'flower':
        return isFa 
          ? 'امیدوارم معاملاتت پر از سود و برکت باشه! هر زمان کمکی خواستی من اینجام.' 
          : 'Wishing you prosperous trades! Feel free to ask me anything.';
      case 'egg':
      default:
        return isFa 
          ? 'هر معامله موفق یک پر جادویی به وفاداری شما اضافه می‌کنه!' 
          : 'Every trade earns magical feathers for your loyalty pass!';
    }
  };

  const poseImages: Record<GriffiPose, string> = {
    wave: '/mascot/griffi-wave.jpg',
    egg: '/mascot/griffi-egg.jpg',
    flower: '/mascot/griffi-flower.jpg',
    hero: '/mascot/griffi-hero.jpg',
    flying: '/mascot/griffi-hero-banner.jpg',
    vault: '/mascot/griffi-vault.jpg',
    navigator: '/mascot/griffi-navigator.jpg',
    analyst: '/mascot/griffi-analyst.jpg',
    trader: '/mascot/griffi-trader.jpg',
    inspector: '/mascot/griffi-inspector.jpg',
    gas: '/mascot/griffi-gas-station.jpg',
    gold: '/mascot/griffi-gold-treasury.jpg',
    accountant: '/mascot/griffi-accountant.jpg',
    router: '/mascot/griffi-smart-router.jpg',
    escrow: '/mascot/griffi-escrow.jpg',
    futures: '/mascot/griffi-futures.jpg',
    cards: '/mascot/griffi-card.jpg',
    domains: '/mascot/griffi-domains.jpg',
  };

  return (
    <>
      {/* Floating Mascot Trigger Button */}
      <aside 
        aria-label={isFa ? 'دستیار گریفی' : 'Griffi Assistant'}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-3 animate-bounce-subtle"
      >
        <button
          onClick={() => {
            playClickSound();
            setIsOpen(!isOpen);
          }}
          className="group relative flex items-center gap-2.5 px-3.5 py-2 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-amber-900/40 border-purple-400/40 backdrop-blur-md text-white"
          title={isFa ? 'گفتگو با گریفی، دستیار صرافی گریفین' : 'Chat with Griffi, the GriffinSwap mascot'}
        >
          {/* Griffi Avatar with Golden Aura */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-amber-400/80 shadow-md shadow-amber-500/30">
            <img 
              src="/mascot/griffi-avatar.jpg" 
              alt="Griffi mascot" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-slate-900 rounded-full" />
          </div>

          <div className="flex flex-col text-right">
            <span className="text-xs font-black tracking-tight flex items-center gap-1 text-amber-300">
              <span>{isFa ? 'گریفی (Griffi)' : 'Griffi'}</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </span>
            <span className="text-[10px] text-purple-200/80 font-medium">
              {isFa ? 'راهنمای هوشمند شما' : 'Your Mascot Guide'}
            </span>
          </div>
        </button>
      </aside>

      {/* Mascot Dialog Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl relative overflow-hidden transition-all text-right max-h-[90vh] overflow-y-auto ${
              isDarkMode 
                ? 'bg-[#150f2f]/95 border-purple-500/30 text-slate-100 shadow-purple-900/40' 
                : 'bg-white/95 border-purple-200 text-slate-800 shadow-xl'
            }`}
          >
            {/* Ambient Background Aura */}
            <div className="absolute -top-20 -left-20 w-44 h-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-44 h-44 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 left-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Griffi Header Showcase */}
            <div className="flex items-center gap-4 mb-5 border-b border-purple-500/20 pb-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-amber-400/60 shadow-xl bg-purple-950/40 shrink-0">
                <img 
                  src={poseImages[selectedPose]} 
                  alt="Griffi pose" 
                  className="w-full h-full object-cover transition-all duration-300" 
                />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-[11px] font-bold text-amber-300 mb-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{isFa ? 'نماد و دستیار رسمی گریفین‌سواپ' : 'Official Griffin Mascot'}</span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-white">
                  {isFa ? 'سلام! من گریفی هستم 🦅✨' : 'Hi! I am Griffi 🦅✨'}
                </h3>
                <p className="text-xs text-purple-200/80 font-medium">
                  {isFa 
                    ? 'بچه شیردال افسانه‌ای و راهنمای مبادلات امن وب۳ شما'
                    : 'The baby mythical griffin guiding your safe Web3 swaps'}
                </p>
              </div>
            </div>

            {/* Interactive Guided Tour Banner Button */}
            {onStartTour && (
              <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-indigo-600/20 border border-amber-400/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-white">
                    {isFa ? 'آشنایی گام‌به‌گام با سواپ و ترفندهای کاهش کارمزد' : 'Step-by-step low-fee tour'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onStartTour();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 shrink-0"
                >
                  {isFa ? 'شروع تور 🎓' : 'Start Tour 🎓'}
                </button>
              </div>
            )}

            {/* Pose Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4 bg-purple-950/40 p-1.5 rounded-xl border border-purple-500/20">
              <button
                onClick={() => setSelectedPose('wave')}
                className={`flex-1 min-w-[65px] py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPose === 'wave' 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'سلام 👋' : 'Wave 👋'}
              </button>
              <button
                onClick={() => setSelectedPose('analyst')}
                className={`flex-1 min-w-[65px] py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPose === 'analyst' 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'تحلیل 📊' : 'P&L 📊'}
              </button>
              <button
                onClick={() => setSelectedPose('navigator')}
                className={`flex-1 min-w-[65px] py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPose === 'navigator' 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'ناوبری 🧭' : 'Nav 🧭'}
              </button>
              <button
                onClick={() => setSelectedPose('flying')}
                className={`flex-1 min-w-[65px] py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPose === 'flying' 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'پرواز 🦅' : 'Fly 🦅'}
              </button>
              <button
                onClick={() => setSelectedPose('vault')}
                className={`flex-1 min-w-[65px] py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPose === 'vault' 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'خزانه 💎' : 'Vault 💎'}
              </button>
              <button
                onClick={() => setSelectedPose('flower')}
                className={`flex-1 min-w-[65px] py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPose === 'flower' 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'سود 🌼' : 'Earn 🌼'}
              </button>
              <button
                onClick={() => setSelectedPose('trader')}
                className={`flex-1 min-w-[65px] py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPose === 'trader' 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'معامله 📈' : 'Trade 📈'}
              </button>
              <button
                onClick={() => setSelectedPose('inspector')}
                className={`flex-1 min-w-[65px] py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPose === 'inspector' 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'کارآگاه 🛡️' : 'Audit 🛡️'}
              </button>
              <button
                onClick={() => setSelectedPose('gas')}
                className={`flex-1 min-w-[65px] py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPose === 'gas' 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'سوخت ⛽' : 'Gas ⛽'}
              </button>
              <button
                onClick={() => setSelectedPose('gold')}
                className={`flex-1 min-w-[65px] py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPose === 'gold' 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'طلا 👑' : 'Gold 👑'}
              </button>
              <button
                onClick={() => setSelectedPose('router')}
                className={`flex-1 min-w-[65px] py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPose === 'router' 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'مسیر 🔀' : 'Route 🔀'}
              </button>
              <button
                onClick={() => setSelectedPose('accountant')}
                className={`flex-1 min-w-[65px] py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPose === 'accountant' 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'حساب 📑' : 'Tax 📑'}
              </button>
              <button
                onClick={() => setSelectedPose('escrow')}
                className={`flex-1 min-w-[65px] py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPose === 'escrow' 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'اسکرو 🛡️' : 'Escrow 🛡️'}
              </button>
              <button
                onClick={() => setSelectedPose('futures')}
                className={`flex-1 min-w-[65px] py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPose === 'futures' 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'اهرم 🚀' : 'Perp 🚀'}
              </button>
              <button
                onClick={() => setSelectedPose('cards')}
                className={`flex-1 min-w-[65px] py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPose === 'cards' 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'کارت 💳' : 'Card 💳'}
              </button>
              <button
                onClick={() => setSelectedPose('domains')}
                className={`flex-1 min-w-[65px] py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPose === 'domains' 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'دامنه 🌐' : 'Domain 🌐'}
              </button>
            </div>

            {/* Dynamic Griffi Speech Bubble with Persian Voice Readout */}
            <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/60 via-indigo-950/60 to-purple-950/60 border border-purple-400/30 text-xs text-purple-100 leading-relaxed shadow-lg">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isFa ? 'پیام راهنمای گریفی: 🦅✨' : 'Griffi Whispers: 🦅✨'}</span>
                </span>
                <button
                  onClick={() => handleSpeakAdvice(getAdviceText(selectedPose))}
                  className="px-2 py-0.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95"
                  title={isFa ? 'شنیدن پیام با صدای هوش مصنوعی گریفی' : 'Listen to Griffi voice'}
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isFa ? 'پخش صوتی 🔊' : 'Voice 🔊'}</span>
                </button>
              </div>
              <p>{getAdviceText(selectedPose)}</p>
            </div>

            {/* Key Information & Commission Transparency */}
            <div className="space-y-3.5 text-xs text-slate-300">
              
              {/* Official Commission Wallet */}
              <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{isFa ? 'آدرس رسمی خزانه و دریافت کارمزدها:' : 'Official Commission & Treasury Wallet:'}</span>
                  </span>
                  <span className="text-[10px] text-purple-300 font-semibold bg-purple-500/20 px-2 py-0.5 rounded-full">
                    {isFa ? 'کارمزد پروتکل: ۰.۵٪' : 'Protocol Fee: 0.5%'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                  {isFa 
                    ? 'تمامی کارمزدهای حاصل از مبادلات و سواپ‌های پلتفرم مستقیماً و شفاف به این آدرس واریز می‌شوند:'
                    : 'All swap and aggregator commissions are routed directly and transparently to this wallet:'}
                </p>
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/40 border border-purple-500/20 font-mono text-[11px] text-purple-200">
                  <span className="truncate">{commissionWallet}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors shrink-0 flex items-center gap-1"
                    title={isFa ? 'کپی آدرس' : 'Copy Address'}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">{copied ? (isFa ? 'کپی شد' : 'Copied') : (isFa ? 'کپی' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              {/* Safety & Anti-Censorship Tips from Griffi */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/25 space-y-2">
                <span className="font-bold text-white text-xs block">
                  {isFa ? '💡 ۳ نکته طلایی گریفی برای کاربران ایرانی:' : '💡 3 Key Tips for Iranian Users:'}
                </span>
                <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
                  <li>
                    {isFa 
                      ? 'برای کاهش کارمزد، تتر (USDT) را روی شبکه‌های لایه دو نظیر Arbitrum یا Base مبادله کنید.'
                      : 'Swap USDT on Arbitrum or Base for gas fees under $0.05.'}
                  </li>
                  <li>
                    {isFa 
                      ? 'گریفین‌سواپ کاملاً غیرحضانتی است؛ هیچ دارایی در صرافی نگهداری نمی‌شود و نیازی به ثبت‌نام نیست.'
                      : 'GriffinSwap is 100% non-custodial with 0 KYC requirements.'}
                  </li>
                  <li>
                    {isFa 
                      ? 'برای امنیت بیشتر، از ولت‌های امن مانند Rabby Wallet یا MetaMask با RPCهای ضدتحریم استفاده کنید.'
                      : 'Use privacy-friendly RPC endpoints and audited wallets like Rabby.'}
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer Action */}
            <div className="mt-5 flex items-center justify-between pt-3 border-t border-purple-500/20">
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <span>{isFa ? 'طراحی شده با عشق برای جامعه وب۳' : 'Designed with love'}</span>
                <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
              >
                {isFa ? 'متشکرم، گریفی!' : 'Thanks, Griffi!'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
