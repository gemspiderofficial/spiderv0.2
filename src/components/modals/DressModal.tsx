import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useGameStore } from '../../store/useGameStore';
import { Dress } from '../../types/spider';
import { XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface DressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DressModal({ isOpen, onClose }: DressModalProps) {
  const { player, updateSpider } = useGameStore();
  const activeSpider = player.spiders && player.spiders.length > 0 ? player.spiders[0] : undefined;
  const [selectedDress, setSelectedDress] = useState<Dress | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEquipDress = (dress: Dress) => {
    if (!activeSpider) return;
    
    const isEquipped = activeSpider.dresses.some(d => d.id === dress.id);
    
    if (isEquipped) {
      const updatedDresses = activeSpider.dresses.filter(d => d.id !== dress.id);
      updateSpider(activeSpider.id, { 
        dresses: updatedDresses,
        power: activeSpider.power - dress.powerBonus,
        stats: {
          attack: activeSpider.stats.attack - dress.stats.attack,
          defense: activeSpider.stats.defense - dress.stats.defense,
          agility: activeSpider.stats.agility - dress.stats.agility,
          luck: activeSpider.stats.luck - dress.stats.luck,
        }
      });
      setError(null);
    } else {
      // Check if already at max dresses
      if (activeSpider.dresses.length >= 3) {
        setError('Cannot equip more than 3 dresses');
        return;
      }

      // Check if dress type is already equipped
      if (activeSpider.dresses.some(d => d.type === dress.type)) {
        setError(`Already equipped a ${dress.type.toLowerCase()}`);
        return;
      }

      const updatedDresses = [...activeSpider.dresses, dress];
      updateSpider(activeSpider.id, { 
        dresses: updatedDresses,
        power: activeSpider.power + dress.powerBonus,
        stats: {
          attack: activeSpider.stats.attack + dress.stats.attack,
          defense: activeSpider.stats.defense + dress.stats.defense,
          agility: activeSpider.stats.agility + dress.stats.agility,
          luck: activeSpider.stats.luck + dress.stats.luck,
        }
      });
      setError(null);
    }
    
    setShowDetails(false);
    setSelectedDress(null);
  };

  const getRarityStyles = (rarity: string): { color: string; glow: string } => {
    switch (rarity) {
      case 'Common':
        return { 
          color: 'text-gray-500 border-gray-400',
          glow: 'shadow-[0_0_10px_rgba(156,163,175,0.5)]'
        };
      case 'Excellent':
        return { 
          color: 'text-green-500 border-green-400',
          glow: 'shadow-[0_0_10px_rgba(34,197,94,0.5)]'
        };
      case 'Rare':
        return { 
          color: 'text-blue-500 border-blue-400',
          glow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]'
        };
      case 'Epic':
        return { 
          color: 'text-purple-500 border-purple-400',
          glow: 'shadow-[0_0_10px_rgba(168,85,247,0.5)]'
        };
      case 'Legendary':
        return { 
          color: 'text-orange-500 border-orange-400',
          glow: 'shadow-[0_0_10px_rgba(249,115,22,0.5)]'
        };
      case 'Mythical':
        return { 
          color: 'text-red-500 border-red-400',
          glow: 'shadow-[0_0_10px_rgba(239,68,68,0.5)]'
        };
      case 'MEME':
        return { 
          color: 'text-pink-500 border-pink-400',
          glow: 'shadow-[0_0_10px_rgba(236,72,153,0.5)]'
        };
      default:
        return { 
          color: 'text-gray-500 border-gray-400',
          glow: 'shadow-[0_0_10px_rgba(156,163,175,0.5)]'
        };
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl p-5 max-w-[90rem] w-full shadow-xl relative max-h-[90vh] overflow-y-auto">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors z-10"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          
          <Dialog.Title className="text-xl font-bold mb-4 text-center mt-1">
            Spider Dresses
          </Dialog.Title>

          {/* Equipped Dresses Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Equipped Dresses</h3>
              <span className="text-sm text-gray-500">{activeSpider?.dresses.length || 0}/3</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeSpider?.dresses.map(dress => (
                <div 
                  key={dress.id}
                  className={`px-2 py-1 rounded-full text-xs ${getRarityStyles(dress.rarity).color} bg-white border`}
                >
                  {dress.type}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {player.dresses.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <p className="text-gray-500">No dresses available.</p>
                <p className="text-sm text-gray-400 mt-1">Use the Summon Portal to get dresses!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[60vh] overflow-y-auto pr-1">
                {player.dresses.map((dress) => {
                  const isEquipped = activeSpider?.dresses.some(d => d.id === dress.id);
                  const { color, glow } = getRarityStyles(dress.rarity);
                  
                  return (
                    <button
                      key={dress.id}
                      onClick={() => {
                        setSelectedDress(dress);
                        setShowDetails(true);
                        setError(null);
                      }}
                      className={`relative rounded-xl transition-all duration-200 ${
                        isEquipped ? `${color} ${glow}` : 'border-gray-200 hover:scale-105'
                      }`}
                    >
                      <div className="aspect-square">
                        <img 
                          src={dress.image} 
                          alt={dress.name}
                          className="w-full h-full object-cover rounded-t-xl"
                        />
                        {isEquipped && (
                          <div className="absolute top-1 right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            ✓
                          </div>
                        )}
                      </div>
                      
                      <div className="p-1.5 bg-white rounded-b-xl border-t">
                        <h3 className={`font-medium text-xs leading-tight line-clamp-1 ${color}`}>
                          {dress.name}
                        </h3>
                        <p className="text-[10px] text-gray-500">{dress.type}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Dialog.Panel>

        {/* Dress Details Modal */}
        <Dialog 
          open={showDetails} 
          onClose={() => {
            setShowDetails(false);
            setSelectedDress(null);
            setError(null);
          }}
          className="relative z-[60]"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-2xl p-5 max-w-md w-full shadow-xl relative max-h-[90vh] overflow-y-auto">
              {selectedDress && (
                <>
                  <button 
                    onClick={() => {
                      setShowDetails(false);
                      setSelectedDress(null);
                      setError(null);
                    }}
                    className="absolute top-3 right-3 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors z-10"
                    aria-label="Close"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>

                  <div className="space-y-4">
                    <div className="aspect-square rounded-xl overflow-hidden">
                      <img 
                        src={selectedDress.image} 
                        alt={selectedDress.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <h3 className={`text-xl font-bold ${getRarityStyles(selectedDress.rarity).color}`}>
                        {selectedDress.name}
                      </h3>
                      <p className="text-sm text-gray-500">{selectedDress.type} • {selectedDress.theme}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                      <p className="text-purple-600 font-medium">+{selectedDress.powerBonus} Power</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white p-2 rounded-lg">
                          <p className="text-red-500">+{selectedDress.stats.attack} ATK</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <p className="text-blue-500">+{selectedDress.stats.defense} DEF</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <p className="text-green-500">+{selectedDress.stats.agility} AGI</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <p className="text-yellow-500">+{selectedDress.stats.luck} LUCK</p>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2">
                        <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                      </div>
                    )}

                    <button
                      onClick={() => handleEquipDress(selectedDress)}
                      className={`w-full py-3 rounded-xl text-white font-medium transition-colors ${
                        activeSpider?.dresses.some(d => d.id === selectedDress.id)
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      {activeSpider?.dresses.some(d => d.id === selectedDress.id) ? 'Unequip' : 'Equip'}
                    </button>
                  </div>
                </>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </Dialog>
  );
}