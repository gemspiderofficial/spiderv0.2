import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';

let io: SocketServer;

export const initializeWebSocket = (server: Server) => {
  io = new SocketServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join room for specific player updates
    socket.on('join-player-room', (walletAddress: string) => {
      socket.join(`player-${walletAddress}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Utility functions for emitting events
export const emitMarketUpdate = (listing: any) => {
  io.emit('market-update', listing);
};

export const emitPlayerUpdate = (walletAddress: string, update: any) => {
  io.to(`player-${walletAddress}`).emit('player-update', update);
};

export const emitSpiderUpdate = (walletAddress: string, spider: any) => {
  io.to(`player-${walletAddress}`).emit('spider-update', spider);
}; 