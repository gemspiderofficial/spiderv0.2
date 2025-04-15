import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useGameStore } from '../../store/useGameStore';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RankingModal({ isOpen, onClose }: RankingModalProps) {
  const { player } = useGameStore();
  const [rankingType, setRankingType] = useState<'power' | 'level' | 'house' | 'dress'>('power');
  
  const totalPower = player.spiders.reduce((sum, s) => sum + s.power, 0);
  const totalLevel = player.spiders.reduce((sum, s) => sum + s.level, 0);
  const totalDresses = player.spiders.reduce((sum, s) => sum + s.dresses.length, 0);

  // Mock data for rankings
  const powerRankings = [
    { id: 1, name: 'Player 1', value: 10000, isCurrentPlayer: true },
    { id: 2, name: 'Player 2', value: 9000, isCurrentPlayer: false },
    { id: 3, name: 'Player 3', value: 8000, isCurrentPlayer: false },
    { id: 4, name: 'Player 4', value: 7000, isCurrentPlayer: false },
    { id: 5, name: 'Player 5', value: 6000, isCurrentPlayer: false },
  ];

  const levelRankings = [
    { id: 1, name: 'Player 1', value: 120, isCurrentPlayer: true },
    { id: 2, name: 'Player 2', value: 110, isCurrentPlayer: false },
    { id: 3, name: 'Player 3', value: 100, isCurrentPlayer: false },
    { id: 4, name: 'Player 4', value: 90, isCurrentPlayer: false },
    { id: 5, name: 'Player 5', value: 80, isCurrentPlayer: false },
  ];

  const houseRankings = [
    { id: 1, name: 'House Alpha', value: 50000, isCurrentPlayer: true },
    { id: 2, name: 'House Beta', value: 45000, isCurrentPlayer: false },
    { id: 3, name: 'House Gamma', value: 40000, isCurrentPlayer: false },
    { id: 4, name: 'House Delta', value: 35000, isCurrentPlayer: false },
    { id: 5, name: 'House Epsilon', value: 30000, isCurrentPlayer: false },
  ];

  const dressRankings = [
    { id: 1, name: 'Player 1', value: 45, isCurrentPlayer: true },
    { id: 2, name: 'Player 2', value: 40, isCurrentPlayer: false },
    { id: 3, name: 'Player 3', value: 35, isCurrentPlayer: false },
    { id: 4, name: 'Player 4', value: 30, isCurrentPlayer: false },
    { id: 5, name: 'Player 5', value: 25, isCurrentPlayer: false },
  ];

  const getRankings = () => {
    switch (rankingType) {
      case 'power':
        return { rankings: powerRankings, label: 'Power', playerTotal: totalPower };
      case 'level':
        return { rankings: levelRankings, label: 'Level', playerTotal: totalLevel };
      case 'house':
        return { rankings: houseRankings, label: 'House Power', playerTotal: totalPower };
      case 'dress':
        return { rankings: dressRankings, label: 'Dresses', playerTotal: totalDresses };
      default:
        return { rankings: powerRankings, label: 'Power', playerTotal: totalPower };
    }
  };

  const { rankings, label, playerTotal } = getRankings();

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl relative sm:max-w-md max-h-[90vh] overflow-y-auto">
          {/* Close button in the upper right corner */}
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors z-10"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          
          <Dialog.Title className="text-xl font-bold mb-4 text-center mt-1">
            Rankings
          </Dialog.Title>

          <div className="space-y-4">
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-1 justify-center">
              <button 
                onClick={() => setRankingType('power')} 
                className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${rankingType === 'power' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Power
              </button>
              <button 
                onClick={() => setRankingType('level')} 
                className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${rankingType === 'level' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Level
              </button>
              <button 
                onClick={() => setRankingType('house')} 
                className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${rankingType === 'house' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                House
              </button>
              <button 
                onClick={() => setRankingType('dress')} 
                className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${rankingType === 'dress' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Dress
              </button>
            </div>

            <div className="bg-yellow-100 p-4 rounded-xl">
              <p className="font-bold">Your Rank: #1</p>
              <p className="text-sm text-gray-600">Total {label}: {playerTotal}</p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {rankings.map((rank) => (
                <div 
                  key={rank.id} 
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    rank.isCurrentPlayer ? 'bg-yellow-50 border border-yellow-300' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold">#{rank.id}</span>
                    <span>{rank.name}</span>
                  </div>
                  <span className="text-gray-600">{rank.value} {label}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 bg-gray-200 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}