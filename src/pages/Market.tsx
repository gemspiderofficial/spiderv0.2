import React, { useState, lazy, Suspense } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingScreen } from '../components/LoadingScreen';
import { Dialog } from '@headlessui/react';
import { RARITY_COLORS } from '../constants/game';

// Lazy load SpiderModal
const SpiderModal = lazy(() => import('../components/modals/SpiderModal').then(mod => ({ default: mod.SpiderModal })));

interface MarketItem {
  id: number;
  name: string;
  price: number;
  description: string;
  icon: string;
}

interface ListedItem {
  id: string;
  type: CategoryId;
  itemId: number;
  name: string;
  price: number;
  seller: string;
  icon: string;
  description: string;
}

type CategoryId = 'EGG' | 'SPIDER' | 'DRESS' | 'FEEDERS';

interface Category {
  id: CategoryId;
  name: string;
  icon: string;
}

type MarketItems = Record<CategoryId, MarketItem[]>;

type MarketView = 'BUY' | 'SELL' | 'MY_LISTINGS';

interface SellConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onConfirm: (price: string) => void;
}

function SellConfirmation({ isOpen, onClose, item, onConfirm }: SellConfirmationProps) {
  const [listingPrice, setListingPrice] = useState('');

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel 
          as={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-xy" />
          
          <div className="relative">
            <Dialog.Title className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              List Item for Sale
            </Dialog.Title>

            <div className="space-y-4">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
                <input
                  type="number"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  placeholder="Enter price in $SPIDER"
                  className="w-full px-4 py-2 rounded-xl border border-white/20 bg-white/50 backdrop-blur-sm mt-2"
                  min="0"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 bg-gray-100 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onConfirm(listingPrice)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-xl font-medium text-sm"
                  disabled={!listingPrice}
                >
                  List for Sale
                </motion.button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

// Add after SellConfirmationProps interface
interface BuyConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  item: ListedItem;
  onConfirm: () => void;
}

// Add BuyConfirmation component after SellConfirmation component
function BuyConfirmation({ isOpen, onClose, item, onConfirm }: BuyConfirmationProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel 
          as={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 animate-gradient-xy" />
          
          <div className="relative">
            <Dialog.Title className="text-xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Confirm Purchase
            </Dialog.Title>

            <div className="space-y-4">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
                <div className="font-medium text-gray-800">
                  Price: {item.price} $SPIDER
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Are you sure you want to buy this item?
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 bg-gray-100 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 rounded-xl font-medium text-sm"
                >
                  Confirm Purchase
                </motion.button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

// Add this interface after other interfaces
interface PriceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onConfirm: (price: string) => void;
}

// Add this component after BuyConfirmation component
function PriceInputModal({ isOpen, onClose, item, onConfirm }: PriceInputModalProps) {
  const [price, setPrice] = useState('');

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel 
          as={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-xy" />
          
          <div className="relative">
            <Dialog.Title className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Set Listing Price
            </Dialog.Title>

            <div className="space-y-4">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
              </div>

              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price in $SPIDER"
                className="w-full px-4 py-2 rounded-xl border border-white/20 bg-white/50 backdrop-blur-sm"
                min="0"
              />

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 bg-gray-100 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onConfirm(price)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-xl font-medium text-sm"
                  disabled={!price}
                >
                  Set Price
                </motion.button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

function Market() {
  const { player, market, listItem, cancelListing, buyListing } = useGameStore();
  const { balance } = player;
  const [activeCategory, setActiveCategory] = useState<CategoryId>('EGG');
  const [activeView, setActiveView] = useState<MarketView>('BUY');
  const [sellPrice, setSellPrice] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [inspectSpider, setInspectSpider] = useState<string | null>(null);
  const [showSellConfirmation, setShowSellConfirmation] = useState(false);
  // Add missing states
  const [showBuyConfirmation, setShowBuyConfirmation] = useState(false);
  const [itemToBuy, setItemToBuy] = useState<ListedItem | null>(null);

  // Move handleBuyListing inside component
  const handleBuyListing = (item: ListedItem) => {
    if (balance.SPIDER < item.price) return;
    setItemToBuy(item);
    setShowBuyConfirmation(true);
  };

  // Move confirmBuyItem inside component
  const confirmBuyItem = () => {
    if (itemToBuy) {
      buyListing(itemToBuy.id);
      setShowBuyConfirmation(false);
      setItemToBuy(null);
    }
  };

  const categories: Category[] = [
    { id: 'EGG', name: 'Eggs', icon: '🥚' },
    { id: 'SPIDER', name: 'Spiders', icon: '🕷️' },
    { id: 'DRESS', name: 'Dress', icon: '👕' },
    { id: 'FEEDERS', name: 'Feeders', icon: '🪲' },
  ];

  const marketItems: MarketItems = {
    EGG: [
      { id: 1, name: 'Common Egg', price: 500, description: 'Hatch a common spider', icon: '🥚' },
      { id: 2, name: 'Rare Egg', price: 1000, description: 'Higher chance of rare spider', icon: '🥚' },
    ],
    SPIDER: [], // Remove mock spiders since they don't have proper IDs
    DRESS: [
      { id: 5, name: 'Spider Hat', price: 100, description: 'Cute hat for your spider', icon: '🎩' },
      { id: 6, name: 'Spider Boots', price: 150, description: 'Boots for speed', icon: '👢' },
    ],
    FEEDERS: [
      { id: 7, name: 'Basic Feeder Pack', price: 100, description: '10x Feeders', icon: '🪲' },
      { id: 8, name: 'Premium Feeder Pack', price: 250, description: '30x Feeders', icon: '🪲' },
    ],
  };

  // Mock player's items that can be sold
  const playerItems = {
    SPIDER: player.spiders
      .filter(spider => !spider.isListed) // Only show unlisted spiders
      .map(spider => ({
        id: spider.id,
        name: spider.name,
        description: `Level ${spider.level} ${spider.rarity} Spider`,
        icon: '🕷️'
    })),
    DRESS: [], // Add player's dress items here
    FEEDERS: [{ id: 'feeder1', name: 'Feeders', description: `${player.balance.feeders} available`, icon: '🪲' }],
  };

  // Add this state at the top of the Market component with other states
  const [showPriceInput, setShowPriceInput] = useState(false);
  
  const handleSellItem = () => {
    if (!selectedItem) return;
    setShowSellConfirmation(true);
  };

  const confirmSellItem = (price: string) => {
    if (!selectedItem || !price) return;
    
    // Create a new listing
    const newListing: ListedItem = {
      id: `list-${Date.now()}`,
      type: activeCategory as CategoryId,
      itemId: selectedItem.id,
      name: selectedItem.name,
      price: Number(price),
      seller: 'You',
      icon: selectedItem.icon,
      description: selectedItem.description
    };

    // Add to listings via store action
    listItem(newListing);

    // Reset states
    setShowSellConfirmation(false);
    setSelectedItem(null);
    
    // Switch to MY_LISTINGS view
    setActiveView('MY_LISTINGS');
  };

  const handleInspectItem = (item: any) => {
    if (activeCategory === 'SPIDER') {
      const spiderToInspect = player.spiders.find(s => s.id === item.itemId);
      if (spiderToInspect) {
        setInspectSpider(spiderToInspect.id);
      }
    }
  };

  const renderListItem = (item: any, index: number, isPlayerListing: boolean = false) => {
      // Extract rarity from description for spiders (e.g., "Level 5 Rare Spider")
      const rarityMatch = item.description?.match(/(Common|Excellent|Rare|Epic|Legendary|Mythical|SPECIAL)/);
      const rarity = rarityMatch ? rarityMatch[1] : null;
      const textColor = rarity ? RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] : 'text-gray-800';
  
      return (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * (index + 1) }}
          whileHover={{ scale: 1.02 }}
          onClick={() => handleInspectItem(item)}
          className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-3 rounded-lg backdrop-blur-sm border border-white/20 shadow-md relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
          
          <div className="relative flex items-center gap-3">
            <span className="text-xl shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold truncate" style={{ color: textColor }}>{item.name}</h3>
                <span className="font-bold text-gray-800 shrink-0">{item.price} $SPIDER</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-gray-500 truncate">{item.description}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    isPlayerListing ? handleBuyListing(item) : null;
                  }}
                  className={`shrink-0 px-3 py-1 rounded-md text-xs font-medium shadow-sm hover:shadow transition-shadow disabled:opacity-50 disabled:cursor-not-allowed ${
                    isPlayerListing 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  }`}
                  disabled={balance.SPIDER < item.price}
                >
                  Buy Now
                </motion.button>
              </div>
              {isPlayerListing && (
                <p className="text-xs text-gray-400 mt-0.5">Seller: {item.seller}</p>
              )}
            </div>
          </div>
        </motion.div>
      );
  };

  const renderContent = () => {
    switch (activeView) {
      case 'SELL':
        return (
          <div className="space-y-4">
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <h3 className="font-semibold mb-2 text-sm">Select item to sell</h3>
              <div className="grid grid-cols-1 gap-2 max-h-[290px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-white/10">
                {playerItems[activeCategory as keyof typeof playerItems]?.map((item: any) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedItem(item)}
                    className={`p-2 rounded-lg border ${selectedItem?.id === item.id ? 'border-purple-500 bg-purple-50/50' : 'border-white/20 bg-white/30'} flex items-center gap-3`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="text-xs text-gray-500 truncate">{item.description}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
              {selectedItem && (
                <div className="mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSellItem}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    List for Sale
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        );

      case 'MY_LISTINGS':
        return (
          <div className="space-y-4">
            {market.myListings.length === 0 ? (
              <div className="text-center text-gray-500 py-8 text-sm">
                No active listings
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {market.myListings.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 1) }}
                    className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-3 rounded-lg backdrop-blur-sm border border-white/20 shadow-md relative overflow-hidden"
                  >
                    <div className="relative flex items-center gap-3">
                      <span className="text-xl shrink-0">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-gray-800 truncate">{item.name}</h3>
                          <span className="font-bold text-gray-800 shrink-0">{item.price} $SPIDER</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">Listed for sale</span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => cancelListing(item.id)}
                            className="text-xs text-red-500 hover:text-red-600"
                          >
                            Cancel Listing
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      default: // BUY view
        return (
          <div className="space-y-4">
            {/* Official Market Items */}
            <div className="grid grid-cols-1 gap-2">
              {marketItems[activeCategory].map((item, index) => renderListItem(item, index))}
            </div>

            {/* Player Listings */}
            {market.marketListings.filter(item => item.type === activeCategory).length > 0 && (
              <>
                <div className="border-t border-white/20 my-4" />
                <h3 className="font-semibold mb-2 text-sm">Player Listings</h3>
                <div className="grid grid-cols-1 gap-2">
                  {market.marketListings
                    .filter(item => item.type === activeCategory)
                    .map((item, index) => renderListItem(item, index, true))}
                </div>
              </>
            )}
          </div>
        );
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 p-4 max-w-4xl mx-auto"
      >
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl relative overflow-hidden min-h-[calc(100vh-8rem)]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-xy" />
          
          <div className="relative">
            <div className="flex justify-between items-start mb-6">
              <motion.h1 
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                Market
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-right"
              >
                <div className="flex flex-col gap-0.5">
                  <div>
                    <p className="text-xs text-gray-500">$SPIDER Balance</p>
                    <p className="font-bold text-lg text-gray-800 -mt-0.5">{balance.SPIDER}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Feeders</p>
                    <p className="font-bold text-lg text-gray-800 -mt-0.5">{balance.feeders}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 mb-4">
              {(['BUY', 'SELL', 'MY_LISTINGS'] as const).map((view) => (
                <motion.button
                  key={view}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveView(view)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    activeView === view 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                      : 'bg-white/50 text-gray-700 hover:bg-white/60'
                  }`}
                >
                  {view.replace('_', ' ')}
                </motion.button>
              ))}
            </div>

            {/* Category Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 mb-6"
            >
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex-1 relative py-1.5 px-3 rounded-lg backdrop-blur-sm border border-white/20 shadow-md overflow-hidden group
                    ${activeCategory === category.id 
                      ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20' 
                      : 'bg-white/50 hover:bg-white/60'}`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-base">{category.icon}</span>
                    <span className={`text-sm font-medium ${activeCategory === category.id ? 'text-purple-900' : 'text-gray-700'}`}>
                      {category.name}
                    </span>
                  </div>
                  {activeCategory === category.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>

            {/* Content Area */}
            {renderContent()}
      </div>
    </div>
      </motion.div>

      {/* Spider Modal */}
      <Suspense fallback={<LoadingScreen fullscreen={false} />}>
        {inspectSpider && (
          <SpiderModal
            isOpen={!!inspectSpider}
            onClose={() => setInspectSpider(null)}
            spiderId={inspectSpider}
          />
        )}
      </Suspense>

      {/* Sell Confirmation Modal */}
      <AnimatePresence>
        {showSellConfirmation && selectedItem && (
          <SellConfirmation
            isOpen={showSellConfirmation}
            onClose={() => setShowSellConfirmation(false)}
            item={selectedItem}
            onConfirm={confirmSellItem}
          />
        )}
      </AnimatePresence>

      {/* Buy Confirmation Modal */}
      <AnimatePresence>
        {showBuyConfirmation && itemToBuy && (
          <BuyConfirmation
            isOpen={showBuyConfirmation}
            onClose={() => {
              setShowBuyConfirmation(false);
              setItemToBuy(null);
            }}
            item={itemToBuy}
            onConfirm={confirmBuyItem}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default Market;

function buyListing(id: string) {
  throw new Error('Function not implemented.');
}
