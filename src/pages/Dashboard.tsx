import { useState, useEffect, lazy, Suspense } from 'react';
import { useGameStore } from '../store/useGameStore';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingScreen } from '../components/LoadingScreen';
import { getSpiderImage } from '../utils/spiderImage';
import { Dialog } from '@headlessui/react';
import { experienceForNextLevel, getFeedersNeeded, getFeedingCost } from '../utils/core';
import { useAuthContext } from '../contexts/AuthContext';
import { InstructionPanel } from '../components/InstructionPanel';
import { ArrowDownOnSquareIcon } from '@heroicons/react/24/outline';

const RankingModal = lazy(() => 
  import('../components/modals/RankingModal')
    .then(mod => ({ default: mod.RankingModal }))
    .catch(() => {
      console.error('Failed to load RankingModal');
      return { default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => isOpen ? <div onClick={onClose} /> : null };
    })
);
const BreedingModal = lazy(() => import('../components/modals/BreedingModal').then(mod => ({ default: mod.BreedingModal })));
const RedeemModal = lazy(() => import('../components/modals/RedeemModal').then(mod => ({ default: mod.RedeemModal })));
const SummonModal = lazy(() => import('../components/modals/SummonModal').then(mod => ({ default: mod.SummonModal })));
const DressModal = lazy(() => import('../components/modals/DressModal').then(mod => ({ default: mod.DressModal })));
const WebtrapModal = lazy(() => import('../components/modals/WebtrapModal').then(mod => ({ default: mod.WebtrapModal })));
const DevourModal = lazy(() => import('../components/modals/DevourModal').then(mod => ({ default: mod.DevourModal })));
const BreakthroughModal = lazy(() => import('../components/modals/BreakthroughModal').then(mod => ({ default: mod.BreakthroughModal })));
const SpiderModal = lazy(() => import('../components/modals/SpiderModal').then(mod => ({ default: mod.SpiderModal })));
const DepositModal = lazy(() => import('../components/modals/DepositModal').then(mod => ({ default: mod.DepositModal })));

