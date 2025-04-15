import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { useAuthContext } from '../contexts/AuthContext';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { DepositModal } from '../components/modals/DepositModal';
import { 
  WalletIcon, 
  ArrowUpTrayIcon, 
  ArrowDownTrayIcon, 
  UserGroupIcon, 
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { getReferralStats, ReferralStats } from '../services/referralService';

function Profile() {
  const navigate = useNavigate();
  const { player } = useGameStore();
  const { logout, user, playerProfile } = useAuthContext();
  
  // Modal states
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  // Referral system states
  const [copied, setCopied] = useState(false);
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    earnings: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Load referral stats when component mounts
  useEffect(() => {
    if (user) {
      loadReferralStats();
    }
  }, [user]);

  // Load referral stats from Firestore
  const loadReferralStats = async () => {
    if (!user) return;
    
    setIsLoadingStats(true);
    try {
      const stats = await getReferralStats(user.uid);
      setReferralStats(stats);
    } catch (error) {
      console.error('Error loading referral stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Generate referral link
  const referralLink = user ? `https://gemspider.app/register?ref=${user.uid}` : '';

  // Handle copy referral link
  const handleCopyReferral = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle logout action
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleWithdraw = () => {
    // Implement TON withdrawal logic here
    console.log('Withdrawing:', withdrawAmount);
    setIsWithdrawOpen(false);
  };

  const stats = {
    totalSpiders: player.spiders.length,
    highestLevel: Math.max(...player.spiders.map(s => s.level), 0),
    totalPower: player.spiders.reduce((sum, s) => sum + s.power, 0),
    accountCreated: new Date(player.createdAt || Date.now()).toLocaleDateString(),
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4 max-w-4xl mx-auto"
    >
      <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-xy" />
        
        <div className="relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Profile
              </h1>
              {user && (
                <p className="text-gray-600 mt-1">{user.email || 'Anonymous User'}</p>
              )}
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <TonConnectButton />
            </motion.div>
          </div>

          <div className="space-y-8">
            {/* Balance Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <WalletIcon className="w-5 h-5 mr-2 text-blue-500" />
                Account Balance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-6 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg"
                >
                  <p className="text-sm text-gray-500 mb-2">$SPIDER</p>
                  <p className="font-bold text-2xl text-gray-800">{player.balance.SPIDER}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-6 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg"
                >
                  <p className="text-sm text-gray-500 mb-2">Feeders</p>
                  <p className="font-bold text-2xl text-gray-800">{player.balance.feeders}</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                onClick={() => setIsDepositOpen(true)}
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                Deposit $SPIDER
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                onClick={() => setIsWithdrawOpen(true)}
              >
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                Withdraw $SPIDER
              </motion.button>
            </div>

            {/* Statistics Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 backdrop-blur-sm border border-white/20 shadow-lg"
                >
                  <p className="text-sm text-gray-500">Total Spiders</p>
                  <p className="font-bold text-xl text-gray-800">{stats.totalSpiders}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm border border-white/20 shadow-lg"
                >
                  <p className="text-sm text-gray-500">Highest Level</p>
                  <p className="font-bold text-xl text-gray-800">{stats.highestLevel}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl bg-gradient-to-br from-pink-500/5 to-purple-500/5 backdrop-blur-sm border border-white/20 shadow-lg"
                >
                  <p className="text-sm text-gray-500">Total Power</p>
                  <p className="font-bold text-xl text-gray-800">{stats.totalPower}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 backdrop-blur-sm border border-white/20 shadow-lg"
                >
                  <p className="text-sm text-gray-500">Account Created</p>
                  <p className="font-bold text-xl text-gray-800">{stats.accountCreated}</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Referral System */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-sm border border-white/20 shadow-lg"
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <UserGroupIcon className="w-5 h-5 mr-2 text-indigo-500" />
                Referral Program
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-600">Invite friends and earn 5% of their $SPIDER purchases!</p>
                
                <div className="flex flex-col space-y-4">
                  {isLoadingStats ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="p-3 bg-white/40 rounded-lg text-center">
                        <p className="text-xs text-gray-500">Total Referrals</p>
                        <p className="font-bold text-lg">{referralStats.totalReferrals}</p>
                      </div>
                      <div className="p-3 bg-white/40 rounded-lg text-center">
                        <p className="text-xs text-gray-500">Active Users</p>
                        <p className="font-bold text-lg">{referralStats.activeReferrals}</p>
                      </div>
                      <div className="p-3 bg-white/40 rounded-lg text-center">
                        <p className="text-xs text-gray-500">Total Earnings</p>
                        <p className="font-bold text-lg">{referralStats.earnings} $SPIDER</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="relative">
                    <p className="text-sm text-gray-600 mb-2">Your Referral Link:</p>
                    <div className="flex">
                      <input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="flex-1 p-3 bg-white/60 border border-gray-200 rounded-l-lg text-sm"
                      />
                      <CopyToClipboard text={referralLink} onCopy={handleCopyReferral}>
                        <button className="bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded-r-lg transition-colors">
                          {copied ? (
                            <CheckIcon className="w-5 h-5" />
                          ) : (
                            <ClipboardDocumentIcon className="w-5 h-5" />
                          )}
                        </button>
                      </CopyToClipboard>
                    </div>
                    {copied && (
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-green-500 text-xs mt-1"
                      >
                        Copied to clipboard!
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Logout Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="pt-4"
            >
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      <Dialog
        open={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        className="relative z-50"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          aria-hidden="true"
        />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel 
            as={motion.div}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-xy" />
            
            <div className="relative">
              <Dialog.Title className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Withdraw $SPIDER
              </Dialog.Title>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to withdraw
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter amount"
                    max={player.balance.SPIDER}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Available: {player.balance.SPIDER} $SPIDER
                  </p>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsWithdrawOpen(false)}
                    className="flex-1 bg-gray-100 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWithdraw}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!withdrawAmount || Number(withdrawAmount) > player.balance.SPIDER}
                  >
                    Withdraw
                  </motion.button>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Deposit Modal */}
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
    </motion.div>
  );
}

export default Profile;