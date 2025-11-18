const axios = require('axios');
const config = require('../config');

class HostawayService {
  constructor() {
    this.baseURL = config.hostaway.baseUrl;
    this.clientId = config.hostaway.clientId;
    this.clientSecret = config.hostaway.clientSecret;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const params = new URLSearchParams();
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('grant_type', 'client_credentials');
      params.append('scope', 'general');

      const response = await axios.post(`${this.baseURL}/accessTokens`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000 * 0.9);
      return this.accessToken;
    } catch (error) {
      console.error('Failed to get Hostaway access token:', error.response?.data || error.message);
      throw error;
    }
  }

  async getClient() {
    const token = await this.getAccessToken();
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async getReviews(params = {}) {
    if (!this.clientId || !this.clientSecret) {
      return this.getMockData();
    }

    try {
      const client = await this.getClient();
      const response = await client.get('/reviews', { params });

      if (!response.data.result || response.data.result.length === 0) {
        return this.getMockData();
      }

      return {
        status: 'success',
        data: response.data,
        count: response.data?.result?.length || 0,
        isMockData: false
      };
    } catch (error) {
      console.error('Hostaway API Error:', error.response?.data || error.message);
      return this.getMockData();
    }
  }

  getMockData() {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const mockDataPath = path.join(__dirname, '../data/mock-hostaway-reviews.json');
      const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
      
      return {
        status: 'success',
        data: mockData,
        count: mockData.result?.length || 0,
        isMockData: true
      };
    } catch (error) {
      return {
        status: 'success',
        data: { status: 'success', result: [] },
        count: 0,
        isMockData: true
      };
    }
  }

  normalizeReview(rawReview) {
    const computeOverallRating = (review) => {
      if (review.rating !== null && review.rating !== undefined) {
        return review.rating;
      }
      
      if (Array.isArray(review.reviewCategory) && review.reviewCategory.length > 0) {
        const avg10 = review.reviewCategory.reduce((sum, cat) => {
          return sum + (Number(cat.rating) || 0);
        }, 0) / review.reviewCategory.length;
        
        return Math.round((avg10 / 2) * 10) / 10;
      }
      
      return null;
    };

    const parseDateString = (dateStr) => {
      if (!dateStr) return new Date().toISOString();
      const isoDate = dateStr.replace(' ', 'T');
      const date = new Date(isoDate);
      return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    };

    return {
      id: rawReview.id || `hostaway-${Math.random().toString(36).slice(2, 10)}`,
      type: rawReview.type || 'guest-to-host',
      status: rawReview.status || 'published',
      text: rawReview.publicReview || rawReview.privateReview || '',
      rating: computeOverallRating(rawReview),
      categories: rawReview.reviewCategory || [],
      date: parseDateString(rawReview.submittedAt),
      guestName: rawReview.guestName || 'Anonymous Guest',
      listingName: rawReview.listingName || 'Unknown Listing',
      listingId: rawReview.listingId || null,
      channel: rawReview.channel || 'Hostaway',
      source: 'hostaway',
      rawData: rawReview
    };
  }

  normalizeReviews(reviews) {
    if (!Array.isArray(reviews)) return [];
    return reviews.map(review => this.normalizeReview(review));
  }
}

module.exports = new HostawayService();

