import React from 'react';
import { Dialog } from '@headlessui/react';
import { useGameStore } from '../../store/useGameStore';

interface SynthesisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SynthesisModal({ isOpen, onClose }: SynthesisModalProps) {
  const { player } = useGameStore();

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
            Spider Synthesis
          </Dialog.Title>

          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-xl text-center">
              <p className="text-purple-800 font-medium">Combine Spider Eggs to Create New Species</p>
              <p className="text-sm text-purple-600 mt-1">Higher rarity eggs yield better results!</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
              <div className="col-span-full bg-purple-50 p-4 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square rounded-xl bg-white border-2 border-dashed border-purple-300 flex items-center justify-center">
                    <span className="text-purple-400">Drop Egg 1</span>
                  </div>
                  <div className="aspect-square rounded-xl bg-white border-2 border-dashed border-purple-300 flex items-center justify-center">
                    <span className="text-purple-400">Drop Egg 2</span>
                  </div>
                </div>
                <button className="w-full mt-4 bg-purple-500 text-white py-3 rounded-xl hover:bg-purple-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                  Synthesize
                </button>
              </div>

              <div className="col-span-full">
                <h3 className="font-medium mb-2">Available Eggs</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-white rounded-xl border-2 border-purple-100 p-3 flex flex-col items-center justify-center">
                      <span className="text-2xl mb-1">🥚</span>
                      <span className="text-sm font-medium">Common Egg</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}