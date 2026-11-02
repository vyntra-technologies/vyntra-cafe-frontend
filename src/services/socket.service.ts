import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './api';

class SocketService {
  private socket: Socket | null = null;

  connect(token?: string | null): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const authToken = token || localStorage.getItem('vyntra_access_token');

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: authToken ? { token: authToken } : undefined,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to Vyntra Cafe live stream:', this.socket?.id || 'connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.warn('[Socket] Connection warning:', error.message);
    });

    return this.socket;
  }

  getSocket(): Socket | null {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  joinTables() {
    const s = this.getSocket();
    s?.emit('join:tables');
  }

  joinOrder(orderId: string) {
    if (!orderId) return;
    const s = this.getSocket();
    s?.emit('join:order', orderId);
  }

  onTableStatusChange(callback: (data: { tableId: string; status: string; activeOrderId?: string }) => void) {
    const s = this.getSocket();
    s?.on('table:status_changed', callback);
    return () => {
      s?.off('table:status_changed', callback);
    };
  }

  onOrderStatusChange(
    callback: (data: { orderId: string; status: string; fulfillmentStatus: string; updatedAt: string }) => void
  ) {
    const s = this.getSocket();
    s?.on('order:status_updated', callback);
    return () => {
      s?.off('order:status_updated', callback);
    };
  }

  onOrderReady(callback: (data: { orderId: string; orderNumber: string; tableNumber?: string }) => void) {
    const s = this.getSocket();
    s?.on('order:ready', callback);
    return () => {
      s?.off('order:ready', callback);
    };
  }

  on(event: string, callback: (...args: any[]) => void) {
    const s = this.getSocket();
    s?.on(event, callback);
    return () => {
      s?.off(event, callback);
    };
  }

  off(event: string, callback?: (...args: any[]) => void) {
    const s = this.getSocket();
    if (callback) {
      s?.off(event, callback);
    } else {
      s?.off(event);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();

