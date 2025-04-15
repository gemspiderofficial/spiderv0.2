import React from 'react';
import { Dialog } from '@headlessui/react';
import { useGameStore } from '../../store/useGameStore';

interface OrphanageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrphanageModal({ isOpen, onClose }: OrphanageModalProps) {
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
            Spider Orphanage
          </Dialog.Title>

          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-xl text-center">
              <p className="text-orange-800 font-medium">Adopt abandoned spiders or donate yours</p>
              <p className="text-sm text-orange-600 mt-1">Give them a second chance at life!</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border-2 border-orange-100 hover:border-orange-300 transition-colors">
                  <div className="aspect-square rounded-lg bg-orange-50 mb-3 flex items-center justify-center">
                    <span className="text-4xl">🕷️</span>
                  </div>
                  <h3 className="font-medium">Spider #{i + 1}</h3>
                  <p className="text-sm text-gray-500">Level {Math.floor(Math.random() * 10) + 1}</p>
                  <button className="w-full mt-3 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors">
                    Adopt (100 $SPIDER)
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