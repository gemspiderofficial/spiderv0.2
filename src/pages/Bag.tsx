import { useGameStore } from '../store/useGameStore';
import { motion } from 'framer-motion';
import { getSpiderImage } from '../utils/spiderImage';

function Bag() {
  const { player } = useGameStore();
  
  const feeders = player?.balance?.feeders || 0;
  const spiderCount = player?.spiders?.length || 0;

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6 pb-20"
    >
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300"
      >
        Inventory
      </motion.h1>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl"
      >
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-1.5 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
          </span>
          Items
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {inventory.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{item.name}</h3>
                  <p className="text-sm text-gray-400">{item.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">×{item.amount}</p>
                  {item.amount > 0 && (
                    <button className="text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-lg mt-1 hover:from-blue-600 hover:to-purple-600 transition-all">
                      Use
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl"
      >
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
          <span className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-1.5 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </span>
          Spiders ({spiderCount})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {spiderInventory.map((spider) => (
            <motion.div
              key={spider.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300"
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                  <img 
                    src={getSpiderImage(spider.genetics)}
                    alt={spider.name}
                    className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{spider.name}</h3>
                      <p className="text-sm text-gray-400">Level {spider.level} • {spider.rarity}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                        Power: {spider.power}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/5 flex justify-between text-sm">
                    <span className="text-gray-400">Genetics: {getGeneticDisplay(spider.genetics)}</span>
                    <span className="text-gray-400">Gen {spider.generation}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {spiderInventory.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="sm:col-span-2 text-center p-8 rounded-xl bg-white/5 border border-white/10"
            >
              <p className="text-gray-300">No spiders in your collection yet.</p>
              <p className="text-sm text-gray-400 mt-2">Visit the Market or use Summon to get spiders!</p>
              <div className="mt-4 flex gap-3 justify-center">
                <button 
                  onClick={() => window.location.href = '/market'}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
                >
                  Visit Market
                </button>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all"
                >
                  Summon Spider
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Bag;