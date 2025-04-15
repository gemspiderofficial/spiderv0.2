import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFirestoreDoc } from '../../hooks/useFirestore';
import { User, GameProfile } from '../../types/Firebase';

const UserProfile: React.FC = () => {
  const { user, loading: authLoading, error: authError, logout } = useAuth();
  
  // User data from firestore (detailed profile)
  const { 
    data: userData, 
    loading: userDataLoading, 
    error: userDataError,
    updateDoc: updateUserData
  } = useFirestoreDoc<User>(
    'users', 
    user?.uid || null,
    true // realtime updates
  );
  
  // Game profile from firestore
  const { 
    data: gameProfile, 
    loading: profileLoading, 
    error: profileError,
    setDocument: setGameProfile,
    updateDoc: updateGameProfile
  } = useFirestoreDoc<GameProfile>(
    'gameProfiles', 
    user?.uid || null,
    true // realtime updates
  );
  
  const [walletInput, setWalletInput] = useState('');
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize wallet input with user data when it loads
  useEffect(() => {
    if (userData?.walletAddress) {
      setWalletInput(userData.walletAddress);
    }
    
    if (gameProfile?.username) {
      setUsername(gameProfile.username);
    }
  }, [userData, gameProfile]);
  
  // Handle saving the wallet address to user document
  const handleSaveWallet = async () => {
    if (!user) return;
    
    try {
      await updateUserData({ walletAddress: walletInput });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving wallet address:', error);
    }
  };
  
  // Handle creating or updating the game profile
  const handleCreateProfile = async () => {
    if (!user) return;
    
    if (!gameProfile) {
      // Create new profile if it doesn't exist
      try {
        const defaultProfile: Omit<GameProfile, 'id' | 'createdAt' | 'updatedAt'> = {
          userId: user.uid,
          username: username,
          level: 1,
          experience: 0,
          gems: 100, // Starting gems
          resources: { gold: 500, energy: 100 },
          achievements: [],
          inventory: [],
          spiders: []
        };
        
        await setGameProfile(defaultProfile, user.uid);
      } catch (error) {
        console.error('Error creating profile:', error);
      }
    } else {
      // Update existing profile
      try {
        await updateGameProfile({ username });
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };
  
  if (authLoading || userDataLoading || profileLoading) {
    return <div className="p-6">Loading profile...</div>;
  }
  
  if (authError || userDataError || profileError) {
    return (
      <div className="p-6 text-red-500">
        Error: {authError || userDataError || profileError}
      </div>
    );
  }
  
  if (!user) {
    return <div className="p-6">Please sign in to view your profile</div>;
  }
  
  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          {userData?.photoURL && (
            <img 
              src={userData.photoURL} 
              alt="Profile"
              className="w-20 h-20 rounded-full" 
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">
              {userData?.displayName || 'Anonymous User'}
            </h2>
            <p className="text-gray-600">{userData?.email}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Wallet Address
            </label>
            {isEditing ? (
              <div className="flex">
                <input
                  type="text"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  className="flex-1 p-2 border rounded-l"
                  placeholder="Enter wallet address"
                />
                <button
                  onClick={handleSaveWallet}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex">
                <div className="flex-1 p-2 border rounded-l bg-gray-100">
                  {userData?.walletAddress || 'No wallet connected'}
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-200 px-4 py-2 rounded-r"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="border-t pt-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Game Profile</h2>
        
        {!gameProfile ? (
          <div>
            <p className="mb-4">You haven't created a game profile yet.</p>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Choose a username"
              />
            </div>
            <button
              onClick={handleCreateProfile}
              className="w-full bg-green-500 text-white px-4 py-2 rounded"
            >
              Create Game Profile
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-100 p-3 rounded">
                <span className="text-gray-600 block">Username</span>
                <span className="font-semibold">{gameProfile.username}</span>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <span className="text-gray-600 block">Level</span>
                <span className="font-semibold">{gameProfile.level}</span>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <span className="text-gray-600 block">Experience</span>
                <span className="font-semibold">{gameProfile.experience} XP</span>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <span className="text-gray-600 block">Gems</span>
                <span className="font-semibold">{gameProfile.gems}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Resources</h3>
              <div className="flex gap-3">
                {Object.entries(gameProfile.resources).map(([key, value]) => (
                  <div key={key} className="bg-gray-100 p-2 rounded">
                    <span className="capitalize">{key}: </span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Spiders Owned</h3>
              {gameProfile.spiders.length === 0 ? (
                <p className="text-gray-600">No spiders yet</p>
              ) : (
                <p className="text-gray-600">{gameProfile.spiders.length} spiders</p>
              )}
            </div>
            
            <div className="mt-4">
              <label className="block text-gray-700 mb-2">
                Update Username
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 p-2 border rounded-l"
                />
                <button
                  onClick={handleCreateProfile}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <button
        onClick={logout}
        className="mt-8 w-full bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default UserProfile; 