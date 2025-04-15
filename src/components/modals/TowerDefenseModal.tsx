import React from 'react';
import { Dialog } from '@headlessui/react';
import { useGameStore } from '../../store/useGameStore';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TowerDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TowerDefenseModal({ isOpen, onClose }: TowerDefenseModalProps) {
  const { player } = useGameStore();

  const maps = [
    { name: 'Forest Web', difficulty: 'Easy', waves: 10, reward: '500 $SPIDER' },
    { name: 'Cave Network', difficulty: 'Medium', waves: 15, reward: '1,000 $SPIDER' },
    { name: 'Ancient Temple', difficulty: 'Hard', waves: 20, reward: '2,000 $SPIDER' },
    { name: 'Sky Fortress', difficulty: 'Expert', waves: 25, reward: '5,000 $SPIDER' },
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      
      <div className="fixed inset-0">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-b from-yellow-600 to-yellow-700 px-4 py-6">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Tower Defense</h2>
                <p className="text-yellow-100">Defend your web from waves of enemies!</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {maps.map((map) => (
                  <div key={map.name} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-2">{map.name}</h3>
                    <div className="space-y-2 text-yellow-100">
                      <p>Difficulty: {map.difficulty}</p>
                      <p>Waves: {map.waves}</p>
                      <p className="text-yellow-400 font-medium">Reward: {map.reward}</p>
                    </div>
                    <button className="w-full mt-4 bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition-colors">
                      Start Defense
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}