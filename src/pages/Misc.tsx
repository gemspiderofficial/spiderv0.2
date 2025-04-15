import React, { useState, lazy, Suspense } from 'react';
import { useGameStore } from '../store/useGameStore';
import { LoadingScreen } from '../components/LoadingScreen';
import { motion } from 'framer-motion';

// Lazy load modals
const PvPArenaModal = lazy(() => import('../components/modals/PvPArenaModal').then(mod => ({ default: mod.PvPArenaModal })));
const OrphanageModal = lazy(() => import('../components/modals/OrphanageModal').then(mod => ({ default: mod.OrphanageModal })));
const BattleRoyaleModal = lazy(() => import('../components/modals/BattleRoyaleModal').then(mod => ({ default: mod.BattleRoyaleModal })));
const SynthesisModal = lazy(() => import('../components/modals/SynthesisModal').then(mod => ({ default: mod.SynthesisModal })));
const SpiderRaceModal = lazy(() => import('../components/modals/SpiderRaceModal').then(mod => ({ default: mod.SpiderRaceModal })));
const TowerDefenseModal = lazy(() => import('../components/modals/TowerDefenseModal').then(mod => ({ default: mod.TowerDefenseModal })));

function Misc() {
  const { player } = useGameStore();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen pb-20 overflow-y-auto scrollbar-hide"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-gradient-xy" />
        
        <div className="max-w-4xl mx-auto h-full relative">
          {/* Glowing path */}
          <motion.div 
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute left-1/2 top-0 bottom-0 w-16 -ml-8 bg-gradient-to-b from-purple-200/40 to-blue-200/40 backdrop-blur-sm transform -skew-x-6 border-x border-white/20 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
          />
          
          {/* Feature buildings */}
          <div className="relative h-full p-6">
            {/* Orphanage */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-[10%] left-[20%]"
            >
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModal('orphanage')}
                className="w-40 h-40 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 group-hover:from-orange-500/20 group-hover:to-yellow-500/20 transition-all duration-300" />
                <div className="relative h-full flex flex-col items-center justify-center p-6">
                  <span className="text-4xl mb-4">🏠</span>
                  <span className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                    Orphanage
                  </span>
                </div>
              </motion.button>
            </motion.div>

            {/* Battle Royale */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-[30%] right-[20%]"
            >
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModal('battle-royale')}
                className="w-40 h-40 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 group-hover:from-red-500/20 group-hover:to-pink-500/20 transition-all duration-300" />
                <div className="relative h-full flex flex-col items-center justify-center p-6">
                  <span className="text-4xl mb-4">⚔️</span>
                  <span className="text-lg font-semibold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    Battle Royale
                  </span>
                </div>
              </motion.button>
            </motion.div>

            {/* Synthesis */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-[50%] left-[20%]"
            >
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModal('synthesis')}
                className="w-40 h-40 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 group-hover:from-purple-500/20 group-hover:to-indigo-500/20 transition-all duration-300" />
                <div className="relative h-full flex flex-col items-center justify-center p-6">
                  <span className="text-4xl mb-4">🥚</span>
                  <span className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Synthesis
                  </span>
                </div>
              </motion.button>
            </motion.div>

            {/* PvP Arena */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-[70%] right-[20%]"
            >
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModal('pvp')}
                className="w-40 h-40 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all duration-300" />
                <div className="relative h-full flex flex-col items-center justify-center p-6">
                  <span className="text-4xl mb-4">🏛️</span>
                  <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    PvP Arena
                  </span>
                </div>
              </motion.button>
            </motion.div>

            {/* Spider Race */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-[90%] left-[20%]"
            >
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModal('race')}
                className="w-40 h-40 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 group-hover:from-green-500/20 group-hover:to-emerald-500/20 transition-all duration-300" />
                <div className="relative h-full flex flex-col items-center justify-center p-6">
                  <span className="text-4xl mb-4">🏃</span>
                  <span className="text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Spider Race
                  </span>
                </div>
              </motion.button>
            </motion.div>

            {/* Tower Defense */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-[110%] right-[20%]"
            >
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModal('tower')}
                className="w-40 h-40 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 group-hover:from-yellow-500/20 group-hover:to-amber-500/20 transition-all duration-300" />
                <div className="relative h-full flex flex-col items-center justify-center p-6">
                  <span className="text-4xl mb-4">🗼</span>
                  <span className="text-lg font-semibold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                    Tower Defense
                  </span>
                </div>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Suspense fallback={<LoadingScreen fullscreen={false} />}>
        {activeModal === 'pvp' && (
          <PvPArenaModal 
            isOpen={activeModal === 'pvp'} 
            onClose={() => setActiveModal(null)} 
          />
        )}
        {activeModal === 'orphanage' && (
          <OrphanageModal 
            isOpen={activeModal === 'orphanage'} 
            onClose={() => setActiveModal(null)} 
          />
        )}
        {activeModal === 'battle-royale' && (
          <BattleRoyaleModal 
            isOpen={activeModal === 'battle-royale'} 
            onClose={() => setActiveModal(null)} 
          />
        )}
        {activeModal === 'synthesis' && (
          <SynthesisModal 
            isOpen={activeModal === 'synthesis'} 
            onClose={() => setActiveModal(null)} 
          />
        )}
        {activeModal === 'race' && (
          <SpiderRaceModal 
            isOpen={activeModal === 'race'} 
            onClose={() => setActiveModal(null)} 
          />
        )}
        {activeModal === 'tower' && (
          <TowerDefenseModal 
            isOpen={activeModal === 'tower'} 
            onClose={() => setActiveModal(null)} 
          />
        )}
      </Suspense>
    </motion.div>
  );
}

export default Misc;