function Dashboard() {
  const { player, feedSpiderAction, hydrateSpiderAction, updateTokens, updateBalance, updateSpider } = useGameStore();
  const { isBalanceLoading } = useAuthContext();
  const activeSpider = player.spiders && player.spiders.length > 0 ? player.spiders[0] : undefined;

  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [isBreedingOpen, setIsBreedingOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [isSummonOpen, setIsSummonOpen] = useState(false);
  const [isDressOpen, setIsDressOpen] = useState(false);
  const [isWebtrapOpen, setIsWebtrapOpen] = useState(false);
  const [isDevourOpen, setIsDevourOpen] = useState(false);
  const [isBreakthroughOpen, setIsBreakthroughOpen] = useState(false);
  const [isSpiderModalOpen, setIsSpiderModalOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ top: string; left?: string; right?: string }>({ top: '50%', left: '50%' });
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: 'heal' | 'feed' | 'hydrate';
    cost: number;
    currency: 'SPIDER' | 'feeders';
  } | null>(null);

  const webPoints = [
    { top: '25%', left: '25%' },
    { top: '25%', right: '25%' },
    { top: '50%', left: '50%' },
    { top: '75%', left: '25%' },
    { top: '75%', right: '25%' },
    { top: '35%', left: '35%' },
    { top: '35%', right: '35%' },
    { top: '65%', left: '35%' },
    { top: '65%', right: '35%' },
    { top: '50%', left: '25%' },
    { top: '50%', right: '25%' },
    { top: '40%', left: '50%' },
    { top: '60%', left: '50%' },
    { top: '15%', left: '50%' },
    { top: '85%', left: '50%' },
    { top: '50%', left: '15%' },
    { top: '50%', right: '15%' },
    { top: '30%', left: '30%' },
    { top: '30%', right: '30%' },
    { top: '70%', left: '30%' },
    { top: '70%', right: '30%' },
    { top: '45%', left: '45%' },
    { top: '55%', left: '55%' },
    { top: '20%', left: '40%' },
    { top: '40%', right: '20%' }
  ];

  useEffect(() => {
    const moveSpider = () => {
      const randomPoint = webPoints[Math.floor(Math.random() * webPoints.length)];
      setCurrentPosition(randomPoint);
    };

    const interval = setInterval(moveSpider, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateTokens();
    }, 60000);
    return () => clearInterval(interval);
  }, [updateTokens]);

  const nextLevelXP = activeSpider ? experienceForNextLevel(activeSpider.level) : 0;
  const currentLevelXP = activeSpider ? experienceForNextLevel(activeSpider.level - 1) : 0;
  const progressToNextLevel = activeSpider
    ? ((activeSpider.experience - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    : 0;

  const handleHeal = () => {
    const healCost = 50;
    if (activeSpider && player.balance.SPIDER >= healCost) {
      setConfirmationModal({
        isOpen: true,
        type: 'heal',
        cost: healCost,
        currency: 'SPIDER'
      });
    }
  };

  const handleFeed = () => {
    if (activeSpider) {
      const feedingCost = getFeedingCost(activeSpider.level);
      if (player.balance.feeders >= feedingCost) {
        setConfirmationModal({
          isOpen: true,
          type: 'feed',
          cost: feedingCost,
          currency: 'feeders'
        });
      }
    }
  };

  const handleHydrate = () => {
    if (activeSpider) {
      const feedersNeeded = getFeedersNeeded(activeSpider.level);
      if (player.balance.feeders >= feedersNeeded) {
        setConfirmationModal({
          isOpen: true,
          type: 'hydrate',
          cost: feedersNeeded,
          currency: 'feeders'
        });
      }
    }
  };

  const handleConfirm = () => {
    if (!confirmationModal || !activeSpider) return;

    switch (confirmationModal.type) {
      case 'heal':
      updateSpider(activeSpider.id, {
        condition: {
          ...activeSpider.condition,
          health: Math.min(100, activeSpider.condition.health + 20),
        }
      });
        updateBalance({ SPIDER: player.balance.SPIDER - confirmationModal.cost });
        break;
      case 'feed':
        feedSpiderAction(activeSpider.id);
        break;
      case 'hydrate':
        hydrateSpiderAction(activeSpider.id);
        break;
    }
    setConfirmationModal(null);
  };

  const renderDashboardContent = () => {
  if (!activeSpider) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-white">
          <InstructionPanel onOpenDeposit={() => setIsDepositOpen(true)} />
          
          <div className="glass-panel p-6 rounded-2xl max-w-lg w-full text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome to Gem Spider</h1>
            <p className="mb-6">
              You don't have any spiders yet. Summon your first spider to start playing!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setIsSummonOpen(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Summon Spider
              </button>
              <button
                onClick={() => window.location.href = '/market'}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Visit Market
              </button>
          </div>
        </div>
      </div>
    );
  }

  return (
      <>
        {player.balance.SPIDER < 200 && (
          <div className="absolute top-20 left-0 right-0 px-4 sm:px-6 z-30">
            <InstructionPanel onOpenDeposit={() => setIsDepositOpen(true)} />
          </div>
        )}
        
      <div className="fixed top-4 left-0 right-0 px-4 sm:px-6 z-40">
        <div className="glass-panel p-2 sm:p-3 max-w-md mx-auto flex justify-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2">
            <img 
              src="https://placehold.co/20x20/blue/white?text=$" 
              alt="SPIDER token" 
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
            />
            <span className="text-white text-xs sm:text-sm">|</span>
              <span className="text-white text-xs sm:text-sm font-bold">
                {isBalanceLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  player.balance.SPIDER
                )}
              </span>
              <button 
                onClick={() => setIsDepositOpen(true)}
                className="ml-1 bg-blue-500 hover:bg-blue-600 rounded-full p-1 transition-colors"
                title="Deposit $SPIDER tokens"
              >
                <ArrowDownOnSquareIcon className="w-3 h-3 text-white" />
              </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-white text-xs sm:text-sm">🍖</span>
            <span className="text-white text-xs sm:text-sm">|</span>
            <span className="text-white text-xs sm:text-sm font-bold">{player.balance.feeders}</span>
          </div>
        </div>
          
          {player.balance.SPIDER < 200 && (
            <div className="max-w-md mx-auto mt-2 p-2 bg-yellow-500/80 rounded-lg text-white text-xs text-center">
              <p>Your $SPIDER balance is low! <button onClick={() => setIsDepositOpen(true)} className="underline font-bold">Deposit tokens</button> to summon spiders.</p>
            </div>
          )}
      </div>

      <div className="side-buttons fixed left-2 sm:left-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-6 sm:gap-8 z-40">
        <button 
          onClick={() => setIsRankingOpen(true)}
          className="relative group w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600">
          </div>
          <span className="relative z-10">
            <img src="src/assets/buttons/ranking.png" alt="Rankings" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
          </span>
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 opacity-0 group-hover:opacity-100 group-hover:translate-y-4 transition-all duration-300 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full whitespace-nowrap z-50">Rankings</span>
        </button>

        <button 
          onClick={() => setIsBreedingOpen(true)}
          className="relative group w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600">
          </div>
          <span className="relative z-10">
            <img src="src/assets/buttons/breeding.png" alt="Breeding" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
          </span>
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 opacity-0 group-hover:opacity-100 group-hover:translate-y-4 transition-all duration-300 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full whitespace-nowrap z-50">Breeding</span>
        </button>

        <button 
          onClick={() => setIsRedeemOpen(true)}
          className="relative group w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600">
          </div>
          <span className="relative z-10">
            <img src="src/assets/buttons/redeem.png" alt="Redeem" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
          </span>
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 opacity-0 group-hover:opacity-100 group-hover:translate-y-4 transition-all duration-300 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full whitespace-nowrap z-50">Redeem</span>
        </button>

        <button 
          onClick={() => setIsDevourOpen(true)}
          className="relative group w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-400 to-red-600">
          </div>
          <span className="relative z-10">
            <img src="src/assets/buttons/devour.png" alt="Devour" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
          </span>
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 opacity-0 group-hover:opacity-100 group-hover:translate-y-4 transition-all duration-300 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full whitespace-nowrap z-50">Devour</span>
        </button>

        <button 
          onClick={() => setIsBreakthroughOpen(true)}
          className="relative group w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800">
          </div>
          <span className="relative z-10">
            <img src="src/assets/buttons/breakthrough.png" alt="Breakthrough" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
          </span>
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 opacity-0 group-hover:opacity-100 group-hover:translate-y-4 transition-all duration-300 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full whitespace-nowrap z-50">Breakthrough</span>
        </button>
      </div>

      <div className="right-buttons fixed right-2 sm:right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-6 sm:gap-8 z-40">
        <button 
          onClick={() => setIsSummonOpen(true)}
          className="relative group w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600">
          </div>
          <span className="relative z-10">
            <img src="src/assets/buttons/summon.png" alt="Summon" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
          </span>
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 opacity-0 group-hover:opacity-100 group-hover:translate-y-4 transition-all duration-300 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full whitespace-nowrap z-50">Summon</span>
        </button>

        <button 
          onClick={() => setIsDressOpen(true)}
          className="relative group w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600">
          </div>
          <span className="relative z-10">
            <img src="src/assets/buttons/dress.png" alt="Dress" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
          </span>
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 opacity-0 group-hover:opacity-100 group-hover:translate-y-4 transition-all duration-300 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full whitespace-nowrap z-50">Dress</span>
        </button>

        <button 
          onClick={() => setIsWebtrapOpen(true)}
          className="relative group w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600">
          </div>
          <span className="relative z-10">
            <img src="src/assets/webtrap.png" alt="Webtrap" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
          </span>
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 opacity-0 group-hover:opacity-100 group-hover:translate-y-4 transition-all duration-300 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full whitespace-nowrap z-50">Webtrap</span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-sm sm:max-w-md">
          <img 
            src="src/assets/webtrap.png" 
            alt="Spider Web Background"
            className="w-full opacity-80"
          />
          
          <div 
            className="absolute transition-all duration-[5000ms] ease-in-out"
            style={{
              ...currentPosition,
              transform: `translate(-50%, -50%)`
            }}
          >
            <button 
              onClick={() => setIsSpiderModalOpen(true)}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform"
            >
              <img 
                src={activeSpider ? getSpiderImage(activeSpider.genetics) : "src/assets/Home.png"}
                alt="Spider" 
                className="w-full h-full object-cover rounded-2xl"
              />
            </button>
          </div>
          
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 glass-panel px-2 sm:px-3 py-1 rounded-xl w-24 sm:w-28">
            <div className="flex justify-center items-center">
              <span className="text-white font-bold text-xs sm:text-sm">Level {activeSpider.level}</span>
            </div>
            <div className="w-full h-1 sm:h-1.5 bg-teal-900/50 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 sm:bottom-24 left-0 right-0 px-4 sm:px-6 z-40">
        <div className="glass-panel p-2 sm:p-3 max-w-md mx-auto">
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1">
                <span className="text-white text-xs sm:text-sm">❤️</span>
                <span className="text-white text-xs font-medium">Health</span>
              </div>
              <span className="text-white text-xs font-bold">{Math.round(activeSpider.condition.health)}%</span>
            </div>
            <div className="relative group flex items-center">
              <div className="flex-1 h-2 sm:h-2.5 bg-gray-700/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-300"
                  style={{ width: `${activeSpider.condition.health}%` }}
                ></div>
              </div>
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black/80 text-white text-xs rounded pointer-events-none whitespace-nowrap">
                Cost: 50 $SPIDER
              </div>
              <button 
                onClick={handleHeal}
                disabled={player.balance.SPIDER < 50}
                className="ml-2 bg-red-500 text-white w-16 sm:w-[72px] h-5 sm:h-6 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-medium shadow-md hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-red-500"
              >
                Heal
              </button>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1">
                <span className="text-white text-xs sm:text-sm">🍖</span>
                <span className="text-white text-xs font-medium">Hunger</span>
              </div>
              <span className="text-white text-xs font-bold">{Math.round(activeSpider.condition.hunger)}%</span>
            </div>
            <div className="relative group flex items-center">
              <div className="flex-1 h-2 sm:h-2.5 bg-gray-700/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${activeSpider.condition.hunger}%` }}
                ></div>
              </div>
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black/80 text-white text-xs rounded pointer-events-none whitespace-nowrap">
                Cost: {getFeedingCost(activeSpider.level)} Feeders (Adds XP even at 100%)
              </div>
              <button 
                onClick={handleFeed}
                disabled={player.balance.feeders < getFeedingCost(activeSpider.level)}
                className="ml-2 bg-amber-500 text-white w-16 sm:w-[72px] h-5 sm:h-6 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-medium shadow-md hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-500"
              >
                Feed
              </button>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1">
                <span className="text-white text-xs sm:text-sm">💧</span>
                <span className="text-white text-xs font-medium">Hydration</span>
              </div>
              <span className="text-white text-xs font-bold">{Math.round(activeSpider.condition.hydration)}%</span>
            </div>
            <div className="relative group flex items-center">
              <div className="flex-1 h-2 sm:h-2.5 bg-gray-700/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-300"
                  style={{ width: `${activeSpider.condition.hydration}%` }}
                ></div>
              </div>
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black/80 text-white text-xs rounded pointer-events-none whitespace-nowrap">
                Cost: {getFeedersNeeded(activeSpider.level)} Feeders (Adds XP even at 100%)
              </div>
              <button 
                onClick={handleHydrate}
                disabled={player.balance.feeders < getFeedersNeeded(activeSpider.level)}
                className="ml-2 bg-blue-500 text-white w-16 sm:w-[72px] h-5 sm:h-6 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-medium shadow-md hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500"
              >
                Hydrate
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog 
        open={confirmationModal?.isOpen ?? false} 
        onClose={() => setConfirmationModal(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="glass-panel p-4 rounded-2xl max-w-sm w-full">
            <Dialog.Title className="text-lg font-medium text-white mb-2">
              Confirm {confirmationModal?.type ? confirmationModal.type.charAt(0).toUpperCase() + confirmationModal.type.slice(1) : ''}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-300 mb-4">
              {confirmationModal?.type === 'heal' && 'Heal your spider by 20% for 50 $SPIDER?'}
              {confirmationModal?.type === 'feed' && `Feed your spider for ${confirmationModal.cost} Feeders?`}
              {confirmationModal?.type === 'hydrate' && `Hydrate your spider for ${confirmationModal.cost} Feeders?`}
            </Dialog.Description>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmationModal(null)}
                className="px-3 py-1 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-3 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Confirm
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      </>
    );
  };

  return (
    <div className="game-container">
      {renderDashboardContent()}
      
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen fullscreen={false} />}>
          {isRankingOpen && <RankingModal isOpen={isRankingOpen} onClose={() => setIsRankingOpen(false)} />}
          {isBreedingOpen && <BreedingModal isOpen={isBreedingOpen} onClose={() => setIsBreedingOpen(false)} />}
          {isRedeemOpen && <RedeemModal isOpen={isRedeemOpen} onClose={() => setIsRedeemOpen(false)} />}
          {isSummonOpen && <SummonModal isOpen={isSummonOpen} onClose={() => setIsSummonOpen(false)} />}
          {isDressOpen && <DressModal isOpen={isDressOpen} onClose={() => setIsDressOpen(false)} />}
          {isWebtrapOpen && <WebtrapModal isOpen={isWebtrapOpen} onClose={() => setIsWebtrapOpen(false)} />}
          {isDevourOpen && <DevourModal isOpen={isDevourOpen} onClose={() => setIsDevourOpen(false)} />}
          {isBreakthroughOpen && <BreakthroughModal isOpen={isBreakthroughOpen} onClose={() => setIsBreakthroughOpen(false)} />}
          {isSpiderModalOpen && activeSpider && activeSpider.id && (
            <SpiderModal 
              isOpen={isSpiderModalOpen} 
              onClose={() => setIsSpiderModalOpen(false)} 
              spiderId={activeSpider.id} 
            />
          )}
          {isDepositOpen && <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default Dashboard;