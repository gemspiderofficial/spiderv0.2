import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useGameStore } from '../../store/useGameStore';
import { GeneticType } from '../../types/spider';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { POWER_RANGES, generateUniqueSpiderId } from '../../constants/game';

interface BreedingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BreedingModal({ isOpen, onClose }: BreedingModalProps) {
  const { player, addSpider } = useGameStore();
  const [selectedSpiders, setSelectedSpiders] = useState<string[]>([]);

  // Get genetic display text with color
  const getGeneticDisplay = (genetic: GeneticType) => {
    const colors: Record<string, string> = {
      'S': 'text-blue-500',
      'A': 'text-green-500',
      'J': 'text-purple-500',
      'SA': 'text-indigo-500',
      'SJ': 'text-cyan-500',
      'AJ': 'text-emerald-500',
      'SAJ': 'text-amber-500 font-bold',
    };
    
    return <span className={colors[genetic]}>{genetic}</span>;
  };

  const handleBreed = () => {
    if (selectedSpiders.length !== 2) return;
    
    const parent1 = player.spiders.find(s => s.id === selectedSpiders[0]);
    const parent2 = player.spiders.find(s => s.id === selectedSpiders[1]);
    
    if (!parent1 || !parent2) return;
    
    // Determine offspring genetics based on parents
    const offspringGenetics = determineOffspringGenetics(parent1.genetics, parent2.genetics);
    
    // Determine offspring rarity (weighted towards the lower rarity parent with a small chance of upgrade)
    const rarityLevels = ['Common', 'Excellent', 'Rare', 'Epic', 'Legendary', 'Mythical'];
    const parent1RarityIndex = rarityLevels.indexOf(parent1.rarity);
    const parent2RarityIndex = rarityLevels.indexOf(parent2.rarity);
    const lowerRarityIndex = Math.min(parent1RarityIndex, parent2RarityIndex);
    const higherRarityIndex = Math.max(parent1RarityIndex, parent2RarityIndex);
    
    // 70% chance of lower rarity, 25% chance of higher rarity, 5% chance of one level higher
    let offspringRarityIndex;
    const rarityRoll = Math.random();
    if (rarityRoll < 0.7) {
      offspringRarityIndex = lowerRarityIndex;
    } else if (rarityRoll < 0.95) {
      offspringRarityIndex = higherRarityIndex;
    } else {
      offspringRarityIndex = Math.min(higherRarityIndex + 1, rarityLevels.length - 1);
    }
    
    const offspringRarity = rarityLevels[offspringRarityIndex];
    
    // Calculate base power based on rarity using POWER_RANGES
    const powerRange = POWER_RANGES[offspringRarity as keyof typeof POWER_RANGES];
    const basePower = Math.floor(Math.random() * (powerRange.max - powerRange.min + 1)) + powerRange.min;
    
    // Add genetic bonus
    let geneticBonus = 0;
    switch (offspringGenetics) {
      case 'S': geneticBonus = 10; break;
      case 'A': geneticBonus = 12; break;
      case 'J': geneticBonus = 15; break;
      case 'SA': geneticBonus = 25; break;
      case 'SJ': geneticBonus = 28; break;
      case 'AJ': geneticBonus = 30; break;
      case 'SAJ': geneticBonus = 50; break;
    }
    
    // Create the offspring
    const newSpider = {
      id: `spider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      uniqueId: generateUniqueSpiderId(),
      name: `${offspringRarity} Spider (${offspringGenetics})`,
      rarity: offspringRarity as any,
      genetics: offspringGenetics,
      gender: Math.random() < 0.5 ? 'Male' : 'Female',
      level: 1,
      experience: 0,
      power: basePower + geneticBonus,
      stats: {
        attack: Math.floor((parent1.stats.attack + parent2.stats.attack) / 2) + Math.floor(Math.random() * 3),
        defense: Math.floor((parent1.stats.defense + parent2.stats.defense) / 2) + Math.floor(Math.random() * 3),
        agility: Math.floor((parent1.stats.agility + parent2.stats.agility) / 2) + Math.floor(Math.random() * 3),
        luck: Math.floor((parent1.stats.luck + parent2.stats.luck) / 2) + Math.floor(Math.random() * 3),
      },
      condition: {
        health: 100,
        hunger: 100,
        hydration: 100,
      },
      generation: Math.max(parent1.generation, parent2.generation) + 1,
      parents: {
        father: parent1.id,
        mother: parent2.id,
      },
      lastFed: new Date().toISOString(),
      lastHydrated: new Date().toISOString(),
      lastGemCollection: new Date().toISOString(),
      lastTokenGeneration: new Date().toISOString(),
      isHibernating: false,
      isAlive: true,
      dresses: [],
      createdAt: new Date().toISOString(),
    };
    
    // Add the new spider to the player's collection
    addSpider(newSpider);
    
    // Reset selection and close modal
    setSelectedSpiders([]);
    onClose();
  };
  
  // Determine offspring genetics based on parent genetics with updated probabilities
  const determineOffspringGenetics = (parent1Genetics: GeneticType, parent2Genetics: GeneticType): GeneticType => {
    // Extract individual genes from parents
    const parent1Genes = parent1Genetics.split('') as ('S' | 'A' | 'J')[];
    const parent2Genes = parent2Genetics.split('') as ('S' | 'A' | 'J')[];
    
    // Combine unique genes from both parents
    const combinedGenes = [...new Set([...parent1Genes, ...parent2Genes])].sort();
    
    // If both parents have single genes
    if (parent1Genes.length === 1 && parent2Genes.length === 1) {
      // 95% chance to inherit one parent's gene
      if (Math.random() < 0.95) {
        return Math.random() < 0.5 ? parent1Genetics : parent2Genetics;
      }
      // 5% chance to combine both genes if they're different
      return parent1Genetics === parent2Genetics ? parent1Genetics : (combinedGenes.join('') as GeneticType);
    }

    // If at least one parent has multiple genes
    const hasMultipleGenes = parent1Genes.length > 1 || parent2Genes.length > 1;
    
    if (hasMultipleGenes) {
      const random = Math.random();
      
      // 0.002% chance for triple genetics if eligible
      if (random < 0.00002 && combinedGenes.length >= 2) {
        return 'SAJ';
      }
      
      // 5% chance to inherit parent's multiple genes
      if (random < 0.05) {
        return parent1Genes.length > 1 ? parent1Genetics : parent2Genetics;
      }
      
      // Otherwise, inherit a single random gene
      const allGenes = [...parent1Genes, ...parent2Genes];
      return allGenes[Math.floor(Math.random() * allGenes.length)] as GeneticType;
    }

    // Default case: inherit a single random gene
    return (Math.random() < 0.5 ? parent1Genetics : parent2Genetics);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl relative max-h-[90vh] overflow-y-auto">
          {/* Close button in the upper right corner */}
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors z-10"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          
          <Dialog.Title className="text-xl font-bold mb-4 text-center mt-1">
            Spider Breeding
          </Dialog.Title>

          <div className="space-y-4">
            <p className="text-gray-600 text-center">Select two spiders to breed:</p>
            
            <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {player.spiders.map((spider) => (
                <button
                  key={spider.id}
                  onClick={() => {
                    if (selectedSpiders.includes(spider.id)) {
                      setSelectedSpiders(selectedSpiders.filter(id => id !== spider.id));
                    } else if (selectedSpiders.length < 2) {
                      setSelectedSpiders([...selectedSpiders, spider.id]);
                    }
                  }}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    selectedSpiders.includes(spider.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🕷️</div>
                  <div className="font-medium">{spider.name}</div>
                  <div className="text-sm text-gray-500">Level {spider.level}</div>
                  <div className="text-sm mt-1">Genetics: {getGeneticDisplay(spider.genetics)}</div>
                  <div className="text-sm text-gray-500">Gender: {spider.gender}</div>
                </button>
              ))}
            </div>
            
            {selectedSpiders.length === 2 && (
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                <p className="font-medium text-center mb-2">Breeding Information</p>
                <div className="text-sm space-y-1">
                  <p>• Offspring inherits genes from both parents</p>
                  <p>• 5% chance of genetic combination</p>
                  <p>• 0.002% chance of triple genetics</p>
                  <p>• Rarity is influenced by both parents</p>
                  <p>• Stats are averaged from parents with slight variation</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleBreed}
              disabled={selectedSpiders.length !== 2}
              className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Breed
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}