import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface InstructionPanelProps {
  onOpenDeposit: () => void;
}

export function InstructionPanel({ onOpenDeposit }: InstructionPanelProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  return (
    <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 max-w-lg mx-auto mb-6 relative">
      <button 
        onClick={() => setIsVisible(false)} 
        className="absolute top-3 right-3 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
      
      <h2 className="text-xl font-bold mb-3 text-blue-600">Welcome to Gem Spider v2.0</h2>
      
      <div className="space-y-3 text-gray-700">
        <p>
          We've updated how $SPIDER tokens work in the game! Now you'll need to deposit tokens from your TON wallet into your game account to play.
        </p>
        
        <div className="bg-blue-50 p-3 rounded-lg">
          <h3 className="font-bold text-blue-700 mb-1">How it works:</h3>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Connect your TON wallet in your profile settings</li>
            <li>Click the deposit button in the top bar</li>
            <li>Choose how many $SPIDER tokens to deposit</li>
            <li>Use these tokens for summoning spiders and other actions</li>
          </ol>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded-lg">
          <h3 className="font-bold text-yellow-700 mb-1">Note:</h3>
          <p className="text-sm">
            You'll need to have at least 200 $SPIDER tokens to summon a spider. Make sure to deposit enough tokens!
          </p>
        </div>
        
        <div className="text-center mt-4">
          <button
            onClick={onOpenDeposit}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition-colors"
          >
            Deposit $SPIDER Tokens
          </button>
        </div>
      </div>
    </div>
  );
} 