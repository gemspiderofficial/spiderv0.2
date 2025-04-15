import mongoose, { Schema, Document } from 'mongoose';

export interface ISpider extends Document {
  uniqueId: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical';
  genetics: 'S' | 'A' | 'J' | 'SA' | 'SJ' | 'AJ' | 'SAJ';
  gender: 'Male' | 'Female';
  level: number;
  experience: number;
  power: number;
  stats: {
    attack: number;
    defense: number;
    agility: number;
    luck: number;
  };
  condition: {
    health: number;
    hunger: number;
    hydration: number;
  };
  generation: number;
  parents?: {
    father: string;
    mother: string;
  };
  lastFed: Date;
  lastHydrated: Date;
  lastGemCollection: Date;
  lastTokenGeneration: Date;
  isHibernating: boolean;
  isAlive: boolean;
  dresses: string[];
  createdAt: Date;
  isListed: boolean;
  owner: string;
}

const SpiderSchema: Schema = new Schema({
  uniqueId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  rarity: { type: String, required: true, enum: ['Common', 'Rare', 'Epic', 'Legendary', 'Mythical'] },
  genetics: { type: String, required: true, enum: ['S', 'A', 'J', 'SA', 'SJ', 'AJ', 'SAJ'] },
  gender: { type: String, required: true, enum: ['Male', 'Female'] },
  level: { type: Number, required: true, default: 1 },
  experience: { type: Number, required: true, default: 0 },
  power: { type: Number, required: true, default: 0 },
  stats: {
    attack: { type: Number, required: true, default: 10 },
    defense: { type: Number, required: true, default: 10 },
    agility: { type: Number, required: true, default: 10 },
    luck: { type: Number, required: true, default: 10 }
  },
  condition: {
    health: { type: Number, required: true, default: 100 },
    hunger: { type: Number, required: true, default: 100 },
    hydration: { type: Number, required: true, default: 100 }
  },
  generation: { type: Number, required: true, default: 1 },
  parents: {
    father: { type: String },
    mother: { type: String }
  },
  lastFed: { type: Date, default: Date.now },
  lastHydrated: { type: Date, default: Date.now },
  lastGemCollection: { type: Date, default: Date.now },
  lastTokenGeneration: { type: Date, default: Date.now },
  isHibernating: { type: Boolean, default: false },
  isAlive: { type: Boolean, default: true },
  dresses: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  isListed: { type: Boolean, default: false },
  owner: { type: String, required: true }
});

export default mongoose.model<ISpider>('Spider', SpiderSchema); 