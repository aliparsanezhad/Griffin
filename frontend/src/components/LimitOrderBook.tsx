import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Check, 
  X, 
  Clock, 
  ShieldCheck, 
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';
import { playClickSound, playSwapSuccessSound } from '../services/soundService';

interface LimitOrderBookProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
}

interface LimitOrder {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  priceUsd: number;
  amountToken: number;
  totalUsd: number;
  placedAt: string;
  status: 'active' | 'filled' | 'cancelled';
  signature: string;
}

export const LimitOrderBook: React.FC<LimitOrderBookProps> = ({
  tomanRate,
  lang,
  isDarkMode = true
}) => {
  const isFa = lang === 'fa';

  // Pair state
  const [selectedPair, setSelectedPair] = useState<'ETH/USDT' | 'BTC/USDT' | 'ARB/USDT'>('ETH/USDT');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  
  // Market live price state
  const basePrices: Record<string, number> = {
    'ETH/USDT': 3240.50,
    'BTC/USDT': 94500.00,
    'ARB/USDT': 0.725
  };
  const [currentMarketPrice, setCurrentMarketPrice] = useState<number>(basePrices['ETH/USDT']);

  // Order inputs
  const [targetPrice, setTargetPrice] = useState<string>(
    (basePrices['ETH/USDT'] * 0.96).toFixed(2)
  );
  const [orderAmount, setOrderAmount] = useState<string>('0.5');

  // Active / History Orders State
  const [orders, setOrders] = useState<LimitOrder[]>([
    {
      id: 'ord-101',
      pair: 'ETH/USDT',
      side: 'buy',
      priceUsd: 3100.00,
      amountToken: 0.85,
      totalUsd: 2635.00,
      placedAt: '۱۰ دقیقه پیش',
      status: 'active',
      signature: '0x3c99...e7a1'
    },
    {
      id: 'ord-102',
      pair: 'ETH/USDT',
      side: 'sell',
      priceUsd: 3450.00,
      amountToken: 0.50,
      totalUsd: 1725.00,
      placedAt: '۴ ساعت پیش',
      status: 'active',
      signature: '0x88f2...b401'
    },
    {
      id: 'ord-100',
      pair: 'ARB/USDT',
      side: 'buy',
      priceUsd: 0.68,
      amountToken: 1200,
      totalUsd: 816.00,
      placedAt: 'دیروز',
      status: 'filled',
      signature: '0xaa12...9990'
    }
  ]);

  // Permit2 Signing Modal State
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [signSuccess, setSignSuccess] = useState<boolean>(false);

  // Simulation execution notification
  const [simMessage, setSimMessage] = useState<string | null>(null);

  // Update market price when pair changes
  useEffect(() => {
    const base = basePrices[selectedPair];
    setCurrentMarketPrice(base);
    setTargetPrice(orderSide === 'buy' ? (base * 0.97).toFixed(2) : (base * 1.03).toFixed(2));
  }, [selectedPair, orderSide]);

  // Minor price ticking simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.49) * (currentMarketPrice * 0.001);
      setCurrentMarketPrice(prev => Number((prev + delta).toFixed(2)));
    }, 3500);
    return () => clearInterval(interval);
  }, [currentMarketPrice]);

  // Calculate order totals
  const numTargetPrice = parseFloat(targetPrice) || 0;
  const numAmount = parseFloat(orderAmount) || 0;
  const totalUsd = numTargetPrice * numAmount;
  const totalToman = totalUsd * tomanRate;

  // Handle Quick Price Presets
  const handlePricePreset = (percent: number) => {
    playClickSound();
    const newPrice = currentMarketPrice * (1 + percent / 100);
    setTargetPrice(newPrice.toFixed(2));
  };

  // Handle Place Order via Permit2
  const handleInitiateOrder = () => {
    playClickSound();
    setIsSigning(true);
  };

  const handleConfirmSignature = () => {
    playSwapSuccessSound();
    setIsSigning(false);
    setSignSuccess(true);

    const newOrder: LimitOrder = {
      id: `ord-${Math.floor(100 + Math.random() * 900)}`,
      pair: selectedPair,
      side: orderSide,
      priceUsd: numTargetPrice,
      amountToken: numAmount,
      totalUsd: totalUsd,
      placedAt: isFa ? 'هم‌اکنون' : 'Just now',
      status: 'active',
      signature: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
    };

    setOrders([newOrder, ...orders]);
    setTimeout(() => setSignSuccess(false), 4000);
  };

  const handleCancelOrder = (id: string) => {
    playClickSound();
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
  };

  // Simulate market price hitting the limit order to demonstrate fill
  const handleSimulateExecution = (order: LimitOrder) => {
    playSwapSuccessSound();
    setCurrentMarketPrice(order.priceUsd);
    setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'filled' } : o));
    setSimMessage(
      isFa 
        ? `🎉 سفارش ${order.pair} شما در قیمت ${toPersianDigits(order.priceUsd.toLocaleString())} دلار اجرا شد و به کیف‌پول واریز گردید!`
        : `🎉 Limit order ${order.pair} executed at $${order.priceUsd.toLocaleString()} and settled!`
    );
    setTimeout(() => setSimMessage(null), 6000);
  };

  // Simulated Order Book Ladder (Bids & Asks)
  const spreadPercent = 0.04;
  const asks = [
    { price: currentMarketPrice * 1.018, amount: 2.45, depth: 85 },
    { price: currentMarketPrice * 1.012, amount: 1.82, depth: 68 },
    { price: currentMarketPrice * 1.006, amount: 3.10, depth: 95 },
    { price: currentMarketPrice * 1.002, amount: 0.95, depth: 42 },
  ];
  const bids = [
    { price: currentMarketPrice * 0.998, amount: 1.25, depth: 55 },
    { price: currentMarketPrice * 0.994, amount: 2.80, depth: 90 },
    { price: currentMarketPrice * 0.988, amount: 4.15, depth: 100 },
    { price: currentMarketPrice * 0.982, amount: 1.60, depth: 60 },
  ];

  return (
    <div className={`w-full rounded-3xl p-5 md:p-8 border shadow-2xl transition-all ${
      isDarkMode 
        ? 'bg-[#100b24]/95 border-purple-500/25 text-slate-100 shadow-purple-950/40' 
        : 'bg-white border-purple-200 text-slate-800 shadow-xl'
    }`}>
      
      {/* Header with Griffi Trader Mascot */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-purple-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden ring-2 ring-purple-400/80 shadow-lg shrink-0 bg-black/40">
            <img 
              src="/mascot/griffi-trader.jpg" 
              alt="Griffi Trader" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-bold mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'دفتر سفارشات غیرحضانتی بدون کارمزد گس (Permit2)' : 'Non-Custodial Gasless Limit Orders'}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <span>{isFa ? 'سفارشات شرطی و دفتر عمق بازار گریفی' : 'Griffin Limit Order Book'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                EIP-712 Zero Gas
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {isFa 
                ? 'ثبت و لغو سفارشات لیمیت کاملاً آف‌چین با امضای دیجیتال و بدون مصرف گس انجام می‌شود. پس از رسیدن بازار به قیمت هدف شما، ربات‌های معتمد سفارش را اجرا می‌کنند.' 
                : 'Place and cancel limit orders completely off-chain with zero gas fees. Signed orders settle directly on-chain when the trigger price is hit.'}
            </p>
          </div>
        </div>

        {/* Pair selector pills */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-purple-500/25">
          {(['ETH/USDT', 'BTC/USDT', 'ARB/USDT'] as const).map(pair => (
            <button
              key={pair}
              onClick={() => {
                playClickSound();
                setSelectedPair(pair);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                selectedPair === pair 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {pair}
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Execution Banner if triggered */}
      {simMessage && (
        <div className="mt-4 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-sm font-bold flex items-center justify-between shadow-xl animate-fade-in">
          <span>{simMessage}</span>
          <button 
            onClick={() => setSimMessage(null)} 
            className="p-1 hover:bg-emerald-900/60 rounded-lg"
          >
            <X className="w-4 h-4 text-emerald-300" />
          </button>
        </div>
      )}

      {/* Main Grid: Form + Live Order Depth Book */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left / Center: Order Creation Form (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Buy / Sell Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-black/40 border border-purple-500/20">
            <button
              onClick={() => {
                playClickSound();
                setOrderSide('buy');
              }}
              className={`py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                orderSide === 'buy'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{isFa ? `خرید ${selectedPair.split('/')[0]} (Buy)` : `Buy ${selectedPair.split('/')[0]}`}</span>
            </button>
            <button
              onClick={() => {
                playClickSound();
                setOrderSide('sell');
              }}
              className={`py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                orderSide === 'sell'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>{isFa ? `فروش ${selectedPair.split('/')[0]} (Sell)` : `Sell ${selectedPair.split('/')[0]}`}</span>
            </button>
          </div>

          {/* Current Market Price Reference Card */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/25 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">
                {isFa ? 'قیمت فعلی بازار:' : 'Current Market Price:'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black font-mono text-white">
                  ${currentMarketPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-amber-300 font-mono">
                  ≈ {isFa ? `${toPersianDigits(formatToman(currentMarketPrice * tomanRate, false))} تومان` : `${formatToman(currentMarketPrice * tomanRate, false)} T`}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'کارمزد ساخت سفارش:' : 'Placement Gas:'}</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isFa ? 'رایگان (۰ گس)' : 'Free ($0 Gas)'}</span>
              </span>
            </div>
          </div>

          {/* Target Trigger Price Input */}
          <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                {isFa ? 'قیمت هدف برای اجرای سفارش (Trigger Price):' : 'Limit Trigger Price ($):'}
              </label>
              <span className="text-[10px] text-purple-300 font-mono">
                {isFa 
                  ? `معادل ${toPersianDigits(formatToman(numTargetPrice * tomanRate, false))} تومان`
                  : `≈ ${formatToman(numTargetPrice * tomanRate, false)} Tomans`}
              </span>
            </div>

            <div className="relative">
              <input 
                type="text" 
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="w-full bg-purple-950/60 border border-purple-500/40 rounded-xl px-4 py-3 text-white font-mono text-base font-bold focus:outline-none focus:border-purple-400"
                placeholder="0.00"
              />
              <span className="absolute left-3 top-3.5 text-xs text-slate-400 font-mono">USD</span>
            </div>

            {/* Quick Price Percentage Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-400">{isFa ? 'تنظیم سریع:' : 'Quick:'}</span>
              {[-5, -2, 0, 2, 5].map((pct) => (
                <button
                  key={pct}
                  onClick={() => handlePricePreset(pct)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all ${
                    pct < 0 
                      ? 'bg-rose-950/50 text-rose-300 border border-rose-500/30 hover:bg-rose-900/60'
                      : pct === 0 
                      ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30 hover:bg-purple-800/60'
                      : 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60'
                  }`}
                >
                  {pct > 0 ? `+${pct}%` : pct === 0 ? (isFa ? 'بازار' : 'Mkt') : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                {isFa ? `حجم ${selectedPair.split('/')[0]} برای معامله:` : `Order Size (${selectedPair.split('/')[0]}):`}
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {isFa ? 'موجودی در دسترس: ۱.۸۵' : 'Balance: 1.85'}
              </span>
            </div>

            <div className="relative">
              <input 
                type="text" 
                value={orderAmount}
                onChange={(e) => setOrderAmount(e.target.value)}
                className="w-full bg-purple-950/60 border border-purple-500/40 rounded-xl px-4 py-3 text-white font-mono text-base font-bold focus:outline-none focus:border-purple-400"
                placeholder="0.00"
              />
              <span className="absolute left-3 top-3.5 text-xs text-slate-400 font-mono">
                {selectedPair.split('/')[0]}
              </span>
            </div>

            {/* Quick Percentage Presets */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map(pct => (
                <button
                  key={pct}
                  onClick={() => {
                    playClickSound();
                    setOrderAmount((1.85 * (pct / 100)).toFixed(3));
                  }}
                  className="py-1 rounded-lg bg-purple-950/40 border border-purple-500/20 text-[10px] font-mono text-purple-300 hover:bg-purple-900/50 transition-all"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Total Value Summary Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/50 to-indigo-950/50 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">{isFa ? 'ارزش کل سفارش:' : 'Order Total Value:'}</span>
              <span className="font-black font-mono text-white text-sm">
                ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{isFa ? 'معادل تومانی:' : 'Toman Equivalent:'}</span>
              <span className="font-black font-mono text-amber-300 text-sm">
                {isFa ? `${toPersianDigits(formatToman(totalToman, false))} تومان` : `${formatToman(totalToman, false)} Tomans`}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-purple-500/20 text-slate-400">
              <span>{isFa ? 'کارمزد اجرای لیمیت (۰.۰۵٪ به خزانه):' : 'Protocol Settle Fee (0.05% to Treasury):'}</span>
              <span className="font-mono text-purple-300">
                ${(totalUsd * 0.0005).toFixed(2)} (0xD9C1...A2D3)
              </span>
            </div>
          </div>

          {/* Place Order CTA Button */}
          {signSuccess ? (
            <div className="w-full p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-white flex items-center justify-center gap-2 shadow-xl font-bold text-sm animate-fade-in">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>{isFa ? 'سفارش لیمیت شما با امضای رایگان Permit2 ثبت شد!' : 'Order submitted with Permit2 signature!'}</span>
            </div>
          ) : (
            <button
              onClick={handleInitiateOrder}
              disabled={numTargetPrice <= 0 || numAmount <= 0}
              className={`w-full py-4 rounded-2xl text-white font-black text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                orderSide === 'buy'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/30'
                  : 'bg-gradient-to-r from-rose-600 via-purple-600 to-rose-700 hover:from-rose-500 hover:to-purple-500 shadow-rose-900/30'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>
                {isFa 
                  ? `ثبت سفارش ${orderSide === 'buy' ? 'خرید' : 'فروش'} با امضای آف‌چین رایگان`
                  : `Sign & Place Gasless ${orderSide === 'buy' ? 'Buy' : 'Sell'} Order`}
              </span>
            </button>
          )}

        </div>

        {/* Right: Live Visual Depth Book Ladder (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-2xl bg-black/50 border border-purple-500/25 space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isFa ? 'عمق بازار زنده (Order Book)' : 'Live Market Depth'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {selectedPair}
              </span>
            </div>

            {/* Table headers */}
            <div className="grid grid-cols-3 text-[10px] font-bold text-slate-400 py-2 border-b border-purple-500/10">
              <span>{isFa ? 'قیمت (USD)' : 'Price ($)'}</span>
              <span className="text-center">{isFa ? 'حجم' : 'Size'}</span>
              <span className="text-left">{isFa ? 'عمق' : 'Depth'}</span>
            </div>

            {/* Asks (Sell orders in red) */}
            <div className="space-y-1 py-1">
              {asks.map((ask, idx) => (
                <div 
                  key={idx}
                  onClick={() => setTargetPrice(ask.price.toFixed(2))}
                  className="grid grid-cols-3 text-[11px] font-mono py-1 px-1 rounded hover:bg-rose-950/30 cursor-pointer relative items-center transition-colors"
                >
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-rose-500/15 rounded pointer-events-none"
                    style={{ width: `${ask.depth}%` }}
                  />
                  <span className="text-rose-400 font-bold z-10">
                    ${ask.price.toFixed(2)}
                  </span>
                  <span className="text-slate-300 text-center z-10">{ask.amount}</span>
                  <span className="text-slate-400 text-left z-10">${(ask.price * ask.amount).toFixed(0)}</span>
                </div>
              ))}
            </div>

            {/* Spread Row */}
            <div className="my-2 py-2 px-3 rounded-xl bg-purple-950/60 border border-purple-500/20 flex items-center justify-between text-xs">
              <span className="text-amber-300 font-mono font-bold">
                ${currentMarketPrice.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400">
                {isFa ? 'اسپرد:' : 'Spread:'} <span className="text-emerald-400 font-mono">{spreadPercent}%</span>
              </span>
            </div>

            {/* Bids (Buy orders in green) */}
            <div className="space-y-1 py-1">
              {bids.map((bid, idx) => (
                <div 
                  key={idx}
                  onClick={() => setTargetPrice(bid.price.toFixed(2))}
                  className="grid grid-cols-3 text-[11px] font-mono py-1 px-1 rounded hover:bg-emerald-950/30 cursor-pointer relative items-center transition-colors"
                >
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 rounded pointer-events-none"
                    style={{ width: `${bid.depth}%` }}
                  />
                  <span className="text-emerald-400 font-bold z-10">
                    ${bid.price.toFixed(2)}
                  </span>
                  <span className="text-slate-300 text-center z-10">{bid.amount}</span>
                  <span className="text-slate-400 text-left z-10">${(bid.price * bid.amount).toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info Box on Permit2 */}
          <div className="p-3 rounded-xl bg-purple-900/20 border border-purple-500/20 text-[11px] text-slate-300 space-y-1">
            <span className="text-purple-300 font-bold flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>{isFa ? 'چرا سفارشات لیمیت گریفین؟' : 'Why Griffin Limit Orders?'}</span>
            </span>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {isFa 
                ? 'دارایی‌ها تا لحظه اجرای معامله در کیف‌پول شما باقی می‌مانند و هیچ صرافی متمرکزی دسترسی مسدودسازی سرمایه شما را نخواهد داشت.'
                : 'Assets stay in your personal wallet until execution. Zero risk of exchange freeze or custody insolvency.'}
            </p>
          </div>
        </div>

      </div>

      {/* Orders Table: Active & History */}
      <div className="mt-8 pt-6 border-t border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>{isFa ? 'سفارشات شرطی ثبت‌شده شما' : 'Your Limit Orders'}</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 text-xs border border-purple-500/30 font-mono">
              {orders.filter(o => o.status === 'active').length} {isFa ? 'فعال' : 'active'}
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-purple-500/20 text-slate-400 pb-2">
                <th className="py-2.5 px-3">{isFa ? 'جفت‌ارز' : 'Pair'}</th>
                <th className="py-2.5 px-3">{isFa ? 'نوع' : 'Side'}</th>
                <th className="py-2.5 px-3">{isFa ? 'قیمت هدف' : 'Target Price'}</th>
                <th className="py-2.5 px-3">{isFa ? 'ارزش تومانی' : 'Toman Value'}</th>
                <th className="py-2.5 px-3">{isFa ? 'حجم' : 'Amount'}</th>
                <th className="py-2.5 px-3">{isFa ? 'وضعیت' : 'Status'}</th>
                <th className="py-2.5 px-3 text-center">{isFa ? 'عملیات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-purple-950/20 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-white">{ord.pair}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ord.side === 'buy'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                    }`}>
                      {ord.side === 'buy' ? (isFa ? 'خرید' : 'BUY') : (isFa ? 'فروش' : 'SELL')}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-200">
                    ${ord.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 font-mono text-amber-300">
                    {isFa ? `${toPersianDigits(formatToman(ord.totalUsd * tomanRate, false))} تومان` : `${formatToman(ord.totalUsd * tomanRate, false)} T`}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {ord.amountToken} {ord.pair.split('/')[0]}
                  </td>
                  <td className="py-3 px-3">
                    {ord.status === 'active' && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span>{isFa ? 'در انتظار قیمت' : 'Pending'}</span>
                      </span>
                    )}
                    {ord.status === 'filled' && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>{isFa ? 'انجام شده' : 'Filled'}</span>
                      </span>
                    )}
                    {ord.status === 'cancelled' && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-bold">
                        <X className="w-3.5 h-3.5" />
                        <span>{isFa ? 'لغو شده' : 'Cancelled'}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {ord.status === 'active' && (
                      <div className="flex items-center justify-center gap-2">
                        {/* Simulation trigger button */}
                        <button
                          onClick={() => handleSimulateExecution(ord)}
                          title={isFa ? 'شبیه‌سازی اجرای معامله در بازار' : 'Simulate market execution'}
                          className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[10px] text-emerald-300 hover:bg-emerald-900/60 flex items-center gap-1 transition-all"
                        >
                          <Play className="w-3 h-3" />
                          <span>{isFa ? 'تست اجرا' : 'Simulate'}</span>
                        </button>
                        <button
                          onClick={() => handleCancelOrder(ord.id)}
                          title={isFa ? 'لغو سفارش بدون کارمزد' : 'Cancel order (0 gas)'}
                          className="p-1.5 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 hover:bg-rose-900/60 transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permit2 EIP-712 Signing Dialog Modal */}
      {isSigning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#140e2e] border border-purple-500/40 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-sm text-white">
                  {isFa ? 'امضای دیجیتال EIP-712 Permit2' : 'EIP-712 Permit2 Signature'}
                </h3>
              </div>
              <button 
                onClick={() => setIsSigning(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isFa
                ? 'شما در حال امضای یک سفارش لیمیت آف‌چین هستید. این عملیات نیازی به تراکنش آنچین یا پرداخت گس ندارد.'
                : 'You are signing an off-chain limit order. This requires zero on-chain gas fees.'}
            </p>

            {/* Structured Data Preview */}
            <div className="p-3.5 rounded-xl bg-black/50 border border-purple-500/25 font-mono text-[11px] space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Pair:</span>
                <span className="text-white font-bold">{selectedPair}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Action:</span>
                <span className={orderSide === 'buy' ? 'text-emerald-400' : 'text-rose-400'}>
                  {orderSide.toUpperCase()} {orderAmount} {selectedPair.split('/')[0]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Trigger:</span>
                <span className="text-amber-300 font-bold">${targetPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total:</span>
                <span className="text-white">${totalUsd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Treasury Fee:</span>
                <span className="text-purple-300">0.05% (0xD9C1...A2D3)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gas Fee:</span>
                <span className="text-emerald-400 font-bold">$0.00 (Gasless)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsSigning(false)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-300 transition-all"
              >
                {isFa ? 'انصراف' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmSignature}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-xs font-black text-white shadow-lg shadow-purple-600/30 transition-all"
              >
                {isFa ? 'تایید و امضای سفارش' : 'Confirm & Sign'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
