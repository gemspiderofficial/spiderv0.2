import React, { useState, useRef, useEffect } from 'react';
// Debugging logs to track spider summoning and persistence
console.log('SummonModal loaded');
import { Dialog } from '@headlessui/react';
import { useGameStore } from '../../store/useGameStore';
import { useAuthContext } from '../../contexts/AuthContext';
import { Dress, DressType, Gender, GeneticType } from '../../types/spider';
import { SparklesIcon, XMarkIcon, ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { POWER_RANGES, generateUniqueSpiderId, generateUniqueDressId, DRESS_COLLECTION, DRESS_POWER_BONUS, RARITY_COLORS, RARITY_TEXT_COLORS } from '../../constants/game';
import { saveNewSpider } from '../../services/spiderService';
import { updatePlayerBalance } from '../../services/playerService';
import { updateMockBalance } from '../../services/tonService';
import { handleSummonTransaction } from '../../services/gameTransactions';

interface SummonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SummonModal({ isOpen, onClose }: SummonModalProps) {
  const { player, updateBalance, addSpider, addDress } = useGameStore();
  const { spiderTokenBalance, isBalanceLoading, user, refreshBalance } = useAuthContext();
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDegrees, setSpinDegrees] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState<'single' | 'multi'>('single');
  const [result, setResult] = useState<string | null>(null);
  const [summonType, setSummonType] = useState<'spider' | 'dress'>('spider');
  const [summonResults, setSummonResults] = useState<Array<{
    rarity: string;
    name: string;
    id: string;
    src?: string;
    type?: string;
    theme?: string;
  }>>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showRarityInfo, setShowRarityInfo] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingCost, setPendingCost] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [pendingTransaction, setPendingTransaction] = useState(false);
  const [transactionLock, setTransactionLock] = useState(false);

  // Spider summon costs
  const spiderSingleSummonCost = 200;
  const spiderMultiSummonCost = 1800; // 10% discount for bulk summon

  // Dress summon costs (now in $SPIDER)
  const dressSingleSummonCost = 100;
  const dressMultiSummonCost = 900; // 10% discount for bulk summon

  // Spider rarities with their probabilities and colors - UPDATED VALUES
  const spiderWheelSegments = [
    { id: 'common', rarity: 'Common', color: RARITY_COLORS.Common, probability: 0.90 },
    { id: 'excellent', rarity: 'Excellent', color: RARITY_COLORS.Excellent, probability: 0.05 },
    { id: 'rare', rarity: 'Rare', color: RARITY_COLORS.Rare, probability: 0.0325 },
    { id: 'epic', rarity: 'Epic', color: RARITY_COLORS.Epic, probability: 0.01475 },
    { id: 'legendary', rarity: 'Legendary', color: RARITY_COLORS.Legendary, probability: 0.000225 },
    { id: 'mythical', rarity: 'Mythical', color: RARITY_COLORS.Mythical, probability: 0.000025 },
    { id: 'special', rarity: 'SPECIAL', color: RARITY_COLORS.SPECIAL, probability: 0.0000025 }
  ];

  // Dress rarities with their probabilities and colors - UPDATED VALUES
  const dressWheelSegments = [
    { id: 'common', rarity: 'Common', color: RARITY_COLORS.Common, probability: 0.90 },
    { id: 'excellent', rarity: 'Excellent', color: RARITY_COLORS.Excellent, probability: 0.05 },
    { id: 'rare', rarity: 'Rare', color: RARITY_COLORS.Rare, probability: 0.0325 },
    { id: 'epic', rarity: 'Epic', color: RARITY_COLORS.Epic, probability: 0.01475 },
    { id: 'legendary', rarity: 'Legendary', color: RARITY_COLORS.Legendary, probability: 0.000225 },
    { id: 'mythical', rarity: 'Mythical', color: RARITY_COLORS.Mythical, probability: 0.000025 },
    { id: 'special', rarity: 'SPECIAL', color: RARITY_COLORS.SPECIAL, probability: 0.0000025 }
  ];

  // Multi-summon probabilities for spiders - UPDATED VALUES (4x lower for Excellent and up)
  const spiderMultiProbabilities = {
    'Common': 0.90,
    'Excellent': 0.045,
    'Rare': 0.04,
    'Epic': 0.03725,
    'Legendary': 0.0027,
    'Mythical': 0.00005,
    'SPECIAL': 0.000005 // 10x rarer than Mythical
  };

  // Multi-summon probabilities for dresses - UPDATED VALUES (4x lower for Excellent and up)
  const dressMultiProbabilities = {
    'Common': 0.90,
    'Excellent': 0.045,
    'Rare': 0.04,
    'Epic': 0.03725,
    'Legendary': 0.0027,
    'Mythical': 0.00005,
    'SPECIAL': 0.000005 // 10x rarer than Mythical
  };

  // Calculate segment angles
  const getWheelSegments = () => summonType === 'spider' ? spiderWheelSegments : dressWheelSegments;
  const segmentAngle = 360 / getWheelSegments().length;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsSpinning(false);
      setSpinDegrees(0);
      setResult(null);
      setSummonResults([]);
      setShowConfetti(false);
    }
  }, [isOpen]);

  // Create confetti effect
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Function to get current SPIDER token balance
  const getSpiderBalance = (): number => {
    // We now use Firestore balance as the source of truth
    return player.balance.SPIDER;
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
    
    // Process the transaction using our dedicated handler
    const success = await handleSummonTransaction(
      user?.uid || null,
      cost,
      currentBalance,
      false, // Not using blockchain balance anymore
      updateBalance,
      refreshBalance
    );
    
    if (!success) {
      alert('Transaction failed. Please try again.');
      return;
    }
    
    setIsSpinning(true);
    setResult(null);
    setSummonResults([]);
    
    // Determine the result based on probabilities
    const wheelSegments = getWheelSegments();
    const randomValue = Math.random();
    let cumulativeProbability = 0;
    let selectedSegment = wheelSegments[0];
    
    for (const segment of wheelSegments) {
      cumulativeProbability += segment.probability;
      if (randomValue <= cumulativeProbability) {
        selectedSegment = segment;
        break;
      }
    }
    
    // Calculate the degrees to spin
    // We want to spin at least 5 full rotations (1800 degrees) plus the position of the selected segment
    const segmentIndex = wheelSegments.findIndex(s => s.id === selectedSegment.id);
    const segmentPosition = segmentIndex * segmentAngle;
    const spinTo = 1800 + (360 - segmentPosition);
    
    setSpinDegrees(spinTo);
    
    // Set the result after the animation completes
    setTimeout(async () => {
      setResult(selectedSegment.rarity);
      
      // Create new item(s) based on the result
      if (selectedAmount === 'single') {
        if (summonType === 'spider') {
          try {
            const newSpider = await createNewSpider(selectedSegment.rarity);
          setSummonResults([{
            rarity: selectedSegment.rarity,
            name: newSpider.name,
            id: newSpider.id
          }]);
          } catch (error) {
            console.error('Error creating spider:', error);
            // Still allow the UI to update even if there was an error
            setSummonResults([{
              rarity: selectedSegment.rarity,
              name: `${selectedSegment.rarity} Spider (Error)`,
              id: `error-${Date.now()}`
            }]);
          }
        } else {
          const newDress = createNewDress(selectedSegment.rarity);
          setSummonResults([{
            rarity: selectedSegment.rarity,
            name: newDress.name,
            id: newDress.id,
            src: newDress.src,
            type: newDress.type,
            theme: newDress.theme
          }]);
        }
      } else {
        // For multi-summon, create 10 items with weighted probabilities
        const results = [];
        for (let i = 0; i < 10; i++) {
          if (summonType === 'spider') {
            try {
            const randomRarity = getRandomRarityWithProbabilities(spiderMultiProbabilities);
              const newSpider = await createNewSpider(randomRarity);
            results.push({
              rarity: randomRarity,
              name: newSpider.name,
              id: newSpider.id
            });
            } catch (error) {
              console.error('Error creating spider in multi-summon:', error);
              // Still add an entry to maintain the count
              results.push({
                rarity: 'Common',
                name: 'Error Spider',
                id: `error-${Date.now()}-${i}`
              });
            }
          } else {
            const randomRarity = getRandomRarityWithProbabilities(dressMultiProbabilities);
            const newDress = createNewDress(randomRarity);
            results.push({
              rarity: randomRarity,
              name: newDress.name,
              id: newDress.id,
              src: newDress.src,
              type: newDress.type,
              theme: newDress.theme
            });
          }
        }
        setSummonResults(results);
      }
      
      // Show confetti for rare results
      if (
        selectedSegment.rarity === 'Legendary' || 
        selectedSegment.rarity === 'Mythical' ||
        selectedSegment.rarity === 'SPECIAL' ||
        (selectedAmount === 'multi' && summonResults.some(r => 
          r.rarity === 'Legendary' || r.rarity === 'Mythical' || r.rarity === 'SPECIAL'
        ))
      ) {
        setShowConfetti(true);
      }
      
      setIsSpinning(false);
    }, 3000); // Match this with the CSS animation duration
  };
  
  const getRandomRarityWithProbabilities = (probabilities: Record<string, number>): string => {
    const randomValue = Math.random();
    let cumulativeProbability = 0;
    
    for (const [rarity, probability] of Object.entries(probabilities)) {
      cumulativeProbability += probability;
      if (randomValue <= cumulativeProbability) {
        return rarity;
      }
    }
    
    return 'Common'; // Fallback
  };
  
  // Generate a random basic genetic type (only S, A, or J for summoning)
  const generateRandomBasicGenetics = (): GeneticType => {
    const basicTypes: GeneticType[] = ['S', 'A', 'J'];
    return basicTypes[Math.floor(Math.random() * basicTypes.length)];
  };
  
  const createNewSpider = async (rarity: string) => {
    console.log(`Starting to create a new ${rarity} spider...`);
    
    // Generate random genetics with only basic types for summoning
    const genetics = generateRandomBasicGenetics();
    
    // Calculate base power based on rarity using the POWER_RANGES constant
    const powerRange = POWER_RANGES[rarity as keyof typeof POWER_RANGES];
    const basePower = Math.floor(Math.random() * (powerRange.max - powerRange.min + 1)) + powerRange.min;
    
    // Add genetic bonus
    let geneticBonus = 0;
    switch (genetics) {
      case 'S': geneticBonus = 10; break;
      case 'A': geneticBonus = 12; break;
      case 'J': geneticBonus = 15; break;
      // No mutation genetics in summoning
    }
    
    const gender = Math.random() < 0.5 ? 'Male' as Gender : 'Female' as Gender;
    
    const newSpider = {
      uniqueId: generateUniqueSpiderId(),
      name: `${rarity} Spider (${genetics})`,
      rarity: rarity as any,
      genetics: genetics,
      gender: gender,
      level: 1,
      experience: 0,
      power: basePower + geneticBonus,
      stats: {
        attack: 10 + Math.floor(Math.random() * 5),
        defense: 10 + Math.floor(Math.random() * 5),
        agility: 10 + Math.floor(Math.random() * 5),
        luck: 10 + Math.floor(Math.random() * 5),
      },
      condition: {
        health: 100,
        hunger: 100,
        hydration: 100,
      },
      generation: 1,
      lastFed: new Date().toISOString(),
      lastHydrated: new Date().toISOString(),
      lastTokenGeneration: new Date().toISOString(),
      isHibernating: false,
      isAlive: true,
      dresses: [],
      isListed: false
    };
    
    console.log(`Spider object created:`, newSpider);
    
    try {
      // First, save the spider to Firebase if user is authenticated
      if (user) {
        console.log(`User is authenticated (${user.uid}), saving spider to Firestore...`);
        const savedSpider = await saveNewSpider(newSpider, user.uid);
        // Add the saved spider (with Firestore ID) to the game store
        console.log(`Spider saved to Firestore with ID ${savedSpider.id}, adding to game store...`);
        addSpider(savedSpider);
        return savedSpider;
      } else {
        // Fallback to local-only if not authenticated
        console.log(`User is not authenticated, creating local-only spider...`);
        const localSpider = {
          ...newSpider,
          id: `spider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        };
        addSpider(localSpider);
        return localSpider;
      }
    } catch (error) {
      console.error('Error creating new spider:', error);
      // Fallback to local-only in case of error
      console.log(`Error occurred, falling back to local-only spider...`);
      const localSpider = {
        ...newSpider,
        id: `spider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };
      addSpider(localSpider);
      return localSpider;
    }
  };
  
  const createNewDress = (rarity: string) => {
    // Calculate power bonus based on rarity
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
    
    // Select random dress type and theme
    const dressTypeIndex = Math.floor(Math.random() * DRESS_COLLECTION.length);
    const dressType = DRESS_COLLECTION[dressTypeIndex].type;
    const possibleThemes = DRESS_COLLECTION[dressTypeIndex].themes[rarity as keyof typeof DRESS_COLLECTION[0]['themes']];
    const theme = possibleThemes[Math.floor(Math.random() * possibleThemes.length)];
    
    const newDress: Dress = {
      id: generateUniqueDressId(),
      name: `${theme} ${rarity} ${dressType}`,
      rarity: rarity,
      powerBonus: powerBonus,
      src: `/images/dresses/${dressType.toLowerCase()}/${theme.toLowerCase().replace(' ', '-')}.png`,
      stats,
      type: dressType as DressType,
      theme: theme
    };
    
    addDress(newDress);
    return newDress;
  };

  const getRarityColor = (rarity: string): string => {
    return RARITY_TEXT_COLORS[rarity as keyof typeof RARITY_TEXT_COLORS] || RARITY_TEXT_COLORS.Common;
  };

  const getRarityBgColor = (rarity: string): string => {
    const color = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.Common;
    return `bg-[${color}]/10`;
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl relative max-h-[90vh] overflow-y-auto">
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
            <SparklesIcon className="w-6 h-6 inline-block mr-2 text-yellow-500" />
            Summoning Portal
          </Dialog.Title>

          {/* Modal Content */}
          <div className="space-y-4">
            {/* Balance Display */}
            <div className="text-sm text-gray-600">
              Balance: {isBalanceLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                getSpiderBalance()
              )} $SPIDER
            </div>

            {/* Summon Type Selection */}
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

            {/* Amount Selection */}
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
                }`