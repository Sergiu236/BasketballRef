// src/context/RefereeContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Referee } from '../data/referees';
import { useWebSocket } from '../websocket/useWebSocket';
import config from '../config';
import { authHeader, AUTH_EVENT } from '../services/authService';

interface RefereeContextType {
  // We'll store the loaded referees (pages combined) for infinite scroll
  referees: Referee[];

  // For infinite scroll
  loadMoreReferees: () => void;
  isLoading: boolean;
  hasMore: boolean;

  // The rest of your sync logic
  addReferee: (newReferee: Referee) => Promise<void>;
  deleteReferee: (id: number) => Promise<void>;
  updateReferee: (updatedReferee: Referee) => Promise<void>;
  updateRefereePartial: (id: number, partialData: Partial<Referee>) => Promise<void>;

  // Possibly keep a standard fetchReferees if you want
  fetchReferees?: () => Promise<void>;

  // Offline / server statuses
  isOnline: boolean;
  serverUp: boolean;
  isSyncing: boolean;
}

export const RefereeContext = createContext<RefereeContextType>({
  referees: [],
  loadMoreReferees: () => {},
  isLoading: false,
  hasMore: true,

  addReferee: async () => {},
  deleteReferee: async () => {},
  updateReferee: async () => {},
  updateRefereePartial: async () => {},

  // optional
  fetchReferees: async () => {},

  isOnline: true,
  serverUp: true,
  isSyncing: false,
});

interface Props {
  children: ReactNode;
}

