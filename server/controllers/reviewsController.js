const hostawayService = require('../services/hostawayService');
const googlePlacesService = require('../services/googlePlacesService');
const config = require('../config');
const { reviewSelectionDb } = require('../db');

class ReviewsController {

  async getAllReviews(req, res) {
    try {
      const { listingName, minRating, maxRating, sortBy, sortOrder, category, channel } = req.query;
      
      let reviews = [];
      let dataSource = 'unknown';

      if (googlePlacesService.isConfigured() && config.google?.placeIds) {
        const placeIdEntries = Object.entries(config.google.placeIds);
        if (placeIdEntries.length > 0) {
          console.log('Attempting to fetch reviews from Google Places API...');
          const places = placeIdEntries.map(([name, placeId]) => ({ 
            listingName: name, 
            placeId 
          }));
          const googleReviews = await googlePlacesService.getReviewsForMultiplePlaces(places);
          
          if (googleReviews && googleReviews.length > 0) {
            reviews = googleReviews;
            dataSource = 'google';
            console.log(`Fetched ${reviews.length} reviews from Google Places API`);
          } else {
            console.log('Google Places API returned no reviews, trying Hostaway...');
          }
        }
      }

      if (reviews.length === 0) {
        console.log('Attempting to fetch reviews from Hostaway API...');
        const hostawayResult = await hostawayService.getReviews();
        
        if (hostawayResult.status === 'success' && hostawayResult.data.result && hostawayResult.data.result.length > 0) {
          reviews = hostawayService.normalizeReviews(hostawayResult.data.result);
          dataSource = hostawayResult.isMockData ? 'mock' : 'hostaway';
          console.log(`Fetched ${reviews.length} reviews from ${dataSource === 'mock' ? 'Mock Data' : 'Hostaway API'}`);
        } else {
          console.log('Hostaway API returned no reviews');
        }
      }

      const selections = await reviewSelectionDb.findAll();
      const selectionsMap = new Map();
      selections.forEach(sel => {
        selectionsMap.set(`${sel.source}-${sel.review_id}`, sel);
        selectionsMap.set(`${sel.source}-${Number(sel.review_id)}`, sel);
        selectionsMap.set(`${sel.source}-${String(sel.review_id)}`, sel);
      });

      reviews = reviews.map(review => {
        const key = `${review.source}-${review.id}`;
        const selection = selectionsMap.get(key);
        return {
          ...review,
          approved: selection?.approved === 1 || false,
          displayOnWebsite: selection?.display_on_website === 1 || false,
          notes: selection?.notes || null
        };
      });

      if (listingName && listingName.trim() !== '') {
        reviews = reviews.filter(r => 
          r.listingName?.toLowerCase().includes(listingName.toLowerCase())
        );
      }

      if (channel && channel.trim() !== '') {
        reviews = reviews.filter(r => r.channel === channel);
      }

      if (minRating !== undefined && minRating !== '') {
        const min = parseFloat(minRating);
        if (!isNaN(min)) {
          reviews = reviews.filter(r => (r.rating || 0) >= min);
        }
      }
      if (maxRating !== undefined && maxRating !== '') {
        const max = parseFloat(maxRating);
        if (!isNaN(max)) {
          reviews = reviews.filter(r => (r.rating || 0) <= max);
        }
      }

      if (category && category.trim() !== '') {
        reviews = reviews.filter(r => {
          const categories = r.categories || [];
          return categories.some(cat => cat.category === category);
        });
      }

      const sort = sortBy || 'date';
      const order = sortOrder || 'desc';
      
      reviews.sort((a, b) => {
        let compareA, compareB;
        
        switch(sort) {
          case 'rating':
            compareA = a.rating || 0;
            compareB = b.rating || 0;
            break;
          case 'guestName':
            compareA = (a.guestName || '').toLowerCase();
            compareB = (b.guestName || '').toLowerCase();
            break;
          case 'listingName':
            compareA = (a.listingName || '').toLowerCase();
            compareB = (b.listingName || '').toLowerCase();
            break;
          case 'date':
          default:
            compareA = new Date(a.date || 0);
            compareB = new Date(b.date || 0);
            break;
        }
        
        if (compareA < compareB) return order === 'asc' ? -1 : 1;
        if (compareA > compareB) return order === 'asc' ? 1 : -1;
        return 0;
      });

      res.json({ 
        status: 'success', 
        count: reviews.length, 
        reviews,
        dataSource
      });
    } catch (error) {
      console.error('Error in getAllReviews:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getApprovedReviews(req, res) {
    try {
      const { listingName, source } = req.query;
      let reviews = [];
      let dataSource = 'unknown';

      if (googlePlacesService.isConfigured() && config.google?.placeIds) {
        const placeIdEntries = Object.entries(config.google.placeIds);
        if (placeIdEntries.length > 0) {
          const places = placeIdEntries.map(([name, placeId]) => ({ 
            listingName: name, 
            placeId 
          }));
          const googleReviews = await googlePlacesService.getReviewsForMultiplePlaces(places);
          
          if (googleReviews && googleReviews.length > 0) {
            reviews = googleReviews;
            dataSource = 'google';
          }
        }
      }

      if (reviews.length === 0) {
        const hostawayResult = await hostawayService.getReviews();
        if (hostawayResult.status === 'success' && hostawayResult.data.result) {
          reviews = hostawayService.normalizeReviews(hostawayResult.data.result);
          dataSource = hostawayResult.isMockData ? 'mock' : 'hostaway';
        }
      }

      const filters = { display_on_website: true, approved: true };
      if (source) filters.source = source;

      const selections = await reviewSelectionDb.findAll(filters);
      const approvedIds = new Set();
      selections.forEach(sel => {
        approvedIds.add(sel.review_id);
        approvedIds.add(Number(sel.review_id));
        approvedIds.add(String(sel.review_id));
      });

      reviews = reviews.filter(review => approvedIds.has(review.id));

      const selectionsMap = new Map();
      selections.forEach(sel => {
        selectionsMap.set(sel.review_id, sel);
        selectionsMap.set(Number(sel.review_id), sel);
        selectionsMap.set(String(sel.review_id), sel);
      });
      
      reviews = reviews.map(review => ({
        ...review,
        approved: true,
        displayOnWebsite: true,
        notes: selectionsMap.get(review.id)?.notes || null
      }));

      if (listingName) {
        reviews = reviews.filter(r => 
          r.listingName?.toLowerCase().includes(listingName.toLowerCase())
        );
      }

      res.json({ 
        status: 'success', 
        count: reviews.length, 
        reviews,
        dataSource 
      });
    } catch (error) {
      console.error('Error in getApprovedReviews:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async updateReviewSelection(req, res) {
    try {
      const { reviewId, source, listingId, listingName, approved, displayOnWebsite, notes } = req.body;

      if (!reviewId || !source) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'reviewId and source are required'
        });
      }

      const data = {
        review_id: reviewId,
        source: source,
        listing_id: listingId || null,
        listing_name: listingName || null
      };

      if (approved !== undefined) data.approved = approved;
      if (displayOnWebsite !== undefined) data.display_on_website = displayOnWebsite;
      if (notes !== undefined) data.notes = notes;
      
      const result = await reviewSelectionDb.upsert(data);
      res.json({ status: 'success', data: result });
    } catch (error) {
      console.error('Error in updateReviewSelection:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getAnalytics(req, res) {
    try {
      let reviews = [];
      let dataSource = 'unknown';

      if (googlePlacesService.isConfigured() && config.google?.placeIds) {
        const placeIdEntries = Object.entries(config.google.placeIds);
        if (placeIdEntries.length > 0) {
          const places = placeIdEntries.map(([name, placeId]) => ({ 
            listingName: name, 
            placeId 
          }));
          const googleReviews = await googlePlacesService.getReviewsForMultiplePlaces(places);
          
          if (googleReviews && googleReviews.length > 0) {
            reviews = googleReviews;
            dataSource = 'google';
          }
        }
      }

      if (reviews.length === 0) {
        const hostawayResult = await hostawayService.getReviews();
        if (hostawayResult.status === 'success' && hostawayResult.data.result) {
          reviews = hostawayService.normalizeReviews(hostawayResult.data.result);
          dataSource = hostawayResult.isMockData ? 'mock' : 'hostaway';
        }
      }

      const totalReviews = reviews.length;
      const avgRating = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(2)
        : '0.00';

      const listingMap = {};
      reviews.forEach(review => {
        const key = review.listingName || 'Unknown';
        if (!listingMap[key]) {
          listingMap[key] = { listingName: key, count: 0, totalRating: 0 };
        }
        listingMap[key].count++;
        listingMap[key].totalRating += review.rating || 0;
      });

      const listingStats = Object.values(listingMap).map(listing => ({
        listingName: listing.listingName,
        reviewCount: listing.count,
        averageRating: (listing.totalRating / listing.count).toFixed(2)
      }));

      const ratingDistribution = [0, 0, 0, 0, 0];
      reviews.forEach(review => {
        if (review.rating) {
          const index = Math.floor(review.rating) - 1;
          if (index >= 0 && index < 5) ratingDistribution[index]++;
        }
      });

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentReviewsCount = reviews.filter(r => new Date(r.date) >= sevenDaysAgo).length;

      res.json({
        status: 'success',
        analytics: {
          totalReviews,
          averageRating: avgRating,
          recentReviewsCount,
          listingStats,
          ratingDistribution: ratingDistribution.map((count, index) => ({ rating: index + 1, count })),
          dataSource
        }
      });
    } catch (error) {
      console.error('Error in getAnalytics:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = new ReviewsController();
