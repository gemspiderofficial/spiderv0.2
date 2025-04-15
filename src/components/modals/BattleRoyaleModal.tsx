import React from 'react';
import { Dialog } from '@headlessui/react';
import { useGameStore } from '../../store/useGameStore';

interface BattleRoyaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BattleRoyaleModal({ isOpen, onClose }: BattleRoyaleModalProps) {
  const { player } = useGameStore();

  const battleTypes = [
    { name: 'Quick Battle', fee: 50, players: 10, reward: '450 $SPIDER' },
    { name: 'Standard Battle', fee: 100, players: 20, reward: '1,800 $SPIDER' },
    { name: 'Elite Battle', fee: 250, players: 30, reward: '6,750 $SPIDER' },
    { name: 'Ultimate Battle', fee: 500, players: 50, reward: '22,500 $SPIDER' },
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
            Battle Royale
          </Dialog.Title>

          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-xl text-center">
              <p className="text-red-800 font-medium">Last Spider Standing!</p>
              <p className="text-sm text-red-600 mt-1">Winner takes 90% of the prize pool</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
              {battleTypes.map((battle, index) => (
                <div key={index} className="bg-white p-4 rounded-xl border-2 border-red-100 hover:border-red-300 transition-colors">
                  <h3 className="font-bold text-lg">{battle.name}</h3>
                  <div className="space-y-2 mt-3 text-sm">
                    <p>Entry Fee: {battle.fee} $SPIDER</p>
                    <p>Players: {battle.players}</p>
                    <p className="font-medium text-red-600">Prize: {battle.reward}</p>
                  </div>
                  <button className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors">
                    Enter Battle
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