import { useState, useEffect } from 'react';
import { QueryConstraint } from 'firebase/firestore';
import {
  createDocument,
  createDocumentWithId,
  getDocument,
  updateDocument,
  deleteDocument,
  queryDocuments,
  listenToDocument,
  listenToCollection,
  where,
  orderBy,
  limit
} from '../services/firebaseService';

export interface FirestoreState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface FirestoreCollectionState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

// Hook for a single document
export const useFirestoreDoc = <T>(
  collectionPath: string,
  docId: string | null,
  realtime: boolean = false
) => {
  const [state, setState] = useState<FirestoreState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!docId) {
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
      const unsubscribe = listenToDocument<T>(
        collectionPath,
        docId,
        (data) => {
          setState({
            data,
            loading: false,
            error: null,
          });
        }
      );

      // Clean up listener on unmount
      return () => unsubscribe();
    } else {
      // Just fetch once
      const fetchDocument = async () => {
        try {
          const doc = await getDocument<T>(collectionPath, docId);
          setState({
            data: doc,
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

      fetchDocument();
    }
  }, [collectionPath, docId, realtime]);

  // Add/update document
  const setDocument = async (data: T, id?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      let documentId = id || docId;
      
      if (documentId) {
        // Update existing doc with known ID
        await createDocumentWithId(collectionPath, documentId, data);
        
        if (!realtime) {
          // If not using realtime, manually update local state
          setState({
            data: { ...data, id: documentId } as unknown as T,
            loading: false,
            error: null,
          });
        }
        return documentId;
      } else {
        // Create new document with auto-ID
        const newId = await createDocument(collectionPath, data);
        
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

  // Update document fields
  const updateDoc = async (data: Partial<T>) => {
    if (!docId) {
      throw new Error('Document ID is required for updates');
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      await updateDocument<T>(collectionPath, docId, data);
      
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

  // Delete document
  const deleteDoc = async () => {
    if (!docId) {
      throw new Error('Document ID is required for deletion');
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      await deleteDocument(collectionPath, docId);
      
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
    setDocument,
    updateDoc,
    deleteDoc,
  };
};

// Hook for a collection
export const useFirestoreCollection = <T>(
  collectionPath: string,
  constraints: QueryConstraint[] = [],
  realtime: boolean = false
) => {
  const [state, setState] = useState<FirestoreCollectionState<T>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    setState(prev => ({ ...prev, loading: true }));

    if (realtime) {
      // Use realtime listener
      const unsubscribe = listenToCollection<T>(
        collectionPath,
        constraints,
        (data) => {
          setState({
            data,
            loading: false,
            error: null,
          });
        }
      );

      // Clean up listener on unmount
      return () => unsubscribe();
    } else {
      // Just fetch once
      const fetchCollection = async () => {
        try {
          const documents = await queryDocuments<T>(collectionPath, constraints);
          setState({
            data: documents,
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
  }, [collectionPath, constraints.length, realtime]);

  // Add document to collection
  const addDocument = async (data: T, id?: string) => {
    try {
      if (id) {
        await createDocumentWithId(collectionPath, id, data);
        return id;
      } else {
        return await createDocument(collectionPath, data);
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    ...state,
    addDocument,
    queryUtils: { where, orderBy, limit },
  };
}; 