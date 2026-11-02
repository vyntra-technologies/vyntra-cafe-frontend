import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketService } from '../services/socket.service';

interface SocketContextType {
  isConnected: boolean;
  joinOrderRoom: (orderId: string) => void;
  joinTableRoom: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const socket = socketService.connect();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  const joinOrderRoom = (orderId: string) => {
    socketService.joinOrder(orderId);
  };

  const joinTableRoom = () => {
    socketService.joinTables();
  };

  return (
    <SocketContext.Provider value={{ isConnected, joinOrderRoom, joinTableRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

