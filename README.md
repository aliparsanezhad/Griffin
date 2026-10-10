# 🦅 گریفین سواپ | GriffinSwap
### صرافی غیرمتمرکز، چندزنجیره‌ای و ضدتحریم برای کاربران ایرانی
**A Full-Fledged Cross-Chain DEX, Bridge, and Portfolio Manager Tailored for the Iranian Web3 Community**

---

## 🌟 ویژگی‌های اختصاصی برای کاربران ایرانی (Key Features)

1. **مبادله و پل بین‌زنجیره‌ای (Cross-Chain Swap & Bridge)**:
   - اتصال به بیش از ۵۸ شبکه بلاک‌چین (Arbitrum، Optimism، Base، Polygon، BNB Chain، Solana، Ethereum، Tron و ...).
   - تجمیع خودکار نقدینگی از بیش از ۳۵ پل ارتباطی (Stargate، Across، Hop، Celer) و بیش از ۳۰ صرافی غیرمتمرکز (Uniswap، 1inch، PancakeSwap).
   - مسیردهی هوشمند بر اساس کمترین کارمزد، بالاترین سرعت یا بیشترین امنیت.

2. **ماشین‌حساب و نمایشگر نرخ زنده تتر و تومان (USDT/IRT Oracle)**:
   - دریافت آنی نرخ تتر به تومان از اوراکل بازار با نمایش تغییرات ۲۴ ساعته.
   - نمایش همزمان ارزش دلاری و تومانی تمامی دارایی‌ها و کارمزد تراکنش‌ها.
   - ماشین‌حساب دوطرفه: تتر ⇄ تومان ⇄ ریال ⇄ اتریوم ⇄ بیت‌کوین.

3. **مرکز امنیت، حریم خصوصی و ضدتحریم (Anti-Censorship Hub)**:
   - فهرست کامل ارائه‌دهندگان RPC آزاد (مانند 1RPC، Cloudflare، LlamaNodes) برای دور زدن خطای ۴۰۳ ناشی از تحریم‌های Infura و Alchemy.
   - راهنمای گام‌به‌گام جلوگیری از مسدودسازی و بلک‌لیست شدن آدرس‌ها در صرافی‌های متمرکز.
   - ۱۰۰٪ غیرحضانتی (Non-Custodial) و بدون نیاز به ثبت‌نام یا KYC.

4. **پرتفولیو و مانیتورینگ دارایی‌ها (Portfolio Manager)**:
   - نمایش تجمیعی کل موجودی کیف پول در شبکه‌های مختلف.
   - محاسبه ارزش دارایی‌ها به دلار و تومان.
   - تاریخچه تراکنش‌ها با دسترسی مستقیم به کاوشگرهای بلاک‌چین.

5. **فرصت‌های کسب سود و استیکینگ (DeFi Earn Vaults)**:
   - الهام‌گرفته از Jumper Earn و LI.FI Composer برای سرمایه‌گذاری سودآور در استخرهای مطمئن تتر و استیبل‌کوین‌ها (Aave، Morpho، Pendle) با بازدهی سالانه تا ۱۵٪.

6. **رهگیری زنده کارمزد شبکه‌ها (Gas Fee Tracker)**:
   - مقایسه هزینه انجام سواپ در شبکه‌های لایه اول و دوم با معادل تومانی جهت انتخاب ارزان‌ترین زمان انتقال.

---

## 🏗️ ساختار پروژه (Architecture)

```
GriffinSwap/
├── frontend/             # پنل مدرن React 19 + TypeScript + Vite + Tailwind v4
│   ├── src/
│   │   ├── components/   # کامپوننت‌های Navbar, SwapSection, Portfolio, Earn, TomanCalc, Gas, Security
│   │   ├── services/     # ماژول‌های اتصال به LI.FI, Moralis, Toman Oracle, Anti-Censorship RPCs
│   │   ├── App.tsx       # مدیریت وضعیت سراسری، تم و زبان
│   │   └── index.css     # استایل‌های Glassmorphism و فونت فارسی وزیرمتن
│   └── package.json
│
├── Project/
│   └── Backend/          # سرور Express برای Moralis EVM API و کش نرخ تتر و گس
│       ├── server.js
│       ├── .env
│       └── package.json
│
├── package.json          # اسکریپت‌های اجرای یکپارچه محیط کاری
└── README.md
```

---

## 🚀 راهنمای راه‌اندازی و اجرا (Quick Start)

### ۱. اجرای سرور بک‌اند (Backend):
```bash
npm run start:backend
# سرور روی پورت 5001 آماده دریافت درخواست‌ها خواهد بود
```

### ۲. اجرای رابط کاربری (Frontend):
```bash
npm run dev:frontend
# برنامه روی آدرس http://localhost:3000 اجرا می‌شود
```

---

## 🔒 امنیت و حریم خصوصی
- تمامی تراکنش‌ها مستقیماً در کیف پول شخصی شما (مانند Rabby یا MetaMask) امضا می‌شوند.
- هیچ کلید خصوصی یا اطلاعات حساسی به سرور ارسال یا ذخیره نمی‌شود.
- کارمزد پلتفرم گریفین سواپ تنها ۰.۵٪ بر اساس استاندارد Integrator Fee پروتکل LI.FI است.
