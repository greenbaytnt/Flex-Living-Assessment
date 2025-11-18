const axios = require('axios');
const config = require('../config');

class GooglePlacesService {
  constructor() {
    this.apiKey = config.google?.apiKey || process.env.GOOGLE_PLACES_API_KEY;
    this.baseURL = 'https://maps.googleapis.com/maps/api/place';
  }
  
  isConfigured() {
    return !!this.apiKey;
  }

  async getPlaceReviews(placeId) {
    if (!this.isConfigured()) {
      console.warn('Google Places API key not configured');
      return { status: 'error', message: 'Google Places API not configured', reviews: [] };
    }

    try {
      const response = await axios.get(`${this.baseURL}/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,rating,user_ratings_total,reviews,formatted_address',
          key: this.apiKey
        }
      });

      if (response.data.status !== 'OK') {
        console.error('Google Places API error:', response.data.status);
        return { 
          status: 'error', 
          message: response.data.status, 
          reviews: [] 
        };
      }

      return {
        status: 'success',
        data: response.data.result,
        reviews: response.data.result.reviews || []
      };
    } catch (error) {
      console.error('Error fetching Google Place reviews:', error.message);
      return { 
        status: 'error', 
        message: error.message, 
        reviews: [] 
      };
    }
  }

  normalizeReview(googleReview, placeId, placeName) {
    return {
      id: `google-${googleReview.time}-${placeId}`,
      type: 'guest-to-host',
      status: 'published',
      text: googleReview.text || '',
      rating: googleReview.rating || 0,
      categories: [], // Google doesn't provide category ratings
      date: new Date(googleReview.time * 1000).toISOString(),
      guestName: googleReview.author_name || 'Anonymous Guest',
      listingName: placeName || 'Unknown Listing',
      listingId: placeId,
      channel: 'Google',
      source: 'google',
      profilePhotoUrl: googleReview.profile_photo_url || null,
      relativeTimeDescription: googleReview.relative_time_description || null,
      rawData: googleReview
    };
  }

  normalizeReviews(reviews, placeId, placeName) {
    if (!Array.isArray(reviews)) return [];
    return reviews.map(review => this.normalizeReview(review, placeId, placeName));
  }

  async getReviews(placeId) {
    if (!placeId) {
      return [];
    }

    const result = await this.getPlaceReviews(placeId);
    
    if (result.status !== 'success') {
      return [];
    }

    const placeName = result.data.name || 'Unknown Listing';
    return this.normalizeReviews(result.reviews, placeId, placeName);
  }

  async getReviewsForMultiplePlaces(places) {
    if (!Array.isArray(places) || places.length === 0) {
      return [];
    }

    const promises = places.map(async (place) => {
      try {
        const reviews = await this.getReviews(place.placeId);
        if (place.listingName) {
          return reviews.map(review => ({
            ...review,
            listingName: place.listingName
          }));
        }
        return reviews;
      } catch (error) {
        console.error(`Error fetching reviews for place ${place.placeId}:`, error);
        return [];
      }
    });

    const results = await Promise.all(promises);
    return results.flat();
  }
}

module.exports = new GooglePlacesService();

