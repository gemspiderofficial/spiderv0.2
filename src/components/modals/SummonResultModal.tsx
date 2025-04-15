import React from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { RARITY_COLORS, RARITY_TEXT_COLORS } from '../../constants/game';

interface SummonResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: Array<{rarity: string, name: string, id: string}>;
  isMulti: boolean;
}

export function SummonResultModal({ isOpen, onClose, results, isMulti }: SummonResultModalProps) {
  const getRarityColor = (rarity: string): string => {
    return RARITY_TEXT_COLORS[rarity as keyof typeof RARITY_TEXT_COLORS] || RARITY_TEXT_COLORS.Common;
  };

  const getRarityBgColor = (rarity: string): string => {
    const color = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.Common;
    return `bg-opacity-10 ${color}`;
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[60]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl relative">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors z-10"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          
          {/* Modal Header */}
          <Dialog.Title className="text-2xl font-bold mb-6 text-center">
            Summon Results
          </Dialog.Title>

          {/* Modal Content */}
          <div className="space-y-4">
            {isMulti ? (
              <div className="grid grid-cols-2 gap-3">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg ${getRarityBgColor(result.rarity)} animate-pop-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <p className={`font-medium ${getRarityColor(result.rarity)}`}>
                      {result.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center p-6 rounded-xl ${getRarityBgColor(results[0].rarity)} animate-fade-in`}>
                <p className="font-bold text-sm mb-2">Result:</p>
                <p className={`text-2xl font-bold ${getRarityColor(results[0].rarity)}`}>
                  {results[0].name}
                </p>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 