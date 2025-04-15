import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useGameStore } from '../../store/useGameStore';
import { useAuthContext } from '../../contexts/AuthContext';
import { Dress, DressType, Rarity, DressTheme, GeneticType } from '../../types/spider';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { generateUniqueDressId, generateUniqueSpiderId, DRESS_COLLECTION, DRESS_POWER_BONUS, POWER_RANGES } from '../../constants/game';
import { saveNewSpider } from '../../services/spiderService';

interface SummonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SummonModal({ isOpen, onClose }: SummonModalProps) {
  const { player, updateBalance, addSpider, addDress } = useGameStore();
  const { isBalanceLoading, user } = useAuthContext();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<'single' | 'multi'>('single');
  const [summonType, setSummonType] = useState<'spider' | 'dress'>('spider');
  const [summonResults, setSummonResults] = useState<Array<{
    rarity: string;
    name: string;
    id: string;
    type?: string;
    theme?: string;
  }>>([]);

  // Spider summon costs
  const spiderSingleSummonCost = 200;
  const spiderMultiSummonCost = 1800; // 10% discount for bulk summon

  // Dress summon costs
  const dressSingleSummonCost = 100;
  const dressMultiSummonCost = 900; // 10% discount for bulk summon

  const getSpiderBalance = (): number => {
    return player.balance.SPIDER;
  };

