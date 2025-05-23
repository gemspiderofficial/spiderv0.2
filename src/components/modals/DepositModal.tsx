import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useGameStore } from '../../store/useGameStore';
import { XMarkIcon, ArrowDownIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { depositSpiderTokens, getUserWalletAddress, fetchSpiderTokenBalance, verifyDepositTransaction } from '../../services/tonService';
import { useTonConnectUI } from '@tonconnect/ui-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { user, playerProfile, refreshBalance } = useAuthContext();
  const { player, updateBalance } = useGameStore();
  const [tonConnectUI] = useTonConnectUI();
  
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoadingWalletInfo, setIsLoadingWalletInfo] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Load wallet info when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadWalletInfo();
    }
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isOpen, user]);

  // Load wallet information
  const loadWalletInfo = async () => {
    if (!user) return;
    
    setIsLoadingWalletInfo(true);
    setErrorMessage('');
    
    try {
      // Get wallet address
      const address = await getUserWalletAddress(user.uid);
      setWalletAddress(address);
      
      // Get wallet balance if address exists
      if (address) {
        const balance = await fetchSpiderTokenBalance(address);
        setWalletBalance(balance);
      }
    } catch (error) {
      console.error('Error loading wallet info:', error);
      setErrorMessage('Failed to load wallet information. Please try again.');
    } finally {
      setIsLoadingWalletInfo(false);
    }
  };

  // Start polling for transaction confirmation
  const startPolling = (txId: string) => {
    if (pollInterval) clearInterval(pollInterval);
    
    const interval = setInterval(async () => {
      try {
        const isConfirmed = await verifyDepositTransaction(txId, tonConnectUI.account?.address || '');
        if (isConfirmed) {
          clearInterval(interval);
          setSuccessMessage('Deposit confirmed! Your game balance has been updated.');
          setIsProcessing(false);
          refreshBalance();
          setTransactionId(null);
        }
      } catch (error) {
        console.error('Error checking transaction:', error);
      }
    }, 5000); // Poll every 5 seconds

    setPollInterval(interval);
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!user || !walletAddress || !tonConnectUI.account) {
      setErrorMessage('Please connect your wallet first.');
      return;
    }
    
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setErrorMessage('Please enter a valid amount.');
      return;
    }
    
    if (walletBalance !== null && depositAmount > walletBalance) {
      setErrorMessage('Not enough tokens in your wallet.');
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Create pending transaction
      const txId = await depositSpiderTokens(user.uid, walletAddress, depositAmount);
      
      if (!txId) {
        throw new Error('Failed to create transaction');
      }

      setTransactionId(txId);
      setSuccessMessage('Transaction initiated. Please confirm in your wallet...');

      // Request user to send tokens
      const result = await tonConnectUI.sendTransaction({
        messages: [{
          address: process.env.VITE_GAME_WALLET_ADDRESS || '',
          amount: depositAmount.toString(),
          payload: txId // Include transaction ID in payload
        }],
        validUntil: Date.now() + 5 * 60 * 1000 // 5 minutes
      });

      if (result.success) {
        startPolling(txId);
        setSuccessMessage('Transaction sent! Waiting for confirmation...');
      } else {
        throw new Error('Transaction rejected');
      }
      
    } catch (error) {
      console.error('Error processing deposit:', error);
      setErrorMessage('Transaction failed. Please try again.');
      setIsProcessing(false);
    }
  };

  // Handle button click
  const handleButtonClick = () => {
    if (!walletAddress) {
      onClose();
      // Navigate to profile page or open wallet connection dialog
    } else {
      handleDeposit();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl relative">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          
          {/* Modal Header */}
          <Dialog.Title className="text-2xl font-bold mb-2 text-center">
            Deposit $SPIDER Tokens
          </Dialog.Title>
          
          <p className="text-gray-600 text-center mb-6">
            Transfer $SPIDER tokens from your TON wallet to your game account
          </p>
          
          {/* Wallet Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            {isLoadingWalletInfo ? (
              <div className="text-center py-2">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Loading wallet information...</p>
              </div>
            ) : walletAddress ? (
              <>
                <div className="mb-3">
                  <p className="text-sm text-gray-500 mb-1">Wallet Address:</p>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded overflow-x-auto">
                    {walletAddress}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Wallet Balance:</p>
                    <p className="font-medium">
                      {walletBalance !== null ? walletBalance : 'Unknown'} $SPIDER
                    </p>
                  </div>
                  <button 
                    onClick={loadWalletInfo}
                    className="text-blue-500 hover:text-blue-700 p-2"
                    disabled={isLoadingWalletInfo}
                  >
                    <ArrowDownIcon className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <ExclamationCircleIcon className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-gray-600">No wallet connected</p>
                <p className="text-sm text-gray-500 mt-1">Connect a TON wallet in your profile settings</p>
              </div>
            )}
          </div>
          
          {/* Game Balance */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Game Balance:</p>
            <p className="font-medium">{player.balance.SPIDER || 0} $SPIDER</p>
          </div>
          
          {/* Deposit Form */}
          <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-2" htmlFor="deposit-amount">
              Deposit Amount:
            </label>
            <div className="flex">
              <input
                id="deposit-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing || !walletAddress}
              />
              <button
                className="bg-gray-200 px-3 py-2 rounded-r-lg hover:bg-gray-300 transition-colors"
                onClick={() => walletBalance && setAmount(walletBalance.toString())}
                disabled={walletBalance === null || isProcessing}
              >
                MAX
              </button>
            </div>
          </div>
          
          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
              {successMessage}
            </div>
          )}
          
          {/* Action Button */}
          <button
            onClick={handleButtonClick}
            disabled={isProcessing || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Processing...
              </span>
            ) : !walletAddress ? 'Connect Wallet' : 'Deposit Tokens'}
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}