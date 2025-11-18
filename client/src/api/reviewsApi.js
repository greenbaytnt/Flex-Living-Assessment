import axiosInstance from './axiosInstance';

export const getAllReviews = async (filters = {}) => {
  const response = await axiosInstance.get('/api/reviews/hostaway', { params: filters });
  return response.data;
};

export const getApprovedReviews = async (filters = {}) => {
  const response = await axiosInstance.get('/api/reviews/approved', { params: filters });
  return response.data;
};

let analyticsCache = {
  data: null,
  timestamp: null
};

const ANALYTICS_CACHE_DURATION = 5 * 60 * 1000;

export const getAnalytics = async (forceRefresh = false) => {
  const now = Date.now();
  const isCacheValid = 
    !forceRefresh &&
    analyticsCache.data &&
    analyticsCache.timestamp &&
    (now - analyticsCache.timestamp < ANALYTICS_CACHE_DURATION);
  
  if (isCacheValid) {
    return analyticsCache.data;
  }
  
  const response = await axiosInstance.get('/api/reviews/analytics');
  analyticsCache = {
    data: response.data,
    timestamp: Date.now()
  };
  
  return response.data;
};

export const invalidateAnalyticsCache = () => {
  analyticsCache = {
    data: null,
    timestamp: null
  };
};

export const updateReviewSelection = async (data) => {
  const response = await axiosInstance.post('/api/reviews/selection', data);
  return response.data;
};

