// LI.FI integration configuration & helpers for GriffinSwap

export const LIFI_CONFIG = {
  integrator: "GriffinSwap",
  fee: 0.005, // 0.5% integrator fee
  feeRecipient: "0xD9C10B10945D85396f0838EA045587a25FD2A2D3", // Official GriffinSwap commission & treasury wallet
  commissionWallet: "0xD9C10B10945D85396f0838EA045587a25FD2A2D3",
  apiUrl: "https://li.quest/v1",
};

export interface ChainOption {
  id: number;
  name: string;
  key: string;
  logo: string;
  isPopularInIran?: boolean;
}

export const POPULAR_CHAINS: ChainOption[] = [
  { id: 1, name: "Ethereum", key: "eth", logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
  { id: 42161, name: "Arbitrum", key: "arb", logo: "https://assets.coingecko.com/coins/images/16547/large/arbitrum_logo.png", isPopularInIran: true },
  { id: 56, name: "BNB Chain (BSC)", key: "bsc", logo: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png", isPopularInIran: true },
  { id: 137, name: "Polygon", key: "pol", logo: "https://assets.coingecko.com/coins/images/4713/large/polygon.png", isPopularInIran: true },
  { id: 8453, name: "Base", key: "base", logo: "https://assets.coingecko.com/coins/images/30397/large/base_logo.png", isPopularInIran: true },
  { id: 10, name: "Optimism", key: "opt", logo: "https://assets.coingecko.com/coins/images/25244/large/Optimism.png" },
  { id: 43114, name: "Avalanche", key: "ava", logo: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png" },
  { id: 1151111081099710, name: "Solana", key: "sol", logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png", isPopularInIran: true },
];

// Persian translation overrides for LI.FI Widget
export const PERSIAN_WIDGET_TRANSLATIONS = {
  button: {
    connectWallet: "اتصال کیف پول",
    resetSettings: "بازنشانی تنظیمات",
    light: "روشن",
    dark: "تاریک",
    auto: "خودکار",
    ok: "تأیید",
    swap: "انجام مبادله",
    buy: "خرید",
    cancel: "انصراف",
    continue: "ادامه",
    copyAddress: "کپی کردن آدرس",
    viewOnExplorer: "مشاهده در بلاک‌چین",
    disconnect: "قطع اتصال",
    reviewSwap: "بررسی مبادله",
  },
  header: {
    swap: "مبادله و پل بین‌زنجیره‌ای",
    selectWallet: "کیف پول خود را انتخاب کنید",
    settings: "تنظیمات پیشرفته",
    from: "مبدأ (پرداخت)",
    to: "مقصد (دریافت)",
    routes: "مسیرهای پیشنهادی",
    swapHistory: "تاریخچه مبادلات",
  },
  swap: {
    from: "از",
    to: "به",
    fromAmount: "شما پرداخت می‌کنید",
    toAmount: "شما دریافت می‌کنید",
    tags: {
      recommended: "پیشنهادی",
      fastest: "سریع‌ترین",
      cheapest: "ارزان‌ترین",
      safest: "امن‌ترین",
    },
    warning: {
      message: {
        insufficientFunds: "موجودی شما برای انجام این تراکنش کافی نیست.",
        insufficientGas: "موجودی کارمزد شبکه (گس) کافی نیست.",
      },
    },
    selectChainAndToken: "انتخاب شبکه و رمزارز",
    tokenSearch: "جستجوی نام یا آدرس قرارداد توکن...",
    sendToWallet: "ارسال به آدرس دیگر",
    walletAddressOrEns: "آدرس کیف پول یا دامنه ENS",
  },
  settings: {
    routePriority: "اولویت انتخاب مسیر",
    slippage: "میزان لغزش مجاز (اسلیپیج)",
    showDestinationWallet: "نمایش کیف پول مقصد",
    enabledBridges: "پل‌های فعال",
    enabledExchanges: "صرافی‌های فعال",
    gasPrice: {
      slow: "آرام",
      normal: "عادی",
      fast: "سریع",
      title: "هزینه گس شبکه",
    },
  },
};

// Direct quote fetch via LI.FI REST API
export async function getDirectQuote(params: {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromAddress?: string;
}) {
  const query = new URLSearchParams({
    fromChain: params.fromChain.toString(),
    toChain: params.toChain.toString(),
    fromToken: params.fromToken,
    toToken: params.toToken,
    fromAmount: params.fromAmount,
    integrator: LIFI_CONFIG.integrator,
    fee: LIFI_CONFIG.fee.toString(),
    feeRecipient: LIFI_CONFIG.feeRecipient,
    ...(params.fromAddress ? { fromAddress: params.fromAddress } : {}),
  });

  const res = await fetch(`${LIFI_CONFIG.apiUrl}/quote?${query.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "خطا در دریافت نرخ مسیر مبادله");
  }
  return await res.json();
}
