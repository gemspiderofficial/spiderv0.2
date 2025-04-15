# GemSpider Game Backend

This is the backend server for the GemSpider blockchain game. It handles game mechanics, blockchain transactions, and player data management.

## Features

- **Game Mechanics**
  - Spider condition management (hunger, hydration, health)
  - Automatic condition decrease over time
  - Token generation for active and offline players
  - Health decrease when hunger/hydration conditions are low

- **Blockchain Integration**
  - Transaction verification
  - Balance fetching
  - Deposit processing

- **Player Management**
  - Profile management
  - Spider ownership and management
  - Transaction history

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=3001
   NODE_ENV=development
   
   # Firebase
   FIREBASE_SERVICE_ACCOUNT=<base64_encoded_service_account_json>
   FIREBASE_DATABASE_URL=<your_firebase_database_url>
   
   # TON Blockchain
   TON_API_KEY=<your_ton_api_key>
   SPIDER_TOKEN_ADDRESS=<spider_token_contract_address>
   ```

3. Build the server:
   ```
   npm run build
   ```

4. Start the server:
   ```
   npm start
   ```

## Development

For development with hot reloading:
```
npm run dev
```

## API Endpoints

### Blockchain

- `GET /api/blockchain/balance/:walletAddress` - Get token balance for a wallet
- `POST /api/blockchain/verify-transaction` - Verify a blockchain transaction
- `POST /api/blockchain/deposit` - Process a deposit from blockchain to game balance

### Game

- `POST /api/game/update-conditions` - Manually trigger update of spider conditions (admin only)
- `POST /api/game/generate-tokens` - Manually trigger token generation (admin only)
- `GET /api/game/status` - Get current game status and stats

### Spiders

- `POST /api/spiders/:spiderId/feed` - Feed a spider to increase hunger
- `POST /api/spiders/:spiderId/hydrate` - Hydrate a spider to increase hydration
- `POST /api/spiders/:spiderId/heal` - Heal a spider to increase health

### Players

- `GET /api/players/:userId/profile` - Get a player's game profile
- `GET /api/players/:userId/spiders` - Get all spiders owned by a player
- `POST /api/players/:userId/update-activity` - Update a player's last activity timestamp
- `GET /api/players/:userId/transactions` - Get a player's transaction history

## Cron Jobs

The server uses cron jobs to automatically:

1. Update spider conditions (hunger, hydration, health) every 30 minutes
2. Generate tokens for active players every hour
3. Generate tokens for offline players every 3 hours (at a reduced rate)
4. Run daily maintenance tasks at midnight

## Architecture

The server follows a standard MVC architecture:

- **Controllers**: Handle API requests and responses
- **Services**: Contain business logic
- **Models**: Define data structures
- **Routes**: Define API endpoints
- **Middleware**: Handle authentication, logging, etc.
- **Utils**: Utility functions
- **Config**: Configuration files 