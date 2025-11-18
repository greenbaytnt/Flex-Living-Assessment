import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { 
  getAllReviews, 
  updateReviewSelection as apiUpdateReviewSelection,
  invalidateAnalyticsCache
} from '../api/reviewsApi';

const ReviewContext = createContext();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReviews must be used within ReviewProvider');
  }
  return context;
};

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const cacheRef = useRef({
    data: null,
    timestamp: null,
    filters: null
  });
  
  const isFetchingRef = useRef(false);

  const fetchReviews = useCallback(async (filters = {}, forceRefresh = false) => {
    const filtersKey = JSON.stringify(filters);
    const now = Date.now();
    
    if (isFetchingRef.current && !forceRefresh) {
      return cacheRef.current.data || { reviews: [] };
    }
    
    const isCacheValid = 
      !forceRefresh &&
      cacheRef.current.data &&
      cacheRef.current.timestamp &&
      (now - cacheRef.current.timestamp < CACHE_DURATION) &&
      cacheRef.current.filters === filtersKey;
    
    if (isCacheValid) {
      setReviews(cacheRef.current.data.reviews || []);
      return cacheRef.current.data;
    }
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAllReviews(filters);
      cacheRef.current = {
        data,
        timestamp: Date.now(),
        filters: filtersKey
      };
      setReviews(data.reviews || []);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching reviews:', err);
      throw err;
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const invalidateCache = useCallback(() => {
    cacheRef.current = {
      data: null,
      timestamp: null,
      filters: null
    };
    invalidateAnalyticsCache();
  }, []);

  const updateReviewSelection = useCallback(async (reviewId, source, updates) => {
    setReviews(prevReviews => 
      prevReviews.map(r => 
        r.id === reviewId && r.source === source ? { ...r, ...updates } : r
      )
    );
    
    try {
      const review = reviews.find(r => r.id === reviewId && r.source === source);
      if (!review) throw new Error('Review not found');
      
      const data = {
        reviewId,
        source,
        listingId: review?.listingId || null,
        listingName: review?.listingName || null
      };

      if (updates.approved !== undefined) data.approved = updates.approved;
      if (updates.displayOnWebsite !== undefined) data.displayOnWebsite = updates.displayOnWebsite;
      if (updates.notes !== undefined) data.notes = updates.notes;

      const result = await apiUpdateReviewSelection(data);
      invalidateCache();
      return result;
    } catch (err) {
      console.error('Error updating review:', err);
      await fetchReviews({}, true);
      throw err;
    }
  }, [reviews, fetchReviews, invalidateCache]);

  const value = {
    reviews,
    loading,
    error,
    fetchReviews,
    updateReviewSelection,
    invalidateCache
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
};

