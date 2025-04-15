import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRealtimeDBCollection, useRealtimeDBItem } from '../../hooks/useRealtimeDB';

interface ChatMessage {
  id?: string;
  userId: string;
  userName: string;
  photoURL?: string;
  message: string;
  timestamp: number;
}

interface ChatRoom {
  id?: string;
  name: string;
  description?: string;
  createdAt?: number;
  updatedAt?: number;
  lastMessageAt?: number;
}

const GameChat: React.FC = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string>('global');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get all chat rooms
  const {
    data: chatRooms,
    loading: roomsLoading,
    error: roomsError
  } = useRealtimeDBCollection<ChatRoom>(
    'chatRooms',
    true // realtime updates
  );
  
  // Get the current room details
  const {
    data: currentRoom,
    loading: currentRoomLoading,
    error: currentRoomError,
    updateItem: updateRoom
  } = useRealtimeDBItem<ChatRoom>(
    'chatRooms',
    selectedRoom,
    true // realtime updates
  );
  
  // Get messages for the current room
  const {
    data: messages,
    loading: messagesLoading,
    error: messagesError,
    addItem: addMessage
  } = useRealtimeDBCollection<ChatMessage>(
    `chatMessages/${selectedRoom}`,
    true // realtime updates
  );
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !message.trim()) return;
    
    try {
      // Create the message
      const newMessage: ChatMessage = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || undefined,
        message: message.trim(),
        timestamp: Date.now()
      };
      
      // Add to the realtime database
      await addMessage(newMessage);
      
      // Update the room's last message timestamp
      if (currentRoom) {
        await updateRoom({
          lastMessageAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      
      // Clear the input
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Show loading state
  if (roomsLoading || messagesLoading) {
    return <div className="p-4">Loading chat...</div>;
  }
  
  // Show error state
  if (roomsError || messagesError || currentRoomError) {
    return (
      <div className="p-4 text-red-600">
        Error: {roomsError || messagesError || currentRoomError}
      </div>
    );
  }
  
  // Sort messages by timestamp
  const sortedMessages = messages 
    ? [...messages].sort((a, b) => a.timestamp - b.timestamp)
    : [];
  
  return (
    <div className="flex flex-col h-[600px] max-w-3xl mx-auto rounded-lg shadow-md bg-white">
      {/* Chat header */}
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {currentRoom?.name || 'Game Chat'}
          </h2>
          
          {/* Room selector */}
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="p-2 border rounded-md"
          >
            {chatRooms?.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>
        
        {currentRoom?.description && (
          <p className="text-sm text-gray-600 mt-1">
            {currentRoom.description}
          </p>
        )}
      </div>
      
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
        {sortedMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Be the first to say something!
          </div>
        ) : (
          <div className="space-y-3">
            {sortedMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.userId === user?.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.userId === user?.uid 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.userId !== user?.uid && (
                    <div className="flex items-center gap-2 mb-1">
                      {msg.photoURL && (
                        <img 
                          src={msg.photoURL} 
                          alt={msg.userName} 
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="font-semibold text-sm">
                        {msg.userName}
                      </span>
                    </div>
                  )}
                  
                  <p className="break-words">{msg.message}</p>
                  
                  <div 
                    className={`text-xs mt-1 ${
                      msg.userId === user?.uid ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message input */}
      <div className="p-3 border-t">
        {user ? (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-md"
              disabled={!selectedRoom}
            />
            <button
              type="submit"
              disabled={!message.trim() || !selectedRoom}
              className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-300"
            >
              Send
            </button>
          </form>
        ) : (
          <div className="text-center text-gray-500">
            Please sign in to participate in the chat
          </div>
        )}
      </div>
    </div>
  );
};

export default GameChat; 