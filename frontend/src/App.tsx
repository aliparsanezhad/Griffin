import { useState, useEffect } from 'react';
import { Navbar, type NavTab } from './components/Navbar';
import { SwapSection } from './components/SwapSection';
import { PerpFuturesSection } from './components/PerpFuturesSection';
import { Web3CardsSection } from './components/Web3CardsSection';
import { GriffinDomainsSection } from './components/GriffinDomainsSection';
import { PortfolioSection } from './components/PortfolioSection';
import { LaunchpadSection } from './components/LaunchpadSection';
import { EarnSection } from './components/EarnSection';
import { TomanCalculator } from './components/TomanCalculator';
import { GasTracker } from './components/GasTracker';
import { SecurityHub } from './components/SecurityHub';
import { PriceChart } from './components/PriceChart';
import { MarketSentimentGauge } from './components/MarketSentimentGauge';
import { ArbitrageScanner } from './components/ArbitrageScanner';
import { DcaSection } from './components/DcaSection';
import { GriffiLoyalty } from './components/GriffiLoyalty';
import { RouteInspector } from './components/RouteInspector';
import { TelegramMiniAppSection } from './components/TelegramMiniAppSection';
import { GoldHedgingDesk } from './components/GoldHedgingDesk';
import { P2pEscrowSection } from './components/P2pEscrowSection';
import { GriffiAssistant } from './components/GriffiAssistant';
import { GriffiTour } from './components/GriffiTour';
import { MarketTicker } from './components/MarketTicker';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { fetchLiveTomanRate, FALLBACK_RATE } from './services/tomanService';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('swap');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [tomanRate, setTomanRate] = useState<number>(FALLBACK_RATE.usdt_irt);
  const [rateChange, setRateChange] = useState<string>(FALLBACK_RATE.change_24h);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showTour, setShowTour] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [swapParams, setSwapParams] = useState<{ from?: string; to?: string; amount?: string } | null>(null);

  // Sync direction with language
  useEffect(() => {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('bg-slate-100', 'text-slate-900');
      document.body.classList.add('bg-[#0b0817]', 'text-slate-100');
    } else {
      document.body.classList.remove('bg-[#0b0817]', 'text-slate-100');
      document.body.classList.add('bg-slate-100', 'text-slate-900');
    }
  }, [isDarkMode]);

  // Fetch live Toman rate on mount and every 60 seconds
  useEffect(() => {
    const loadRate = async () => {
      const data = await fetchLiveTomanRate();
      setTomanRate(data.usdt_irt);
      setRateChange(data.change_24h);
    };
    loadRate();
    const interval = setInterval(loadRate, 60000);
    return () => clearInterval(interval);
  }, []);

  // Connect wallet handler (MetaMask, Rabby, Trust Wallet, etc.)
  const handleConnectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      } catch (err) {
        console.warn('Wallet connection cancelled or failed', err);
      }
    } else {
      // If no wallet extension detected, use a sample demo address for immediate exploration
      setWalletAddress('0x71C8705a2B88e3083feC7B58273683243354438F');
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
  };

  const handleSelectVaultToDeposit = (_vault: any) => {
    setActiveTab('swap');
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between relative overflow-hidden ${isDarkMode ? 'bg-[#0b0817]' : 'bg-slate-100'}`}>
      
      {/* Dynamic Mythical Griffin Background Aura / Glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-mesh-grid">
        <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] rounded-full ambient-glow-1 blur-3xl opacity-40 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-[450px] h-[450px] rounded-full ambient-glow-2 blur-3xl opacity-30" />
        <div className="absolute -bottom-20 right-10 w-[600px] h-[600px] rounded-full ambient-glow-3 blur-3xl opacity-25" />
      </div>

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tomanRate={tomanRate}
        rateChange={rateChange}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        lang={lang}
        setLang={setLang}
        walletAddress={walletAddress}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        onOpenTour={() => setShowTour(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Real-Time Iranian & Global Market Ticker Ribbon */}
      <MarketTicker
        tomanRate={tomanRate}
        rateChange={rateChange}
        lang={lang}
        isDarkMode={isDarkMode}
        onSelectPair={(_pairId) => setActiveTab('chart')}
      />

      {/* Dynamic Main Body Content */}
      <main className="flex-1 w-full flex flex-col items-center pb-24 lg:pb-0">
        {activeTab === 'swap' && (
          <SwapSection
            tomanRate={tomanRate}
            isDarkMode={isDarkMode}
            lang={lang}
            walletAddress={walletAddress}
            initialFromSymbol={swapParams?.from}
            initialToSymbol={swapParams?.to}
            initialAmount={swapParams?.amount}
          />
        )}

        {activeTab === 'futures' && (
          <div className="w-full max-w-6xl py-6 px-4 animate-fade-in">
            <PerpFuturesSection
              tomanRate={tomanRate}
              lang={lang}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {activeTab === 'launchpad' && (
          <div className="w-full max-w-6xl py-6 px-4 animate-fade-in">
            <LaunchpadSection
              tomanRate={tomanRate}
              lang={lang}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {activeTab === 'cards' && (
          <div className="w-full max-w-6xl py-6 px-4 animate-fade-in">
            <Web3CardsSection
              tomanRate={tomanRate}
              lang={lang}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {activeTab === 'domains' && (
          <div className="w-full max-w-6xl py-6 px-4 animate-fade-in">
            <GriffinDomainsSection
              tomanRate={tomanRate}
              lang={lang}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {activeTab === 'portfolio' && (
          <PortfolioSection
            walletAddress={walletAddress}
            onConnectWallet={handleConnectWallet}
            tomanRate={tomanRate}
            lang={lang}
          />
        )}

        {activeTab === 'earn' && (
          <EarnSection
            tomanRate={tomanRate}
            lang={lang}
            isDarkMode={isDarkMode}
            onSelectVaultToDeposit={handleSelectVaultToDeposit}
          />
        )}

        {activeTab === 'calculator' && (
          <TomanCalculator
            tomanRate={tomanRate}
            rateChange={rateChange}
            lang={lang}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'gold' && (
          <div className="w-full max-w-5xl py-6 px-4 animate-fade-in">
            <GoldHedgingDesk
              tomanRate={tomanRate}
              lang={lang}
              isDarkMode={isDarkMode}
              onInitiateSwap={(fromToken, toToken, amount) => {
                setSwapParams({ from: fromToken, to: toToken, amount });
                setActiveTab('swap');
              }}
            />
          </div>
        )}

        {activeTab === 'p2p' && (
          <div className="w-full max-w-5xl py-6 px-4 animate-fade-in">
            <P2pEscrowSection
              tomanRate={tomanRate}
              lang={lang}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {activeTab === 'gas' && (
          <GasTracker
            tomanRate={tomanRate}
            lang={lang}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'chart' && (
          <div className="w-full max-w-6xl py-6 px-4 animate-fade-in space-y-8">
            <PriceChart
              tomanRate={tomanRate}
              lang={lang}
              isDarkMode={isDarkMode}
              onTradePair={(base, quote) => {
                setSwapParams({ from: quote, to: base, amount: '500' });
                setActiveTab('swap');
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
            />
            <MarketSentimentGauge
              tomanRate={tomanRate}
              lang={lang}
              isDarkMode={isDarkMode}
              onNavigateSwap={() => setActiveTab('swap')}
              onNavigateDca={() => setActiveTab('dca')}
            />
          </div>
        )}

        {activeTab === 'arbitrage' && (
          <div className="w-full max-w-6xl py-6 px-4 animate-fade-in">
            <ArbitrageScanner
              tomanRate={tomanRate}
              lang={lang}
              isDarkMode={isDarkMode}
              onNavigateSwap={() => setActiveTab('swap')}
            />
          </div>
        )}

        {activeTab === 'routes' && (
          <div className="w-full max-w-6xl py-6 px-4 animate-fade-in">
            <RouteInspector
              tomanRate={tomanRate}
              lang={lang}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {activeTab === 'dca' && (
          <div className="w-full max-w-5xl py-6 px-4 animate-fade-in">
            <DcaSection
              tomanRate={tomanRate}
              lang={lang}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="w-full max-w-5xl py-6 px-4 animate-fade-in">
            <GriffiLoyalty
              lang={lang}
              isDarkMode={isDarkMode}
              walletAddress={walletAddress}
              onConnectWallet={handleConnectWallet}
            />
          </div>
        )}

        {activeTab === 'security' && (
          <SecurityHub
            lang={lang}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'telegram' && (
          <div className="w-full max-w-5xl py-6 px-4 animate-fade-in">
            <TelegramMiniAppSection
              tomanRate={tomanRate}
              lang={lang}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </main>

      {/* Griffi Baby Griffin Floating Mascot Guide */}
      <GriffiAssistant 
        lang={lang} 
        isDarkMode={isDarkMode} 
        onStartTour={() => setShowTour(true)} 
      />

      {/* Guided Tour Interactive Modal */}
      <GriffiTour
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        lang={lang}
        isDarkMode={isDarkMode}
      />

      {/* Modern Persian Footer */}
      <Footer 
        lang={lang} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
      />

      {/* Floating Glassmorphic Mobile Bottom Dock Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        isDarkMode={isDarkMode}
        onOpenMoreMenu={() => setMobileMenuOpen(true)}
      />
    </div>
  );
}

export default App;
