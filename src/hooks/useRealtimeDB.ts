import { useState, useEffect } from 'react';
import {
  setData,
  pushData,
  getData,
  getAllData,
  updateData,
  deleteData,
  listenToData,
  listenToCollection,
  queryByField
} from '../services/realtimeDbService';

export interface RealtimeDBState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface RealtimeDBCollectionState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

// Hook for a single item in the Realtime DB
export const useRealtimeDBItem = <T>(
  path: string,
  id: string | null,
  realtime: boolean = false
) => {
  const [state, setState] = useState<RealtimeDBState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!id) {
      setState({
        data: null,
        loading: false,
        error: null,
      });
      return;
    }

    // Set initial loading state
    setState(prev => ({ ...prev, loading: true }));

    // Use realtime listener or fetch once
    if (realtime) {
      const unsubscribe = listenToData<T>(
        path,
        id,
        (data) => {
          setState({
            data,
            loading: false,
            error: null,
          });
        }
      );

      // Clean up listener on unmount
      return () => {
        unsubscribe();
      };
    } else {
      // Just fetch once
      const fetchData = async () => {
        try {
          const data = await getData<T>(path, id);
          setState({
            data,
            loading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setState({
            data: null,
            loading: false,
            error: errorMessage,
          });
        }
      };

      fetchData();
    }
  }, [path, id, realtime]);

  // Save data
  const saveItem = async (data: T, itemId?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const targetId = itemId || id;
      
      if (targetId) {
        // Save with known ID
        await setData(path, targetId, data);
        
        if (!realtime) {
          // If not using realtime, manually update local state
          setState({
            data: { ...data, id: targetId } as unknown as T,
            loading: false,
            error: null,
          });
        }
        return targetId;
      } else {
        // Create with auto-ID
        const newId = await pushData(path, data);
        
        if (!realtime) {
          // If not using realtime, manually update local state
          setState({
            data: { ...data, id: newId } as unknown as T,
            loading: false,
            error: null,
          });
        }
        return newId;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  // Update data
  const updateItem = async (data: Partial<T>) => {
    if (!id) {
      throw new Error('Item ID is required for updates');
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      await updateData<T>(path, id, data);
      
      if (!realtime) {
        // If not using realtime, manually update local state
        setState(prev => ({
          data: prev.data ? { ...prev.data, ...data } as T : null,
          loading: false,
          error: null,
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  // Delete data
  const deleteItem = async () => {
    if (!id) {
      throw new Error('Item ID is required for deletion');
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      await deleteData(path, id);
      
      if (!realtime) {
        // If not using realtime, manually update local state
        setState({
          data: null,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  return {
    ...state,
    saveItem,
    updateItem,
    deleteItem,
  };
};

// Hook for a collection in the Realtime DB
export const useRealtimeDBCollection = <T>(
  path: string,
  realtime: boolean = false
) => {
  const [state, setState] = useState<RealtimeDBCollectionState<T>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    setState(prev => ({ ...prev, loading: true }));

    if (realtime) {
      // Use realtime listener
      const unsubscribe = listenToCollection<T>(
        path,
        (data) => {
          setState({
            data,
            loading: false,
            error: null,
          });
        }
      );

      // Clean up listener on unmount
      return () => {
        unsubscribe();
      };
    } else {
      // Just fetch once
      const fetchCollection = async () => {
        try {
          const data = await getAllData<T>(path);
          setState({
            data,
            loading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setState({
            data: [],
            loading: false,
            error: errorMessage,
          });
        }
      };

      fetchCollection();
    }
  }, [path, realtime]);

  // Add item to collection
  const addItem = async (data: T, id?: string) => {
    try {
      if (id) {
        await setData(path, id, data);
        return id;
      } else {
        return await pushData(path, data);
      }
    } catch (error) {
      throw error;
    }
  };

  // Query by field
  const queryItems = async (field: string, value: string | number | boolean) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const results = await queryByField<T>(path, field, value);
      
      setState({
        data: results,
        loading: false,
        error: null,
      });
      
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  return {
    ...state,
    addItem,
    queryItems,
  };
}; 