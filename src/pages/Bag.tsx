import React from 'react';
import { useGameStore } from '../store/useGameStore';

function Bag() {
  const { player } = useGameStore();
  
  // Ensure player and balance exist before accessing properties
  const feeders = player?.balance?.feeders || 0;
  const spiderCount = player?.spiders?.length || 0;

  // Get genetic display text with color
  const getGeneticDisplay = (genetic: string) => {
    const colors: Record<string, string> = {
      'S': 'text-blue-500',
      'A': 'text-green-500',
      'J': 'text-purple-500',
      'SA': 'text-indigo-500',
      'SJ': 'text-cyan-500',
      'AJ': 'text-emerald-500',
      'SAJ': 'text-amber-500 font-bold',
    };
    
    return <span className={colors[genetic] || 'text-gray-500'}>{genetic}</span>;
  };

  const inventory = [
    { id: 1, name: 'Feeders', amount: feeders, type: 'consumable' },
    { id: 2, name: 'Health Potion', amount: 3, type: 'consumable' },
    { id: 3, name: 'Experience Boost', amount: 1, type: 'boost' },
    { id: 4, name: 'Spider Egg', amount: 0, type: 'special' },
  ];

  const spiderInventory = player?.spiders || [];

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-white">Bag</h1>

      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl">
        <h2 className="text-lg font-bold mb-3">Items</h2>
        <div className="space-y-3">
          {inventory.map((item) => (
            <div key={item.id} className="bg-white p-3 rounded-lg shadow flex justify-between items-center">
              <div>
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-sm text-gray-500">Type: {item.type}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">x{item.amount}</p>
                {item.amount > 0 && (
                  <button className="text-sm text-blue-500">Use</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl">
        <h2 className="text-lg font-bold mb-3">Spiders ({spiderCount})</h2>
        <div className="space-y-3">
          {spiderInventory.map((spider) => (
            <div key={spider.id} className="bg-white p-3 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{spider.name}</h3>
                  <p className="text-sm text-gray-500">Level {spider.level} • {spider.rarity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Power: {spider.power}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-sm">
                <span>Genetics: {getGeneticDisplay(spider.genetics)}</span>
                <span>Generation: {spider.generation}</span>
              </div>
            </div>
          ))}
          
          {spiderInventory.length === 0 && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No spiders in your collection yet.</p>
              <p className="text-sm text-gray-400 mt-1">Visit the Market or use Summon to get spiders!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Bag;