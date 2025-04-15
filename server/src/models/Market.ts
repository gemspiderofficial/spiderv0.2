import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketListing extends Document {
  itemId: string;
  type: 'EGG' | 'SPIDER' | 'DRESS' | 'FEEDERS';
  name: string;
  price: number;
  seller: string;
  buyer?: string;
  status: 'LISTED' | 'SOLD' | 'CANCELLED';
  listedAt: Date;
  soldAt?: Date;
  description: string;
  marketplaceFee: number;
}

const MarketListingSchema: Schema = new Schema({
  itemId: { type: String, required: true },
  type: { type: String, required: true, enum: ['EGG', 'SPIDER', 'DRESS', 'FEEDERS'] },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  seller: { type: String, required: true },
  buyer: { type: String },
  status: { type: String, required: true, enum: ['LISTED', 'SOLD', 'CANCELLED'], default: 'LISTED' },
  listedAt: { type: Date, default: Date.now },
  soldAt: { type: Date },
  description: { type: String, required: true },
  marketplaceFee: { type: Number, required: true, default: 10 } // 10% fee
});

// Indexes for efficient querying
MarketListingSchema.index({ status: 1 });
MarketListingSchema.index({ seller: 1 });
MarketListingSchema.index({ type: 1 });
MarketListingSchema.index({ listedAt: -1 });

export default mongoose.model<IMarketListing>('MarketListing', MarketListingSchema); 