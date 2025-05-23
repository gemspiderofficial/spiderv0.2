import { useState, useEffect } from 'react';
import { getSpiderImage } from '../utils/spiderImage';
import { useGameStore } from '../store/useGameStore';

interface LoadingScreenProps {
  fullscreen?: boolean;
  onLoadingComplete?: () => void;
}

export function LoadingScreen({ fullscreen = true, onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [progressComplete, setProgressComplete] = useState(false);
  const { player } = useGameStore();
  const activeSpider = player?.spiders?.[0];

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    // Start progress animation
    intervalId = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(intervalId);
          setProgressComplete(true);
          return 100;
        }
        // Slow down progress as it gets closer to 100
        const increment = Math.max(1, (100 - prev) / 10);
        return Math.min(prev + increment, 100);
      });
    }, 50);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (progressComplete && onLoadingComplete) {
      const timeout = setTimeout(onLoadingComplete, 500);
      return () => clearTimeout(timeout);
    }
  }, [progressComplete, onLoadingComplete]);

  if (!fullscreen) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-teal-500/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-teal-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col justify-between z-[9999]">
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-4 border-teal-500/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-teal-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={activeSpider ? getSpiderImage(activeSpider.genetics) : "src/assets/Home.png"}
              alt="Loading"
              className="w-12 h-12 animate-pulse"
            />
          </div>
        </div>
      </div>
      
      <div className="w-full px-8 pb-12">
        <div className="h-4 bg-gray-800 rounded-full overflow-hidden mb-3">
          <div 
            className="h-full bg-gradient-to-r from-teal-600 via-teal-500 to-teal-400 rounded-full transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.3)_30%,rgba(255,255,255,0)_50%)] animate-shimmer"></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center px-1">
          <div className="text-teal-500 text-sm font-medium">
            {progress === 100 ? 'Almost ready...' : 'Loading game...'}
          </div>
          <div className="text-teal-500 text-sm font-bold">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
}