import React from 'react';
import { Spider } from '../types/spider';
import { experienceForNextLevel, experienceForCurrentLevel, getExpRequiredForLevel, canLevelUp } from '../utils/core';
import { RARITY_LEVELS } from '../constants/game';

interface SpiderLevelInfoProps {
  spider: Spider;
}

export function SpiderLevelInfo({ spider }: SpiderLevelInfoProps) {
  const currentLevelExp = experienceForCurrentLevel(spider.level);
  const nextLevelExp = experienceForCurrentLevel(spider.level + 1);
  const feedsNeeded = getExpRequiredForLevel(spider.level);
  const feedsCompleted = spider.experience - currentLevelExp;
  const progressToNextLevel = (feedsCompleted / feedsNeeded) * 100;
  
  const maxLevel = RARITY_LEVELS[spider.rarity];
  const isMaxLevel = spider.level >= maxLevel;

  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold">
          Level {spider.level}{isMaxLevel ? ' (MAX)' : ''}
        </span>
        <span className="text-sm text-gray-600">
          {isMaxLevel ? 
            `Max Level for ${spider.rarity}` : 
            `${Math.floor(feedsCompleted)} / ${feedsNeeded} Feeds`}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${isMaxLevel ? 'bg-yellow-500' : 'bg-blue-500'} transition-all duration-300`}
          style={{ width: isMaxLevel ? '100%' : `${progressToNextLevel}%` }}
        />
      </div>
    </div>
  );
}