// Anti-Censorship & Anti-Sanctions Guide for Iranian Web3 Users

export interface AntiCensorshipRpc {
  chain: string;
  name: string;
  url: string;
  features: string;
  privacyRating: "عالی" | "بسیار خوب" | "خوب";
}

export const ANTI_CENSORSHIP_RPCS: AntiCensorshipRpc[] = [
  {
    chain: "Ethereum (Mainnet)",
    name: "1RPC (Automata)",
    url: "https://1rpc.io/eth",
    features: "حذف کامل IP، عدم ذخیره لاگ، ضد ردگیری تحریم",
    privacyRating: "عالی",
  },
  {
    chain: "Ethereum (Mainnet)",
    name: "Cloudflare Web3",
    url: "https://cloudflare-eth.com",
    features: "بدون محدودیت جغرافیایی، سرعت و آپ‌تایم بالا",
    privacyRating: "بسیار خوب",
  },
  {
    chain: "Arbitrum One",
    name: "1RPC Arbitrum",
    url: "https://1rpc.io/arb",
    features: "مقاوم در برابر مسدودسازی، بدون کوکی و تله‌متری",
    privacyRating: "عالی",
  },
  {
    chain: "Arbitrum One",
    name: "LlamaNodes Public",
    url: "https://arbitrum.llamarpc.com",
    features: "ارائه‌دهنده مستقل جامعه دیفای، بدون تحریم",
    privacyRating: "عالی",
  },
  {
    chain: "BNB Smart Chain (BSC)",
    name: "Ankr Public BSC",
    url: "https://rpc.ankr.com/bsc",
    features: "پشتیبانی از ترافیک ایران، پایداری بالا",
    privacyRating: "بسیار خوب",
  },
  {
    chain: "Polygon (PoS)",
    name: "1RPC Polygon",
    url: "https://1rpc.io/matic",
    features: "حفظ حریم خصوصی آدرس و جلوگیری از MEV",
    privacyRating: "عالی",
  },
  {
    chain: "Base",
    name: "Base 1RPC",
    url: "https://1rpc.io/base",
    features: "دور زدن تحریم‌های ارائه‌دهندگان رسمی شبکه بیس",
    privacyRating: "عالی",
  },
];

export interface SecurityTip {
  id: string;
  title: string;
  description: string;
  badge: string;
  critical?: boolean;
}

export const IRANIAN_SECURITY_TIPS: SecurityTip[] = [
  {
    id: "tip-noncustodial",
    title: "چرا گریفین سواپ کاملاً غیرحضانتی (Non-Custodial) است؟",
    description: "در صرافی‌های متمرکز (مثل بایننس، بای‌بیت یا کوکوین)، کلید خصوصی دست صرافی است و حساب کاربر ایرانی به سادگی مسدود می‌شود. در گریفین سواپ دارایی‌ها مستقیم از کیف پول شخصی شما مبادله شده و هیچ نهادی قادر به فریز کردن یا توقیف سرمایه شما در این پلتفرم نیست.",
    badge: "امنیت دارایی",
    critical: true,
  },
  {
    id: "tip-intermediate-wallet",
    title: "قانون طلایی: هرگز مستقیم بین صرافی داخلی و خارجی جابه‌جا نکنید!",
    description: "تتر یا ارزهای خریداری شده از صرافی‌های رمزارز ایرانی را مستقیماً به قراردادهای خارجی، بریج‌ها یا بالعکس واریز نکنید. همیشه از یک کیف پول شخصی واسط (مانند ربی والت Rabby یا متامسک MetaMask) به عنوان لایه میانی استفاده کنید.",
    badge: "جلوگیری از بلک‌لیست",
    critical: true,
  },
  {
    id: "tip-custom-rpc",
    title: "حل مشکل خطای اتصال (RPC Error 403) در ایران",
    description: "زیرساخت‌های پیش‌فرض کیف پول‌ها (مانند Infura یا Alchemy) آی‌پی ایران را محدود می‌کنند. با تغییر URL شبکه در تنظیمات کیف پول خود به یکی از RPCهای آزاد (مانند 1RPC یا LlamaNodes)، این محدودیت کاملاً رفع می‌شود.",
    badge: "ضدتحریم و بدون قطعی",
  },
  {
    id: "tip-cheap-chains",
    title: "شبکه‌های ارزان و مناسب برای واریز و برداشت",
    description: "به جای انتقال تتر روی شبکه اتریوم (با کارمزدهای چند دلاری)، از شبکه‌های لایه دوم مثل آربیتروم (Arbitrum)، بیس (Base) یا ترون (Tron) استفاده کنید که کارمزد آن‌ها معمولاً زیر ۰.۰۵ دلار است.",
    badge: "مدیریت کارمزد",
  },
];
