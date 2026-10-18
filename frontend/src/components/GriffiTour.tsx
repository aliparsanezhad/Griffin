import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  ShieldCheck, 
  Wallet, 
  Zap, 
  Coins, 
  GitFork, 
  Award,
  Copy,
  Check,
  Flame,
  CreditCard,
  Globe,
  Rocket
} from 'lucide-react';
import { LIFI_CONFIG } from '../services/lifiService';
import { playClickSound, playSwapSuccessSound } from '../services/soundService';

interface GriffiTourProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fa' | 'en';
  isDarkMode: boolean;
  onCompleteTour?: () => void;
}

interface TourStep {
  titleFa: string;
  titleEn: string;
  badgeFa: string;
  badgeEn: string;
  icon: any;
  image: string;
  contentFa: string[];
  contentEn: string[];
  tipFa?: string;
  tipEn?: string;
}

export const GriffiTour: React.FC<GriffiTourProps> = ({
  isOpen,
  onClose,
  lang,
  isDarkMode,
  onCompleteTour,
}) => {
  const isFa = lang === 'fa';
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const commissionWallet = LIFI_CONFIG.feeRecipient;

  if (!isOpen) return null;

  const steps: TourStep[] = [
    {
      titleFa: 'به دنیای گریفین‌سواپ خوش آمدید! 🦅✨',
      titleEn: 'Welcome to GriffinSwap! 🦅✨',
      badgeFa: 'معرفی اولیه',
      badgeEn: 'Introduction',
      icon: Sparkles,
      image: '/mascot/griffi-wave.jpg',
      contentFa: [
        'من گریفی هستم، بچه شیردال افسانه‌ای و راهنمای رسمی شما در گریفین‌سواپ.',
        'گریفین‌سواپ اولین صرافی غیرمتمرکز و پل چندزنجیره‌ای ویژه کاربران ایرانی است که امکان تبادل آنی دارایی‌ها را بدون نیاز به احراز هویت (KYC)، بدون تحریم و بدون واسطه فراهم می‌سازد.',
        'در این تور کوتاه ۲ دقیقه‌ای، با قابلیت‌های کلیدی و ترفندهای کاهش کارمزد آشنا می‌شوید.'
      ],
      contentEn: [
        'I am Griffi, your baby griffin mascot guide in GriffinSwap.',
        'GriffinSwap is the premiere cross-chain DEX tailored for Iranian Web3 users with 0 KYC, no geoblocking, and direct non-custodial swaps.',
        'Take this 2-minute tour to discover low-fee tricks and security safeguards.'
      ],
      tipFa: 'گریفین‌سواپ کلیدهای خصوصی شما را هرگز ذخیره نمی‌کند؛ کنترل ۱۰۰٪ سرمایه در دستان شماست.',
      tipEn: 'GriffinSwap never holds your private keys; you retain 100% self-custody.'
    },
    {
      titleFa: 'اتصال امن کیف‌پول و دور زدن تحریم‌ها 🛡️',
      titleEn: 'Connect Secure Wallet & Bypass Blocks 🛡️',
      badgeFa: 'امنیت و ولت',
      badgeEn: 'Wallet Security',
      icon: Wallet,
      image: '/mascot/griffi-security.jpg',
      contentFa: [
        'برای استفاده از صرافی نیازی به ثبت‌نام یا ایمیل ندارید. کافیست با یک کلیک، ولت وب۳ خود را متصل کنید.',
        'بهترین کیف‌پول‌ها برای کاربران ایرانی: رابی (Rabby Wallet) که تحریم‌های آی‌پی را تشخیص می‌دهد و فیشینگ را فیلتر می‌کند، یا متامسک (MetaMask) با RPCهای ضدتحریم.',
        'از بخش «ضدتحریم» در منوی بالا می‌توانید نودهای خصوصی و ضدفیلتر را با یک کلیک به ولت خود اضافه نمایید.'
      ],
      contentEn: [
        'No registration or email is required. Connect your Web3 wallet in one click.',
        'Recommended for Iranian users: Rabby Wallet (built-in phishing protection and geoblock immunity) or MetaMask with custom RPCs.',
        'Check the Anti-Censorship tab to install 1RPC and Flashbots endpoints instantly.'
      ],
      tipFa: 'هرگز کلمات بازیابی (Seed Phrase) خود را در هیچ سایتی وارد نکنید. گریفین فقط درخواست امضای تراکنش ارسال می‌کند.',
      tipEn: 'Never enter your seed phrase anywhere. GriffinSwap only requests on-chain signatures.'
    },
    {
      titleFa: 'راز کاهش ۹۹٪ کارمزدها با شبکه‌های لایه ۲ ⚡',
      titleEn: 'Save 99% on Gas with Layer-2 Networks ⚡',
      badgeFa: 'بهینه‌سازی گس',
      badgeEn: 'L2 Gas Optimization',
      icon: Zap,
      image: '/mascot/griffi-hero-banner.jpg',
      contentFa: [
        'کارمزد سواپ در شبکه اصلی اتریوم ممکن است به بیش از ۱۰۰,۰۰۰ تومان برسد!',
        'با استفاده از شبکه‌های لایه ۲ نظیر آربیتروم (Arbitrum One)، بیس (Base) یا پالیگان (Polygon)، کارمزد هر تراکنش به کمتر از ۲,۰۰۰ تا ۵,۰۰۰ تومان کاهش می‌یابد.',
        'گریفی همیشه کم‌هزینه‌ترین مسیر میان ۵۸ بلاک‌چین را به صورت هوشمند برای شما محاسبه و انتخاب می‌کند.'
      ],
      contentEn: [
        'Ethereum mainnet gas can exceed several dollars per transaction.',
        'By using Layer-2 networks like Arbitrum One, Base, or Polygon, swap gas drops under $0.05 (2,000 - 5,000 Tomans).',
        'Griffi automatically selects the cheapest routing among 58+ supported blockchains.'
      ],
      tipFa: 'از نوار ابزار «کارمزد شبکه» در بالای سایت می‌توانید لحظه‌ای ارزان‌ترین شبکه را مشاهده کنید.',
      tipEn: 'Use the Gas Tracker tab to find the lowest fee hours and networks.'
    },
    {
      titleFa: 'نرخ لحظه‌ای تتر، تومان و معادل طلای ۱۸ عیار 🪙',
      titleEn: 'Real-Time Toman & Gold Equivalence 🪙',
      badgeFa: 'محاسبه تومان و طلا',
      badgeEn: 'Toman & Gold Feeds',
      icon: Coins,
      image: '/mascot/griffi-vault.jpg',
      contentFa: [
        'در کنار تمام توکن‌ها و سواپ‌ها، ارزش معادل به تومان بر اساس نرخ زنده بازار آزاد تهران نمایش داده می‌شود.',
        'در بخش «ماشین‌حساب تومان و طلا»، می‌توانید دارایی‌های خود را به سکه بهار آزادی و گرم طلای ۱۸ عیار تبدیل و مقایسه کنید تا از افت ارزش پول ملی در امان بمانید.',
        'همچنین بخش «خرید پله‌ای (DCA)» به شما کمک می‌کند استراتژی پس‌انداز منظم رمزارز بر مبنای تومان پیاده کنید.'
      ],
      contentEn: [
        'All token values display live Toman equivalents based on Tehran free-market USDT feeds.',
        'Use the Toman & Gold Calculator to benchmark against Seke Azadi and 18k gold grams to hedge against inflation.',
        'Set up Dollar-Cost-Averaging (DCA) in Tomans to protect your purchasing power.'
      ],
      tipFa: 'اوراکل تومان هر ۶۰ ثانیه به صورت خودکار بروزرسانی می‌شود.',
      tipEn: 'The Toman oracle automatically refreshes every 60 seconds.'
    },
    {
      titleFa: 'دیدبان چندمسیره پل‌ها و آربیتراژ بازار 🌉',
      titleEn: 'Cross-Chain Route Inspector & Arbitrage Radar 🌉',
      badgeFa: 'پل‌ها و آربیتراژ',
      badgeEn: 'Bridges & Arbitrage',
      icon: GitFork,
      image: '/mascot/griffi-navigator.jpg',
      contentFa: [
        'گریفین‌سواپ از پل‌های مطرح نظیر Across V3، Stargate V2 و شبکه‌های پیشرفته لایه ۲ تجمیع نقدینگی می‌کند.',
        'با باز کردن «دیدبان مسیرها» می‌توانید سرعت هر پل، کارمزد گس، رتبه امنیت و مراحل انتقال را مشاهده کرده و شبیه‌سازی انجام دهید.',
        'بخش «دیدبان آربیتراژ» اختلاف قیمت تتر میان صرافی‌های نوبیتکس، والکس، تترلند و آبان‌تتر را رصد کرده و سود احتمالی را به شما نشان می‌دهد.'
      ],
      contentEn: [
        'GriffinSwap aggregates liquidity from Across V3, Stargate V2, and high-speed Layer 2 mesh bridges.',
        'Open the Route Inspector to compare bridge speeds, gas, audits, and run animated execution tests.',
        'The Arbitrage Scanner monitors USDT price discrepancies across Nobitex, Wallex, and TetherLand.'
      ],
      tipFa: 'پل‌های مبتنی بر اینتنت مانند Across ظرف کمتر از ۱۵ ثانیه مبادله بین‌زنجیره‌ای را کامل می‌کنند.',
      tipEn: 'Intent bridges like Across finalize cross-chain swaps in under 15 seconds.'
    },
    {
      titleFa: 'سفارشات لیمیت شرطی بدون کارمزد گس (Permit2) 📈',
      titleEn: 'Gasless Limit Orders with Permit2 📈',
      badgeFa: 'معاملات هوشمند',
      badgeEn: 'Smart Limit Orders',
      icon: Zap,
      image: '/mascot/griffi-trader.jpg',
      contentFa: [
        'در بخش «پله‌ای و لیمیت»، می‌توانید بدون پرداخت هیچ‌گونه کارمزد گس، سفارش خرید یا فروش شرطی ثبت کنید.',
        'با بهره‌گیری از امضای دیجیتال آف‌چین EIP-712 Permit2، دارایی‌ها تا زمان رسیدن بازار به قیمت هدف در ولت خودتان می‌مانند و ریسک ورشکستگی یا مسدودسازی صرافی متمرکز از بین می‌رود.',
        'همچنین دفتر عمق بازار زنده به همراه تطبیق قیمت با تومان به شما امکان پیش‌بینی دقیق می‌دهد.'
      ],
      contentEn: [
        'Under "DCA & Limit", submit non-custodial buy and sell orders with zero on-chain placement gas.',
        'Utilizing EIP-712 Permit2 off-chain signatures, tokens remain securely in your wallet until the trigger price is met.',
        'View the live visual depth book ladder with real-time Toman and USD rate conversion.'
      ],
      tipFa: 'ثبت و لغو سفارشات لیمیت کاملاً رایگان است و کارمزد جزئی فقط هنگام اجرای نهایی معامله محاسبه می‌شود.',
      tipEn: 'Creating and cancelling limit orders is 100% gas-free; a minor execution fee applies only on fill.'
    },
    {
      titleFa: 'رادار هوشمند اصالت توکن و تشخیص هانی‌پات 🔍🛡️',
      titleEn: 'Honeypot Scanner & Wallet Approvals 🔍🛡️',
      badgeFa: 'ضد کلاهبرداری',
      badgeEn: 'Scam Protection',
      icon: ShieldCheck,
      image: '/mascot/griffi-inspector.jpg',
      contentFa: [
        'پیش از خرید هر توکن جدید یا میم‌کوین در تلگرام و شبکه‌های اجتماعی، آدرس قرارداد آن را در بخش «امنیت و هانی‌پات» بررسی کنید.',
        'هوش مصنوعی گریفی مالیات خرید و فروش، سلب مالکیت، توابع مخفی ضرب توکن و کدهای فریز آدرس را تحلیل کرده و نمره سلامت ارائه می‌دهد.',
        'علاوه بر این، ابزار Revoke به شما کمک می‌کند دسترسی‌های نامحدود قراردادهای قدیمی به ولت خود را پاکسازی کنید.'
      ],
      contentEn: [
        'Before purchasing new tokens or meme coins promoted on Telegram, audit the contract in the Security tab.',
        'Griffi AI analyzes buy/sell taxes, renounced ownership, infinite minting exploits, and blacklist functions to output a safety rating.',
        'Use the built-in Approvals Manager to revoke unlimited allowances to legacy DEX routers.'
      ],
      tipFa: 'هرگز توکن‌هایی با مالیات فروش بالای ۱۰٪ یا قراردادهای دارای تابع Blacklist را معامله نکنید.',
      tipEn: 'Never trade tokens with sell taxes over 10% or contracts with active blacklist functions.'
    },
    {
      titleFa: 'معاملات تعهدی و فیوچرز دائمی غیرمتمرکز 🚀',
      titleEn: 'Decentralized Perpetual Futures up to 50x 🚀',
      badgeFa: 'فیوچرز و اهرم',
      badgeEn: 'Perpetual Futures',
      icon: Flame,
      image: '/mascot/griffi-futures.jpg',
      contentFa: [
        'معاملات لانگ و شورت روی بیت‌کوین، اتریوم، طلا و آربیتروم با اهرم دلخواه تا ۵۰ برابر.',
        'بدون نیاز به احراز هویت (Zero-KYC) و بدون خطر بسته شدن حساب یا خطای آی‌پی ۴۰۳.',
        'تسویه سود لحظه‌ای به تتر روی شبکه‌های لایه دو کم‌کارمزد با محاسبه زنده قیمت لیکوئید شدن.'
      ],
      contentEn: [
        'Trade Long & Short positions on BTC, ETH, PAXG, and ARB with up to 50x leverage.',
        'Zero KYC required; immune to geoblocking or exchange freezes with self-custody smart contracts.',
        'Instant USDT profit settlement on low-fee Layer 2 with real-time liquidation price tracking.'
      ],
      tipFa: 'همیشه حد ضرر (Stop Loss) را تنظیم کنید تا از نوسانات بازار در امان بمانید.',
      tipEn: 'Always set a Stop Loss (SL) to protect your collateral against volatility.'
    },
    {
      titleFa: 'سکوی پرتاب و ساخت توکن‌های وب۳ با باندینگ کرو 🪙🚀',
      titleEn: 'Fair Launchpad & Token Foundry with Bonding Curve 🪙🚀',
      badgeFa: 'لانچ‌پد و ساخت توکن',
      badgeEn: 'Token Launchpad',
      icon: Rocket,
      image: '/mascot/griffi-launchpad.jpg',
      contentFa: [
        'توکن کامیونیتی یا پروژه خود را بدون نیاز به سرمایه اولیه و در امنیت ۱۰۰٪ بسازید.',
        'مکانیزم باندینگ کرو (Bonding Curve) با قفل و سوزاندن خودکار نقدینگی، مانع از راگ‌پول و کلاهبرداری می‌شود.',
        'به محض تکمیل نقدینگی، توکن به طور خودکار به استخر رسمی صرافی منتقل می‌شود.'
      ],
      contentEn: [
        'Deploy community and meme tokens with zero upfront liquidity.',
        'Automatic bonding curve with LP burn protects investors against rug-pulls.',
        'Seamless automatic migration to Uniswap & Griffin AMM upon reaching target cap.'
      ],
      tipFa: 'هزینه ساخت توکن تنها ۱۰ تتر است که مستقیماً به آدرس رسمی خزانه پروتکل واریز می‌شود.',
      tipEn: 'Token creation fee is only $10 routed directly to official platform treasury.'
    },
    {
      titleFa: 'کارت‌های اعتباری وب۳ و گیفت‌کارت‌های جهانی 💳',
      titleEn: 'Web3 Virtual Cards & Global Vouchers 💳',
      badgeFa: 'کارت و اشتراک',
      badgeEn: 'Virtual Cards',
      icon: CreditCard,
      image: '/mascot/griffi-card.jpg',
      contentFa: [
        'خرید آنی مسترکارت مجازی بین‌المللی و اشتراک تلگرام پریمیوم و اپل آیتونز با تتر.',
        'بدون نیاز به ویزاکارت فیزیکی یا حساب‌های بانکی خارجی تحریم‌شده.',
        'صدور آنی کد ووچر و اطلاعات کارت به صورت غیرحضانتی در کسری از ثانیه.'
      ],
      contentEn: [
        'Mint prepaid virtual Mastercards and subscription vouchers (OpenAI, Telegram, Apple) with crypto.',
        'Bypass international payment sanctions without needing foreign bank accounts.',
        'Instant non-custodial voucher code and card delivery on-chain.'
      ],
      tipFa: 'مناسب برای پرداخت مستقیم اشتراک ChatGPT Plus، Claude و سرورهای خارجی.',
      tipEn: 'Perfect for ChatGPT Plus, Claude Pro, and VPS hosting payments.'
    },
    {
      titleFa: 'شناسه ماندگار tehran.griffi بدون هزینه تمدید 🌐',
      titleEn: 'Web3 Human Handles & Domains 🌐',
      badgeFa: 'دامنه‌های وب۳',
      badgeEn: 'Web3 Identity',
      icon: Globe,
      image: '/mascot/griffi-domains.jpg',
      contentFa: [
        'جایگزینی آدرس‌های طولانی با دامنه‌های کوتاه tehran.griffi و .iran.',
        'مالکیت دائمی و مادام‌العمر؛ صفر دلار هزینه تمدید سالانه (برخلاف اتریوم).',
        'ثبت با کمترین گس روی شبکه آربیتروم و دریافت پاسپورت NFT.'
      ],
      contentEn: [
        'Replace long 0x addresses with tehran.griffi and .iran human-readable handles.',
        'Lifetime ownership with zero yearly renewal fees.',
        'Minted as an ERC-721 NFT badge with negligible Layer-2 gas fees.'
      ],
      tipFa: 'انتقال و دریافت آسان رمزارز با تایپ نام کاربری به جای آدرس‌های طولانی 0x.',
      tipEn: 'Send and receive tokens easily using your custom domain handle.'
    },
    {
      titleFa: 'حفظ ارزش دارایی با طلای دیجیتال و اسکرو P2P 👑',
      titleEn: 'Digital Gold Hedging & P2P Escrow 👑',
      badgeFa: 'طلا و اسکرو',
      badgeEn: 'Gold & Escrow',
      icon: Coins,
      image: '/mascot/griffi-gold-treasury.jpg',
      contentFa: [
        'خرید طلای فیزیکی بدون حباب ۲۰ درصدی سکه امامی و بدون اجرت طلافروشی با توکن PAXG.',
        'مبادله همتابه‌همتای تتر و تومان از طریق قرارداد هوشمند اسکرو امن.',
        'واریز مستقیم ریال به شماره شبای تاییدشده بانکی با سیستم داوری غیرمتمرکز.'
      ],
      contentEn: [
        'Hedge against inflation with physical gold tokens (PAXG) saving on domestic coin bubbles and jeweler fees.',
        'Trade P2P USDT/Toman safely through non-custodial smart contract escrow.',
        'Direct Iranian bank Sheba settlement with decentralized dispute arbitration.'
      ],
      tipFa: 'طلای دیجیتال PAXG قابلیت تقسیم‌پذیری تا سوت را بدون افت ارزش فراهم می‌کند.',
      tipEn: 'PAXG tokens allow buying physical gold fractions with high liquidity.'
    },
    {
      titleFa: 'شفافیت ۱۰۰٪ کارمزدها و دریافت پرهای گریفی 🪶',
      titleEn: '100% Fee Transparency & Griffi Feathers 🪶',
      badgeFa: 'پایان تور و جایزه',
      badgeEn: 'Completion & Reward',
      icon: Award,
      image: '/mascot/griffi-flower.jpg',
      contentFa: [
        'در گریفین‌سواپ هیچ کارمزد مخفی وجود ندارد. تمام کارمزدهای سواپ (۰.۵٪) شفاف هستند و به آدرس رسمی خزانه پروتکل منتقل می‌شوند.',
        'با تکمیل این تور، ۸۰ پر گریفی (Griffi Feathers) در بخش باشگاه وفاداری کسب کردید!',
        'حالا آماده‌اید تا اولین سواپ بدون تحریم و ارزان خود را با همراهی گریفی تجربه کنید.'
      ],
      contentEn: [
        'Zero hidden spreads. All 0.5% protocol commissions route directly to the transparent treasury wallet.',
        'By completing this guided tour, you earned 80 Griffi Feathers in the Loyalty Pass!',
        'You are now fully equipped to perform fast, low-fee, censorship-free swaps with Griffi.'
      ],
      tipFa: 'آدرس رسمی خزانه کارمزدها: 0xD9C10B10945D85396f0838EA045587a25FD2A2D3',
      tipEn: 'Official Commission Wallet: 0xD9C10B10945D85396f0838EA045587a25FD2A2D3'
    }
  ];

  const current = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    playClickSound();
    if (isLast) {
      playSwapSuccessSound();
      try {
        localStorage.setItem('griffi_tour_completed', 'true');
        const currFeathers = parseInt(localStorage.getItem('griffi_loyalty_feathers') || '120', 10);
        localStorage.setItem('griffi_loyalty_feathers', (currFeathers + 50).toString());
      } catch (e) {
        // ignore storage errors
      }
      if (onCompleteTour) onCompleteTour();
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    playClickSound();
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(commissionWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in text-right">
      <div 
        className={`w-full max-w-xl rounded-3xl p-6 sm:p-7 border shadow-2xl relative overflow-hidden transition-all ${
          isDarkMode 
            ? 'bg-[#150f2f] border-purple-500/40 text-slate-100 shadow-purple-900/50' 
            : 'bg-white border-purple-200 text-slate-800 shadow-2xl'
        }`}
      >
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-52 h-52 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Top Header: Progress & Close */}
        <div className="flex items-center justify-between mb-4 border-b border-purple-500/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-400">
              {isFa ? `مرحله ${currentStep + 1} از ${steps.length}` : `Step ${currentStep + 1} of ${steps.length}`}
            </span>
            <div className="flex items-center gap-1">
              {steps.map((_, idx) => (
                <span 
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep 
                      ? 'w-6 bg-gradient-to-r from-amber-400 to-purple-500' 
                      : idx < currentStep 
                        ? 'w-2 bg-emerald-400' 
                        : 'w-2 bg-purple-900/50'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title={isFa ? 'بستن راهنما' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mascot Image & Title Banner */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-2 ring-amber-400/70 shadow-xl bg-purple-950/40 shrink-0">
            <img 
              src={current.image} 
              alt="Griffi Guide" 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
            />
          </div>

          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-950/60 border border-purple-400/30 text-[11px] font-bold text-amber-300 mb-1">
              <current.icon className="w-3 h-3 text-amber-400" />
              <span>{isFa ? current.badgeFa : current.badgeEn}</span>
            </span>
            <h3 className="text-base sm:text-lg font-black text-white leading-tight">
              {isFa ? current.titleFa : current.titleEn}
            </h3>
          </div>
        </div>

        {/* Content Paragraphs */}
        <div className="space-y-2 mb-4 text-xs text-slate-300 leading-relaxed min-h-[110px]">
          {(isFa ? current.contentFa : current.contentEn).map((paragraph, pIdx) => (
            <p key={pIdx}>
              {paragraph}
            </p>
          ))}
        </div>

        {/* Golden Tip Box */}
        {current.tipFa && (
          <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-xs text-amber-200 mb-4 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-snug font-medium">
              {isFa ? current.tipFa : current.tipEn}
            </span>
          </div>
        )}

        {/* Transparency callout on final step */}
        {isLast && (
          <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/30 mb-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isFa ? 'آدرس خزانه کارمزدها:' : 'Treasury Wallet:'}</span>
            </div>
            <button
              onClick={handleCopyWallet}
              className="text-amber-300 hover:underline flex items-center gap-1 font-mono text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>0xD9C1...A2D3</span>
            </button>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-purple-500/20">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 text-slate-300 hover:text-white bg-purple-950/40 border border-purple-500/20 hover:bg-purple-900/50"
          >
            <ChevronRight className="w-4 h-4" />
            <span>{isFa ? 'مرحله قبل' : 'Previous'}</span>
          </button>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span>{isLast ? (isFa ? 'پایان و دریافت ۵۰ پر گریفی 🎉' : 'Finish & Claim 50 Feathers 🎉') : (isFa ? 'مرحله بعد' : 'Next')}</span>
            {!isLast && <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
};
