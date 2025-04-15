import React from 'react';
import { Dialog } from '@headlessui/react';
import { useGameStore } from '../../store/useGameStore';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SpiderRaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpiderRaceModal({ isOpen, onClose }: SpiderRaceModalProps) {
  const { player } = useGameStore();

  const raceTypes = [
    { name: 'Sprint', distance: '100m', fee: 50, reward: '450 $SPIDER' },
    { name: 'Marathon', distance: '1000m', fee: 100, reward: '1,800 $SPIDER' },
    { name: 'Obstacle Course', distance: '500m', fee: 150, reward: '2,700 $SPIDER' },
    { name: 'Web Climbing', distance: 'Vertical 100m', fee: 200, reward: '3,600 $SPIDER' },
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      
      <div className="fixed inset-0">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-b from-green-600 to-green-700 px-4 py-6">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Spider Race</h2>
                <p className="text-green-100">Test your spider's speed and agility!</p>
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
                {raceTypes.map((race) => (
                  <div key={race.name} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-2">{race.name}</h3>
                    <div className="space-y-2 text-green-100">
                      <p>Distance: {race.distance}</p>
                      <p>Entry Fee: {race.fee} $SPIDER</p>
                      <p className="text-green-400 font-medium">Prize: {race.reward}</p>
                    </div>
                    <button className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors">
                      Enter Race
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