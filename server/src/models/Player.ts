import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  walletAddress: string;
  name: string;
  balance: {
    SPIDER: number;
    feeders: number;
  };
  webtrap: {
    isUnlocked: boolean;
    level: number;
    lastCollection: Date;
  };
  createdAt: Date;
  lastLogin: Date;
}

const PlayerSchema: Schema = new Schema({
  walletAddress: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  balance: {
    SPIDER: { type: Number, required: true, default: 0 },
    feeders: { type: Number, required: true, default: 0 }
  },
  webtrap: {
    isUnlocked: { type: Boolean, default: false },
    level: { type: Number, default: 1 },
    lastCollection: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

export default mongoose.model<IPlayer>('Player', PlayerSchema); 