export const RefereeProvider: React.FC<Props> = ({ children }) => {
  // =====================
  // 1) PAGINATION STATES
  // =====================
  const [referees, setReferees] = useState<Referee[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);  // or any chunk size
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // =====================
  // 2) OFFLINE / SYNC STATES
  // =====================
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [serverUp, setServerUp] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingOperations, setPendingOperations] = useState<any[]>([]);

  // =====================================================================
  // PAGINATION: load more data from the server
  // =====================================================================
  const loadMoreReferees = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `${config.API_URL}/api/referees?page=${page}&limit=${limit}`,
        {
          headers: {
            ...authHeader()
          }
        }
      );
      if (!res.ok) {
        console.error('Pagination load failed');
        setIsLoading(false);
        return;
      }

      const { data, hasMore: more } = await res.json();
      setReferees(prev => [...prev, ...data]);
      setPage(prev => prev + 1);
      setHasMore(more);
    } catch (err) {
      console.error('Error fetching infinite scroll refs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Single source of initial data loading
  const fetchReferees = async () => {
    setPage(1);
    setReferees([]);
    setHasMore(true);
    await loadMoreReferees();
  };

  // =====================
  // 3) OFFLINE / SYNC LOGIC
  // =====================
  // On mount, load pending operations from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('pendingOperations');
    if (stored) {
      setPendingOperations(JSON.parse(stored));
    }
  }, []);

  // Ascultă pentru evenimentul de autentificare
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('Auth state changed, fetching referees...');
      fetchReferees();
    };

    window.addEventListener(AUTH_EVENT, handleAuthChange);
    return () => {
      window.removeEventListener(AUTH_EVENT, handleAuthChange);
    };
  }, []);

  // Initial data load - eliminăm deoarece datele vor fi încărcate la autentificare
  useEffect(() => {
    // Verificăm dacă utilizatorul este autentificat înainte de a încărca date
    if (localStorage.getItem('auth_token')) {
      fetchReferees();
    }
  }, []);

  // Save pending ops to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pendingOperations', JSON.stringify(pendingOperations));
  }, [pendingOperations]);

  // Listen for offline/online events from the browser
  useEffect(() => {
    function handleOnline() {
      // If the browser goes online, check the server health immediately.
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // -------------------------------
  // Poll server health every 10 seconds.
  // -------------------------------
  useEffect(() => {
    async function checkServer() {
      try {
        const resp = await fetch(`${config.API_URL}/api/referees/health`);
        setServerUp(resp.ok);
        setIsOnline(resp.ok);
      } catch (err) {
        setServerUp(false);
        setIsOnline(false);
      }
    }
    // Initial check before setting the interval.
    checkServer();
    // Poll every 10 seconds (10000 ms)
    const intervalId = setInterval(checkServer, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Attempt to sync if we come back online and the server is available
  useEffect(() => {
    if (isOnline && serverUp) {
      syncPendingOps();
    }
  }, [isOnline, serverUp]);

  // The sync function calls /sync with the pending operations
  const syncPendingOps = async () => {
    if (!pendingOperations.length) return;
    setIsSyncing(true);
    try {
      const resp = await fetch(`${config.API_URL}/api/referees/sync`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({ operations: pendingOperations }),
      });
      if (resp.ok) {
        setPendingOperations([]);
        // Refresh the current data (refreshing only the current page)
        const currentPage = page;
        setPage(1);
        const res = await fetch(
          `${config.API_URL}/api/referees?page=1&limit=${limit}`,
          {
            headers: {
              ...authHeader()
            }
          }
        );
        if (res.ok) {
          const { data, hasMore: more } = await res.json();
          setReferees(data);
          setHasMore(more);
          setPage(currentPage);
        }
      } else {
        console.error('Sync failed');
      }
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // =====================
  // 4) CREATE / UPDATE / DELETE OPERATIONS
  // (Queue the operations if offline or the server is down)
  // =====================
  const addReferee = async (newReferee: Referee) => {
    if (!isOnline || !serverUp) {
      setPendingOperations(prev => [...prev, { type: 'create', payload: newReferee }]);
      return;
    }
    try {
      const res = await fetch(`${config.API_URL}/api/referees`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify(newReferee),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add referee');
      }
      // The WebSocket event will handle the UI update, so we don't need to update state here
      await res.json(); // Still parse the response to avoid fetch warnings
    } catch (error: any) {
      console.error('Error adding referee:', error.message);
      throw error;
    }
  };

  const deleteReferee = async (id: number) => {
    if (!isOnline || !serverUp) {
      setPendingOperations(prev => [...prev, { type: 'delete', payload: { id } }]);
      return;
    }
    try {
      const res = await fetch(`${config.API_URL}/api/referees/${id}`, {
        method: 'DELETE',
        headers: {
          ...authHeader()
        }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete referee');
      }
      // The WebSocket event will handle the UI update, so we don't need to update state here
    } catch (error: any) {
      console.error('Error deleting referee:', error.message);
      throw error;
    }
  };

  const updateReferee = async (updatedRef: Referee) => {
    if (!isOnline || !serverUp) {
      setPendingOperations(prev => [...prev, { type: 'update', payload: updatedRef }]);
      return;
    }
    try {
      const res = await fetch(`${config.API_URL}/api/referees/${updatedRef.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify(updatedRef),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update');
      }
      // The WebSocket event will handle the UI update, so we don't need to update state here
      await res.json(); // Still parse the response to avoid fetch warnings
    } catch (error: any) {
      console.error('Error updating referee:', error.message);
      throw error;
    }
  };

  const updateRefereePartial = async (id: number, partialData: Partial<Referee>) => {
    if (!isOnline || !serverUp) {
      setPendingOperations(prev => [...prev, { type: 'patch', payload: { id, partialData } }]);
      return;
    }
    try {
      const res = await fetch(`${config.API_URL}/api/referees/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify(partialData),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to patch referee');
      }
      // The WebSocket event will handle the UI update, so we don't need to update state here
      await res.json(); // Still parse the response to avoid fetch warnings
    } catch (error: any) {
      console.error('Error patching referee:', error.message);
      throw error;
    }
  };

  // =====================
  // 5) WEBSOCKET EVENT LISTENERS
  // =====================
  // Listen for live "refereeCreated" events:
  useWebSocket({
    eventName: 'refereeCreated',
    onMessage: (newRef: Referee) => {
      setReferees(prev => [newRef, ...prev]);
    }
  });

  // Listen for live "refereeUpdated" events:
  useWebSocket({
    eventName: 'refereeUpdated',
    onMessage: (updated: Referee) => {
      setReferees(prev => prev.map(r => r.id === updated.id ? updated : r));
    }
  });

  // Listen for live "refereeDeleted" events:
  useWebSocket({
    eventName: 'refereeDeleted',
    onMessage: (deleted: Referee) => {
      setReferees(prev => prev.filter(r => r.id !== deleted.id));
    }
  });

  return (
    <RefereeContext.Provider
      value={{
        referees,
        loadMoreReferees,
        isLoading,
        hasMore,

        addReferee,
        deleteReferee,
        updateReferee,
        updateRefereePartial,

        // You can optionally expose fetchReferees if you want
        fetchReferees,

        // Offline/online statuses
        isOnline,
        serverUp,
        isSyncing,
      }}
    >
      {children}
    </RefereeContext.Provider>
  );
};

export default RefereeProvider;
