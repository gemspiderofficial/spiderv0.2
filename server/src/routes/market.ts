import express from 'express';
import { IMarketListing } from '../models/Market';
import MarketListing from '../models/Market';
import Spider from '../models/Spider';
import Player from '../models/Player';

const router = express.Router();

// Get all active market listings
router.get('/listings', async (req, res) => {
  try {
    const listings = await MarketListing.find({ status: 'LISTED' })
      .sort({ listedAt: -1 })
      .limit(100);
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get listings by type
router.get('/listings/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const listings = await MarketListing.find({ 
      type: type.toUpperCase(),
      status: 'LISTED'
    }).sort({ listedAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get user's active listings
router.get('/my-listings/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const listings = await MarketListing.find({ 
      seller: walletAddress,
      status: 'LISTED'
    }).sort({ listedAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your listings' });
  }
});

// Create new listing
router.post('/list', async (req, res) => {
  try {
    const { itemId, type, name, price, seller, description } = req.body;

    // Verify seller owns the item
    if (type === 'SPIDER') {
      const spider = await Spider.findOne({ uniqueId: itemId, owner: seller });
      if (!spider) {
        return res.status(403).json({ error: 'You do not own this spider' });
      }
      if (spider.isListed) {
        return res.status(400).json({ error: 'Spider is already listed' });
      }
      // Mark spider as listed
      spider.isListed = true;
      await spider.save();
    }

    const listing = new MarketListing({
      itemId,
      type,
      name,
      price,
      seller,
      description,
      marketplaceFee: 10 // 10% fee
    });

    await listing.save();
    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Cancel listing
router.post('/cancel/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;
    const { walletAddress } = req.body;

    const listing = await MarketListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.seller !== walletAddress) {
      return res.status(403).json({ error: 'Not your listing' });
    }

    if (listing.status !== 'LISTED') {
      return res.status(400).json({ error: 'Listing is not active' });
    }

    // If it's a spider, unmark it as listed
    if (listing.type === 'SPIDER') {
      const spider = await Spider.findOne({ uniqueId: listing.itemId });
      if (spider) {
        spider.isListed = false;
        await spider.save();
      }
    }

    listing.status = 'CANCELLED';
    await listing.save();

    res.json({ message: 'Listing cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel listing' });
  }
});

// Buy item
router.post('/buy/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;
    const { buyerAddress } = req.body;

    const listing = await MarketListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.status !== 'LISTED') {
      return res.status(400).json({ error: 'Item is not available' });
    }

    // Check buyer's balance
    const buyer = await Player.findOne({ walletAddress: buyerAddress });
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    if (buyer.balance.SPIDER < listing.price) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Process the transaction
    const fee = Math.floor(listing.price * (listing.marketplaceFee / 100));
    const sellerAmount = listing.price - fee;

    // Update buyer's balance
    buyer.balance.SPIDER -= listing.price;
    await buyer.save();

    // Update seller's balance
    const seller = await Player.findOne({ walletAddress: listing.seller });
    if (seller) {
      seller.balance.SPIDER += sellerAmount;
      await seller.save();
    }

    // Transfer item ownership
    if (listing.type === 'SPIDER') {
      const spider = await Spider.findOne({ uniqueId: listing.itemId });
      if (spider) {
        spider.owner = buyerAddress;
        spider.isListed = false;
        await spider.save();
      }
    }

    // Update listing status
    listing.status = 'SOLD';
    listing.buyer = buyerAddress;
    listing.soldAt = new Date();
    await listing.save();

    res.json({
      message: 'Purchase successful',
      transaction: {
        price: listing.price,
        fee,
        sellerAmount,
        item: listing
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

export default router; 