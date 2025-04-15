import React from 'react';
import { Dialog } from '@headlessui/react';
import { useGameStore } from '../../store/useGameStore';

interface PvPArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PvPArenaModal({ isOpen, onClose }: PvPArenaModalProps) {
  const { player } = useGameStore();

  const pvpTiers = [
    { name: 'BRONZE', fee: 1, minPower: 100, reward: '1.8 $SPIDER' },
    { name: 'SILVER', fee: 2.5, minPower: 200, reward: '4.5 $SPIDER' },
    { name: 'GOLD', fee: 5, minPower: 300, reward: '9 $SPIDER' },
    { name: 'PLATINUM', fee: 10, minPower: 400, reward: '18 $SPIDER' },
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl p-5 w-full max-w-lg shadow-xl relative">
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
          
          <Dialog.Title className="text-xl font-bold mb-6 text-center">
            PvP Arena
          </Dialog.Title>

          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-xl text-center">
              <p className="text-yellow-800 font-medium">Challenge Other Players!</p>
              <p className="text-sm text-yellow-600 mt-1">Winner gets 180% of entry fee. Losers take 2% health damage.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
              {pvpTiers.map((tier) => (
                <div 
                  key={tier.name}
                  className="bg-white p-4 rounded-xl border-2 border-yellow-100 hover:border-yellow-300 transition-colors"
                >
                  <h3 className="font-bold text-lg">{tier.name}</h3>
                  <div className="space-y-2 mt-3 text-sm">
                    <p>Entry Fee: {tier.fee} $SPIDER</p>
                    <p>Min Power: {tier.minPower}</p>
                    <p className="font-medium text-yellow-600">Win: {tier.reward}</p>
                  </div>
                  <button 
                    className="w-full mt-4 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Enter Arena
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}