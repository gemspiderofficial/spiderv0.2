import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useGameStore } from '../../store/useGameStore';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RedeemModal({ isOpen, onClose }: RedeemModalProps) {
  const { player } = useGameStore();
  const [redeemAmount, setRedeemAmount] = useState('');

  const handleRedeem = () => {
    // Implement redeem logic here
    console.log('Redeeming:', redeemAmount);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl relative max-h-[90vh] overflow-y-auto scrollbar-hide">
          {/* Close button in the upper right corner */}
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors z-10"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          
          <Dialog.Title className="text-xl font-bold mb-4 text-center mt-1">
            Redeem $SPIDER
          </Dialog.Title>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="font-medium">Available Balance</p>
              <p className="text-2xl font-bold">{player.balance.SPIDER} $SPIDER</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount to redeem
              </label>
              <input
                type="number"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                placeholder="Enter amount"
                max={player.balance.SPIDER}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleRedeem}
              disabled={!redeemAmount || Number(redeemAmount) > player.balance.SPIDER}
              className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Redeem
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}