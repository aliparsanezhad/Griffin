import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  X, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  CheckCircle2, 
  Receipt 
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';
import { playClickSound, playSwapSuccessSound } from '../services/soundService';

interface TaxExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tomanRate: number;
  walletAddress: string | null;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
}

interface TaxTransaction {
  id: string;
  shamsiDate: string;
  gregorianDate: string;
  type: 'swap' | 'bridge' | 'limit' | 'yield';
  fromToken: string;
  fromAmount: number;
  toToken: string;
  toAmount: number;
  historicalTomanRate: number;
  grossTomanValue: number;
  realizedPnlToman: number;
  feeUsdt: number;
  txHash: string;
}

export const TaxExportModal: React.FC<TaxExportModalProps> = ({
  isOpen,
  onClose,
  tomanRate,
  walletAddress,
  lang,
  isDarkMode = true,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const isFa = lang === 'fa';

  // Sample transactions with calculated historical Toman rates & P&L
  const sampleTransactions: TaxTransaction[] = [
    {
      id: 'tx-1',
      shamsiDate: '۱۴۰۵/۰۱/۱۸',
      gregorianDate: '2026-04-07',
      type: 'swap',
      fromToken: 'USDT',
      fromAmount: 2500,
      toToken: 'ETH',
      toAmount: 0.945,
      historicalTomanRate: 91200,
      grossTomanValue: 228000000,
      realizedPnlToman: 8400000,
      feeUsdt: 12.5,
      txHash: '0x8f4c...3e12',
    },
    {
      id: 'tx-2',
      shamsiDate: '۱۴۰۵/۰۱/۱۴',
      gregorianDate: '2026-04-03',
      type: 'bridge',
      fromToken: 'USDT (TON)',
      fromAmount: 1800,
      toToken: 'USDT (Arbitrum)',
      toAmount: 1791,
      historicalTomanRate: 90800,
      grossTomanValue: 163440000,
      realizedPnlToman: 4200000,
      feeUsdt: 9.0,
      txHash: '0x1a9c...7b84',
    },
    {
      id: 'tx-3',
      shamsiDate: '۱۴۰۴/۱۲/۲۸',
      gregorianDate: '2026-03-19',
      type: 'limit',
      fromToken: 'USDT',
      fromAmount: 4000,
      toToken: 'WBTC',
      toAmount: 0.059,
      historicalTomanRate: 89500,
      grossTomanValue: 358000000,
      realizedPnlToman: 19800000,
      feeUsdt: 20.0,
      txHash: '0x6d21...49fa',
    },
    {
      id: 'tx-4',
      shamsiDate: '۱۴۰۴/۱۲/۱۵',
      gregorianDate: '2026-03-06',
      type: 'yield',
      fromToken: 'GLP Vault',
      fromAmount: 150,
      toToken: 'USDT',
      toAmount: 150,
      historicalTomanRate: 88700,
      grossTomanValue: 13305000,
      realizedPnlToman: 13305000,
      feeUsdt: 0.75,
      txHash: '0x3c7e...8d01',
    },
    {
      id: 'tx-5',
      shamsiDate: '۱۴۰۴/۱۱/۳۰',
      gregorianDate: '2026-02-19',
      type: 'swap',
      fromToken: 'ARB',
      fromAmount: 3200,
      toToken: 'USDT',
      toAmount: 3450,
      historicalTomanRate: 87400,
      grossTomanValue: 301530000,
      realizedPnlToman: -2800000,
      feeUsdt: 17.25,
      txHash: '0x99e4...11ad',
    },
  ];

  const filtered = sampleTransactions.filter((tx) => {
    if (filterType === 'all') return true;
    return tx.type === filterType;
  });

  const totalGrossToman = filtered.reduce((acc, tx) => acc + tx.grossTomanValue, 0);
  const totalPnlToman = filtered.reduce((acc, tx) => acc + tx.realizedPnlToman, 0);
  const totalFeesUsdt = filtered.reduce((acc, tx) => acc + tx.feeUsdt, 0);

  // Generate & trigger CSV download with UTF-8 BOM
  const handleDownloadCsv = () => {
    playClickSound();
    const headers = [
      'ID',
      'تاریخ شمسی',
      'Gregorian Date',
      'نوع تراکنش (Type)',
      'توکن مبدا (From)',
      'مقدار مبدا (From Amount)',
      'توکن مقصد (To)',
      'مقدار مقصد (To Amount)',
      'نرخ تتر در تاریخ معامله (Toman Rate)',
      'ارزش ناخالص به تومان (Gross IRT)',
      'سود یا زیان محقق‌شده (Realized PnL IRT)',
      'کارمزد (Fee USDT)',
      'هش تراکنش (Tx Hash)',
    ];

    const rows = filtered.map((tx) => [
      tx.id,
      tx.shamsiDate,
      tx.gregorianDate,
      tx.type.toUpperCase(),
      tx.fromToken,
      tx.fromAmount,
      tx.toToken,
      tx.toAmount,
      tx.historicalTomanRate,
      tx.grossTomanValue,
      tx.realizedPnlToman,
      tx.feeUsdt,
      tx.txHash,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `griffinswap_tax_statement_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    playSwapSuccessSound();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    playClickSound();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 lg:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className={`w-full max-w-4xl rounded-3xl p-6 lg:p-8 border shadow-2xl relative my-auto transition-all ${
        isDarkMode ? 'bg-[#120c24] border-purple-500/30' : 'bg-white border-purple-200'
      }`}>
        {/* Close Button */}
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Mascot & Title */}
        <div className="flex items-center gap-4 pb-6 border-b border-purple-500/20 text-right">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-amber-400/50 shadow-lg shadow-purple-500/20 shrink-0">
            <img 
              src="/mascot/griffi-accountant.jpg" 
              alt="Griffi Accountant" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl lg:text-2xl font-black griffin-gradient-text">
                {isFa ? 'گزارش حسابداری و مالیاتی معاملات وب۳' : 'Web3 Tax & Portfolio Accounting Statement'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Receipt className="w-3 h-3 text-amber-400" />
                معادل تومانی
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {isFa
                ? `محاسبه دقیق سود، زیان و کارمزد معاملات به تومان بر اساس نرخ تاریخی (نرخ لحظه‌ای فعلی: ${toPersianDigits(formatToman(tomanRate, false))} ت)`
                : `Audited P&L report computed in Iranian Tomans (Current Spot: ${formatToman(tomanRate, false)} T)`}
            </p>
          </div>
        </div>

        {/* Summary Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className={`p-4 rounded-2xl border ${
            isDarkMode ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50 border-purple-200'
          }`}>
            <span className="text-[11px] text-slate-400 block mb-1">
              {isFa ? 'ارزش ناخالص مبادلات:' : 'Total Gross Volume:'}
            </span>
            <span className="text-base font-extrabold text-purple-300 font-mono">
              {isFa ? `${toPersianDigits(formatToman(totalGrossToman))} ت` : `${formatToman(totalGrossToman)} T`}
            </span>
          </div>

          <div className={`p-4 rounded-2xl border ${
            isDarkMode ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50 border-purple-200'
          }`}>
            <span className="text-[11px] text-slate-400 block mb-1">
              {isFa ? 'سود/زیان محقق‌شده به تومان:' : 'Realized P&L in Tomans:'}
            </span>
            <span className={`text-base font-extrabold font-mono flex items-center gap-1 ${
              totalPnlToman >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {totalPnlToman >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isFa ? `${toPersianDigits(formatToman(Math.abs(totalPnlToman)))} ت` : `${formatToman(Math.abs(totalPnlToman))} T`}
            </span>
          </div>

          <div className={`p-4 rounded-2xl border ${
            isDarkMode ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50 border-purple-200'
          }`}>
            <span className="text-[11px] text-slate-400 block mb-1">
              {isFa ? 'مجموع کارمزد پرداختی (۰.۵٪ دکس):' : 'Platform Commissions Paid:'}
            </span>
            <span className="text-base font-extrabold text-amber-400 font-mono">
              ${totalFeesUsdt.toFixed(2)} USDT
            </span>
          </div>
        </div>

        {/* Filter Controls & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-slate-400">{isFa ? 'فیلتر نوع:' : 'Filter:'}</span>
            {['all', 'swap', 'bridge', 'limit', 'yield'].map((ft) => (
              <button
                key={ft}
                onClick={() => {
                  playClickSound();
                  setFilterType(ft);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  filterType === ft
                    ? 'bg-purple-600 text-white shadow-sm'
                    : isDarkMode ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {ft === 'all' && (isFa ? 'همه' : 'All')}
                {ft === 'swap' && (isFa ? 'سواپ' : 'Swap')}
                {ft === 'bridge' && (isFa ? 'بریج' : 'Bridge')}
                {ft === 'limit' && (isFa ? 'لیمیت' : 'Limit')}
                {ft === 'yield' && (isFa ? 'سود' : 'Yield')}
              </button>
            ))}
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                isDarkMode ? 'border-purple-500/30 bg-purple-950/40 text-slate-300 hover:text-white' : 'border-purple-200 bg-purple-50 text-slate-700'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-purple-400" />
              <span>{isFa ? 'چاپ بیانیه' : 'Print'}</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02]"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>{isFa ? 'دانلود شد!' : 'Downloaded!'}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{isFa ? 'دانلود اکسل (CSV)' : 'Download CSV'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Transactions Audit Table */}
        <div className={`overflow-x-auto rounded-2xl border ${
          isDarkMode ? 'border-purple-500/20 bg-black/20' : 'border-purple-200 bg-white'
        }`}>
          <table className="w-full text-right text-xs">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-purple-500/20 text-slate-400' : 'border-purple-200 text-slate-600'}`}>
                <th className="p-3">{isFa ? 'تاریخ' : 'Date'}</th>
                <th className="p-3">{isFa ? 'نوع' : 'Type'}</th>
                <th className="p-3">{isFa ? 'مبادله' : 'Pair'}</th>
                <th className="p-3">{isFa ? 'نرخ تتر' : 'USDT Rate'}</th>
                <th className="p-3">{isFa ? 'ارزش تومانی' : 'Total IRT'}</th>
                <th className="p-3">{isFa ? 'سود/زیان' : 'Realized PnL'}</th>
                <th className="p-3">{isFa ? 'کارمزد' : 'Fee'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr 
                  key={tx.id} 
                  className={`border-b last:border-b-0 transition-colors ${
                    isDarkMode ? 'border-purple-500/10 hover:bg-white/5' : 'border-purple-100 hover:bg-purple-50/50'
                  }`}
                >
                  <td className="p-3 font-mono text-[11px]">
                    <div>{isFa ? toPersianDigits(tx.shamsiDate) : tx.shamsiDate}</div>
                    <div className="text-[10px] text-slate-500">{tx.gregorianDate}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 font-semibold">
                    {tx.fromAmount} {tx.fromToken} → {tx.toAmount} {tx.toToken}
                  </td>
                  <td className="p-3 font-mono text-amber-400">
                    {isFa ? `${toPersianDigits(formatToman(tx.historicalTomanRate, false))} ت` : `${formatToman(tx.historicalTomanRate, false)} T`}
                  </td>
                  <td className="p-3 font-mono">
                    {isFa ? `${toPersianDigits(formatToman(tx.grossTomanValue))} ت` : `${formatToman(tx.grossTomanValue)} T`}
                  </td>
                  <td className={`p-3 font-mono font-bold ${
                    tx.realizedPnlToman >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {tx.realizedPnlToman >= 0 ? '+' : ''}
                    {isFa ? `${toPersianDigits(formatToman(tx.realizedPnlToman))} ت` : `${formatToman(tx.realizedPnlToman)} T`}
                  </td>
                  <td className="p-3 font-mono text-slate-400">
                    ${tx.feeUsdt.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info note */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isFa 
                ? 'کیف پول کاربر:' 
                : 'Account:'} {walletAddress ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-6)}` : (isFa ? 'نسخه نمایشی' : 'Demo Account')}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">
            {isFa 
              ? 'فرمت خروجی استاندارد و سازگار با سیستم‌های مالیاتی و اکسل ایران' 
              : 'Standardized CSV schema compatible with Persian financial accounting software'}
          </span>
        </div>
      </div>
    </div>
  );
};
