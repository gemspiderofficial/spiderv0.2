import React from 'react';
import { Dialog } from '@headlessui/react';
import { useGameStore } from '../../store/useGameStore';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface WebtrapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WebtrapModal({ isOpen, onClose }: WebtrapModalProps) {
  const { player, updateBalance, updateWebtrap } = useGameStore();
  
  const { isUnlocked, level } = player.webtrap;
  const unlockCost = 300; // Cost in $SPIDER

  // Calculate upgrade cost with new progression
  const getUpgradeCost = (level: number): number => {
    const costs = [50, 80, 110, 150, 190, 260, 370, 450, 540];
    if (level <= costs.length) {
      return costs[level - 1];
    }
    // For levels beyond the predefined costs, increase by ~20% each level
    return Math.floor(costs[costs.length - 1] * Math.pow(1.2, level - costs.length));
  };
  
  const upgradeCost = getUpgradeCost(level);
  
  // Calculate hourly SPIDER generation
  const getHourlyRate = (level: number): number => {
    if (!isUnlocked) return 0;
    const baseRate = 1; // Base rate of 1 SPIDER per hour when unlocked
    let totalCost = 0;
    // Sum up all feeder costs up to current level
    for (let i = 1; i <= level; i++) {
      totalCost += getUpgradeCost(i);
    }
    const additionalRate = (totalCost / 100) * 0.2; // 0.2 per 100 feeders cost
    return baseRate + additionalRate;
  };
  
  const hourlyRate = getHourlyRate(level);
  const nextLevelRate = getHourlyRate(level + 1);
  const rateIncrease = nextLevelRate - hourlyRate;
  
  const handleUnlock = () => {
    if (player.balance.SPIDER >= unlockCost) {
      // Deduct the cost and unlock
      updateBalance({ SPIDER: player.balance.SPIDER - unlockCost });
      updateWebtrap({ 
        isUnlocked: true,
        lastCollection: new Date().toISOString()
      });
      onClose();
    }
  };
  
  const handleUpgrade = () => {
    if (player.balance.feeders >= upgradeCost) {
      // Deduct feeders and increase level
      updateBalance({ feeders: player.balance.feeders - upgradeCost });
      updateWebtrap({ level: level + 1 });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl relative max-h-[90vh] overflow-y-auto scrollbar-hide">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors z-10"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          
          <Dialog.Title className="text-xl font-bold mb-4 text-center mt-1">
            Webtrap
          </Dialog.Title>

          <div className="space-y-4">
            {/* Level Indicator */}
            <div className="bg-gray-100 rounded-xl p-3 text-center">
              <p className="text-sm text-gray-600">Level</p>
              <p className="text-2xl font-bold">{level}</p>
            </div>
            
            {/* Main Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center">
              <img 
                src="https://placehold.co/400x400/gray/white?text=🕸️"
                alt="Webtrap"
                className="w-full h-full object-cover"
              />
              
              {/* Production Rate Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2 text-center">
                <p className="text-white text-sm">
                  Producing {hourlyRate.toFixed(2)} $SPIDER/hour
                </p>
              </div>
            </div>

            {/* Action Button */}
            {!isUnlocked ? (
              <button
                onClick={handleUnlock}
                disabled={player.balance.SPIDER < unlockCost}
                className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Unlock ({unlockCost} $SPIDER)
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={player.balance.feeders < upgradeCost}
                className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upgrade ({upgradeCost} Feeders)
              </button>
            )}
            
            {/* Info Text */}
            <p className="text-sm text-gray-500 text-center">
              {!isUnlocked 
                ? "Unlock to start generating passive $SPIDER income"
                : `Next level increases production by ${rateIncrease.toFixed(2)} $SPIDER/hour`
              }
            </p>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}