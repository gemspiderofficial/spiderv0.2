import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useGameStore } from '../../store/useGameStore';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface DevourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DevourModal({ isOpen, onClose }: DevourModalProps) {
  const { player, updateSpider, removeSpider } = useGameStore();
  const [selectedSpider, setSelectedSpider] = useState<string | null>(null);
  const [targetSpider, setTargetSpider] = useState<string | null>(null);

  // Get genetic display text with color
  const getGeneticDisplay = (genetic: string) => {
    const colors: Record<string, string> = {
      'S': 'text-blue-500',
      'A': 'text-green-500',
      'J': 'text-purple-500',
      'SA': 'text-indigo-500',
      'SJ': 'text-cyan-500',
      'AJ': 'text-emerald-500',
      'SAJ': 'text-amber-500 font-bold',
    };
    
    return <span className={colors[genetic] || 'text-gray-500'}>{genetic}</span>;
  };

  const handleDevour = () => {
    if (!selectedSpider || !targetSpider) return;
    
    const spiderToDevour = player.spiders.find(s => s.id === selectedSpider);
    const spiderTarget = player.spiders.find(s => s.id === targetSpider);
    
    if (!spiderToDevour || !spiderTarget) return;
    
    // Calculate power bonus based on the devoured spider's rarity and level
    let powerBonus = 0;
    switch (spiderToDevour.rarity) {
      case 'Common': powerBonus = 10 + spiderToDevour.level * 2; break;
      case 'Excellent': powerBonus = 20 + spiderToDevour.level * 3; break;
      case 'Rare': powerBonus = 30 + spiderToDevour.level * 4; break;
      case 'Epic': powerBonus = 50 + spiderToDevour.level * 5; break;
      case 'Legendary': powerBonus = 80 + spiderToDevour.level * 7; break;
      case 'Mythical': powerBonus = 120 + spiderToDevour.level * 10; break;
    }
    
    // Add genetic bonus based on the devoured spider's genetics
    let geneticBonus = 0;
    switch (spiderToDevour.genetics) {
      case 'S': geneticBonus = 5; break;
      case 'A': geneticBonus = 6; break;
      case 'J': geneticBonus = 7; break;
      case 'SA': geneticBonus = 12; break;
      case 'SJ': geneticBonus = 14; break;
      case 'AJ': geneticBonus = 15; break;
      case 'SAJ': geneticBonus = 25; break;
    }
    
    // Calculate experience transfer (50% of the devoured spider's experience)
    const experienceTransfer = spiderToDevour.experience * 0.5;
    
    // Update the target spider
    updateSpider(targetSpider, {
      power: spiderTarget.power + powerBonus + geneticBonus,
      experience: spiderTarget.experience + experienceTransfer,
      level: Math.floor((spiderTarget.experience + experienceTransfer) / 100) + 1
    });
    
    // Remove the devoured spider
    removeSpider(selectedSpider);
    
    onClose();
  };

  // Filter out the default spider (first spider) from the devourable spiders list
  const devourableSpiders = player.spiders.slice(1);

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
            Devour Spider
          </Dialog.Title>

          <div className="space-y-4">
            <p className="text-gray-600 text-center">Select a spider to devour:</p>
            
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {devourableSpiders.length === 0 ? (
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">No spiders available to devour.</p>
                  <p className="text-sm text-gray-400 mt-1">You need more than one spider!</p>
                </div>
              ) : (
                devourableSpiders.map((spider) => (
                  <button
                    key={spider.id}
                    onClick={() => setSelectedSpider(spider.id)}
                    className={`p-3 rounded-xl border-2 transition-colors w-full text-left ${
                      selectedSpider === spider.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{spider.name}</div>
                        <div className="text-sm text-gray-500">Level {spider.level} • {spider.rarity}</div>
                        <div className="text-sm text-gray-500">Power: {spider.power}</div>
                        <div className="text-sm">Genetics: {getGeneticDisplay(spider.genetics)}</div>
                      </div>
                      <div className="text-2xl">🕷️</div>
                    </div>
                  </button>
                ))
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-gray-600 mb-2 text-center">Select target spider to gain power:</p>
              
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {player.spiders.filter(s => s.id !== selectedSpider).map((spider) => (
                  <button
                    key={spider.id}
                    onClick={() => setTargetSpider(spider.id)}
                    className={`p-3 rounded-xl border-2 transition-colors w-full text-left ${
                      targetSpider === spider.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{spider.name}</div>
                        <div className="text-sm text-gray-500">Level {spider.level} • {spider.rarity}</div>
                        <div className="text-sm text-gray-500">Power: {spider.power}</div>
                        <div className="text-sm">Genetics: {getGeneticDisplay(spider.genetics)}</div>
                      </div>
                      <div className="text-2xl">🕷️</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {selectedSpider && targetSpider && (
              <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                <p className="font-medium text-yellow-800">Warning!</p>
                <p className="text-sm text-yellow-700">
                  Devouring a spider will permanently remove it from your collection.
                  This action cannot be undone.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleDevour}
              disabled={!selectedSpider || !targetSpider}
              className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Devour
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}