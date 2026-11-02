import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser, ICustomer } from '../types';
import { authService, LoginPayload, RegisterPayload, UpdateProfilePayload } from '../services/auth.service';
import { customerService } from '../services/customer.service';
import { socketService } from '../services/socket.service';

interface PendingAction {
  type: 'order_now' | 'add_to_cart' | 'checkout';
  itemPayload?: any;
  redirectTo?: string;
}

interface AuthContextType {
  user: IUser | null;
  customer: ICustomer | null;
  customerId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingAction: PendingAction | null;
  login: (payload: LoginPayload) => Promise<IUser>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  setPendingAction: (action: PendingAction | null) => void;
  clearPendingAction: () => void;
  executePendingAction: () => PendingAction | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(() => {
    try {
      const stored = localStorage.getItem('vyntra_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [customer, setCustomer] = useState<ICustomer | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(() => {
    return localStorage.getItem('vyntra_customer_id');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingAction, setPendingActionState] = useState<PendingAction | null>(() => {
    try {
      const stored = sessionStorage.getItem('vyntra_pending_action');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setPendingAction = (action: PendingAction | null) => {
    setPendingActionState(action);
    if (action) {
      sessionStorage.setItem('vyntra_pending_action', JSON.stringify(action));
    } else {
      sessionStorage.removeItem('vyntra_pending_action');
    }
  };

  const clearPendingAction = () => {
    setPendingActionState(null);
    sessionStorage.removeItem('vyntra_pending_action');
  };

  const executePendingAction = (): PendingAction | null => {
    const action = pendingAction;
    clearPendingAction();
    return action;
  };

  // On mount, check if token exists and fetch profile
  useEffect(() => {
    const token = localStorage.getItem('vyntra_access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    authService
      .getMe()
      .then((userData) => {
        setUser(userData);
        localStorage.setItem('vyntra_user', JSON.stringify(userData));
        socketService.connect(token);

        // Fetch customer profile if customerId exists or linked
        const storedCustomerId = localStorage.getItem('vyntra_customer_id');
        if (storedCustomerId) {
          customerService
            .getById(storedCustomerId)
            .then((cust) => setCustomer(cust))
            .catch(() => {});
        }
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('vyntra_access_token');
        localStorage.removeItem('vyntra_refresh_token');
        localStorage.removeItem('vyntra_user');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (payload: LoginPayload): Promise<IUser> => {
    setIsLoading(true);
    try {
      const result = await authService.login(payload);
      localStorage.setItem('vyntra_access_token', result.accessToken);
      localStorage.setItem('vyntra_refresh_token', result.refreshToken);
      localStorage.setItem('vyntra_user', JSON.stringify(result.user));
      setUser(result.user);
      socketService.connect(result.accessToken);
      return result.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const result = await authService.register(payload);
      localStorage.setItem('vyntra_access_token', result.accessToken);
      localStorage.setItem('vyntra_refresh_token', result.refreshToken);
      localStorage.setItem('vyntra_user', JSON.stringify(result.user));
      setUser(result.user);
      socketService.connect(result.accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setCustomer(null);
      setCustomerId(null);
      socketService.disconnect();
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (payload: UpdateProfilePayload) => {
    const updated = await authService.updateProfile(payload);
    setUser(updated);
    localStorage.setItem('vyntra_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customer,
        customerId,
        isAuthenticated: !!user,
        isLoading,
        pendingAction,
        login,
        register,
        logout,
        updateProfile,
        setPendingAction,
        clearPendingAction,
        executePendingAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