  const getRarity = (): 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical' => {
    const rand = Math.random() * 100;
    if (rand < 0.1) return 'Mythical';
    if (rand < 1) return 'Legendary';
    if (rand < 5) return 'Epic';
    if (rand < 15) return 'Rare';
    return 'Common';
  };

  const createNewSpider = async (rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical') => {
    const currentTime = new Date().toISOString();
    const genetics: GeneticType = Math.random() < 0.5 ? 'S' : Math.random() < 0.5 ? 'A' : 'J';
    const powerRange = POWER_RANGES[rarity];
    const basePower = Math.floor(Math.random() * (powerRange.max - powerRange.min + 1)) + powerRange.min;
    const gender: 'Male' | 'Female' = Math.random() < 0.5 ? 'Male' : 'Female';

    const newSpider = {
      uniqueId: generateUniqueSpiderId(),
      name: `${rarity} Spider`,
      rarity,
      genetics,
      gender,
      level: 1,
      experience: 0,
      power: basePower,
      stats: {
        attack: Math.floor(Math.random() * 10) + 10,
        defense: Math.floor(Math.random() * 10) + 10,
        agility: Math.floor(Math.random() * 10) + 10,
        luck: Math.floor(Math.random() * 10) + 10
      },
      condition: {
        health: 100,
        hunger: 100,
        hydration: 100
      },
      generation: 1,
      lastFed: currentTime,
      lastHydrated: currentTime,
      lastTokenGeneration: currentTime,
      lastGemCollection: currentTime,
      isHibernating: false,
      isAlive: true,
      dresses: [],
      isListed: false
    };

    if (user) {
      const savedSpider = await saveNewSpider(newSpider, user.uid);
      addSpider(savedSpider);
      return savedSpider;
    } else {
      const localSpider = {
        ...newSpider,
        id: `spider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: currentTime,
      };
      addSpider(localSpider);
      return localSpider;
    }
  };

  const createNewDress = (rarity: string) => {
    let powerBonus = DRESS_POWER_BONUS[rarity as keyof typeof DRESS_POWER_BONUS];
    let stats = {
      attack: 1,
      defense: 1,
      agility: 1,
      luck: 1
    };

    switch (rarity) {
      case 'Excellent':
        stats = { attack: 2, defense: 3, agility: 2, luck: 2 };
        break;
      case 'Rare':
        stats = { attack: 3, defense: 4, agility: 3, luck: 3 };
        break;
      case 'Epic':
        stats = { attack: 5, defense: 5, agility: 4, luck: 4 };
        break;
      case 'Legendary':
        stats = { attack: 8, defense: 8, agility: 8, luck: 8 };
        break;
      case 'Mythical':
        stats = { attack: 12, defense: 12, agility: 12, luck: 12 };
        break;
      case 'SPECIAL':
        stats = { attack: 20, defense: 20, agility: 20, luck: 20 };
        break;
    }

    const dressTypeIndex = Math.floor(Math.random() * DRESS_COLLECTION.length);
    const dressType = DRESS_COLLECTION[dressTypeIndex].type;
    const possibleThemes = DRESS_COLLECTION[dressTypeIndex].themes[rarity as keyof typeof DRESS_COLLECTION[0]['themes']];
    const theme = possibleThemes[Math.floor(Math.random() * possibleThemes.length)];

    const newDress: Dress = {
      id: generateUniqueDressId(),
      name: `${theme} ${rarity} ${dressType}`,
      rarity: rarity as Rarity,
      powerBonus: powerBonus,
      type: dressType as DressType,
      theme: theme as DressTheme,
      stats,
      image: `/images/dresses/${dressType.toLowerCase()}/${theme.toLowerCase().replace(' ', '-')}.png`
    };

    addDress(newDress);
    return newDress;
  };

  const handleSpin = async () => {
    if (isSpinning) return;

    const cost = selectedAmount === 'single'
      ? (summonType === 'spider' ? spiderSingleSummonCost : dressSingleSummonCost)
      : (summonType === 'spider' ? spiderMultiSummonCost : dressMultiSummonCost);

    const currentBalance = getSpiderBalance();

    if (currentBalance < cost) {
      alert('Not enough $SPIDER tokens!');
      return;
    }

    setIsSpinning(true);
    setSummonResults([]);

    try {
      // Process the transaction
      const amount = selectedAmount === 'single' ? 1 : 10;
      const results = [];

      for (let i = 0; i < amount; i++) {
        if (summonType === 'spider') {
          const spider = await createNewSpider(getRarity());
          results.push({
            id: spider.id,
            name: spider.name,
            rarity: spider.rarity
          });
        } else {
          const dress = createNewDress(getRarity());
          results.push({
            id: dress.id,
            name: dress.name,
            rarity: dress.rarity,
            type: dress.type,
            theme: dress.theme
          });
        }
      }

      // Update player balance
      updateBalance({ SPIDER: player.balance.SPIDER - cost });
      setSummonResults(results);
    } catch (error) {
      console.error('Summon failed:', error);
      alert('Failed to summon. Please try again.');
    } finally {
      setIsSpinning(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors z-10"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <Dialog.Title className="text-2xl font-bold mb-6 text-center">
            <SparklesIcon className="w-6 h-6 inline-block mr-2 text-yellow-500" />
            Summoning Portal
          </Dialog.Title>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Balance: {isBalanceLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                getSpiderBalance()
              )} $SPIDER
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSummonType('spider')}
                className={`flex-1 px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 border-2 ${
                  summonType === 'spider'
                    ? 'bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                <span className="text-base">🕷️</span>
                <span className="font-medium text-sm">Spider</span>
              </button>
              <button
                onClick={() => setSummonType('dress')}
                className={`flex-1 px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 border-2 ${
                  summonType === 'dress'
                    ? 'bg-purple-500 text-white border-purple-600 shadow-lg shadow-purple-500/20'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-purple-200 hover:bg-purple-50'
                }`}
              >
                <span className="text-base">👕</span>
                <span className="font-medium text-sm">Dress</span>
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedAmount('single')}
                className={`flex-1 px-2 py-1 rounded-lg transition-all duration-200 border-2 text-xs font-medium ${
                  selectedAmount === 'single'
                    ? summonType === 'spider'
                      ? 'bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                      : 'bg-purple-500 text-white border-purple-600 shadow-lg shadow-purple-500/20'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                1x ({summonType === 'spider' ? spiderSingleSummonCost : dressSingleSummonCost} $SPIDER)
              </button>
              <button
                onClick={() => setSelectedAmount('multi')}
                className={`flex-1 px-2 py-1 rounded-lg transition-all duration-200 border-2 text-xs font-medium ${
                  selectedAmount === 'multi'
                    ? summonType === 'spider'
                      ? 'bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                      : 'bg-purple-500 text-white border-purple-600 shadow-lg shadow-purple-500/20'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                10x ({summonType === 'spider' ? spiderMultiSummonCost : dressMultiSummonCost} $SPIDER)
              </button>
            </div>
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                isSpinning ? 'bg-gray-400 cursor-not-allowed' :
                summonType === 'spider' ?
                  'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white' :
                  'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
              }`}
            >
              {isSpinning ? (
                <span className="flex items-center justify-center gap-2">
                  <SparklesIcon className="w-5 h-5 animate-spin" />
                  Summoning...
                </span>
              ) : (
                'Summon'
              )}
            </button>
            {summonResults.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="font-bold text-lg">Results:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {summonResults.map((result) => (
                    <div
                      key={result.id}
                      className={`p-3 rounded-lg border ${
                        result.rarity === 'Legendary' || result.rarity === 'Mythical' || result.rarity === 'SPECIAL'
                          ? 'border-yellow-400 bg-yellow-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-gray-600">{result.rarity}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}