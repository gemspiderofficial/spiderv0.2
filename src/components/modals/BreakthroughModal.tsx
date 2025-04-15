import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useGameStore } from '../../store/useGameStore';
import { Rarity } from '../../types/spider';
import { RARITY_LEVELS } from '../../constants/game';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BreakthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BreakthroughModal({ isOpen, onClose }: BreakthroughModalProps) {
  const { player, updateSpider, updateBalance } = useGameStore();
  const [selectedSpider, setSelectedSpider] = useState<string | null>(null);

  const getRarityCost = (rarity: Rarity): number => {
    switch (rarity) {
      case 'Common': return 1000;
      case 'Excellent': return 2500;
      case 'Rare': return 5000;
      case 'Epic': return 10000;
      case 'Legendary': return 25000;
      default: return Infinity; // Mythical can't be upgraded further
    }
  };

  const getNextRarity = (rarity: Rarity): Rarity => {
    switch (rarity) {
      case 'Common': return 'Excellent';
      case 'Excellent': return 'Rare';
      case 'Rare': return 'Epic';
      case 'Epic': return 'Legendary';
      case 'Legendary': return 'Mythical';
      default: return rarity; // No upgrade for Mythical
    }
  };

  const getPowerIncrease = (rarity: Rarity): number => {
    switch (rarity) {
      case 'Common': return 50;
      case 'Excellent': return 80;
      case 'Rare': return 120;
      case 'Epic': return 180;
      case 'Legendary': return 250;
      default: return 0;
    }
  };

  const handleBreakthrough = () => {
    if (!selectedSpider) return;
    
    const spider = player.spiders.find(s => s.id === selectedSpider);
    if (!spider) return;
    
    const cost = getRarityCost(spider.rarity);
    if (player.balance.SPIDER < cost) return;
    
    const nextRarity = getNextRarity(spider.rarity);
    const powerIncrease = getPowerIncrease(spider.rarity);
    
    // Update the spider
    updateSpider(selectedSpider, {
      rarity: nextRarity,
      power: spider.power + powerIncrease,
    });
    
    // Deduct the cost
    updateBalance({ SPIDER: player.balance.SPIDER - cost });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl relative sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
          {/* Close button in the upper right corner */}
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors z-10"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          
          <Dialog.Title className="text-xl font-bold mb-4 text-center mt-1">
            Spider Breakthrough
          </Dialog.Title>

          <div className="space-y-4">
            <p className="text-gray-600 text-center">Select a spider to upgrade its rarity:</p>
            
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {player.spiders.filter(s => s.rarity !== 'Mythical').map((spider) => {
                const cost = getRarityCost(spider.rarity);
                const nextRarity = getNextRarity(spider.rarity);
                const powerIncrease = getPowerIncrease(spider.rarity);
                const currentMaxLevel = RARITY_LEVELS[spider.rarity];
                const nextMaxLevel = RARITY_LEVELS[nextRarity];
                
                return (
                  <button
                    key={spider.id}
                    onClick={() => setSelectedSpider(spider.id)}
                    className={`p-4 rounded-xl border-2 transition-colors w-full text-left ${
                      selectedSpider === spider.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{spider.name}</div>
                        <div className="text-sm text-gray-500">Level {spider.level} • {spider.rarity}</div>
                        <div className="text-sm text-gray-500">Power: {spider.power}</div>
                        <div className="mt-1 text-sm font-medium text-purple-600">
                          Upgrade to {nextRarity} (+{powerIncrease} Power)
                        </div>
                        <div className="text-xs text-gray-500">
                          Max Level: {currentMaxLevel} → {nextMaxLevel}
                        </div>
                      </div>
                      <div className="text-blue-500 font-bold">{cost} $SPIDER</div>
                    </div>
                  </button>
                );
              })}
              
              {player.spiders.filter(s => s.rarity !== 'Mythical').length === 0 && (
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">All your spiders are already at Mythical rarity!</p>
                </div>
              )}
            </div>
            
            {selectedSpider && (
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
                <p className="font-medium">Breakthrough Benefits:</p>
                <ul className="text-sm list-disc list-inside mt-1 space-y-1">
                  <li>Increased base power</li>
                  <li>Higher token generation rate</li>
                  <li>Better breeding outcomes</li>
                  <li>Improved stats growth per level</li>
                  <li>Higher level cap</li>
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleBreakthrough}
              disabled={
                !selectedSpider || 
                player.balance.SPIDER < (selectedSpider ? 
                  getRarityCost(player.spiders.find(s => s.id === selectedSpider)?.rarity as Rarity) : 
                  Infinity)
              }
              className="w-full bg-purple-500 text-white py-3 rounded-xl hover:bg-purple-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Breakthrough
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}