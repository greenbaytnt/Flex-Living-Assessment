import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider
} from '@mui/material';
import {
  RateReview,
  Star,
  Apartment,
  ArrowForward
} from '@mui/icons-material';
import { useReviews } from '../contexts/ReviewContext';
import { getAnalytics } from '../api/reviewsApi';
import StatsCard from '../components/StatsCard';
import FilterPanel from '../components/FilterPanel';
import ReviewCard from '../components/ReviewCard';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { reviews, loading, error, fetchReviews, updateReviewSelection } = useReviews();
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      loadData(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const loadData = async (forceRefresh = false) => {
    try {
      const reviewsData = await fetchReviews({}, forceRefresh);
      const analyticsData = await getAnalytics(forceRefresh);
      setAnalytics(analyticsData.analytics);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);
    await fetchReviews(newFilters);
  };

  const handleResetFilters = async () => {
    setFilters({});
    await fetchReviews();
  };

  const handleApprove = async (reviewId, source, approved) => {
    try {
      if (approved) {
        await updateReviewSelection(reviewId, source, { approved: true });
      } else {
        await updateReviewSelection(reviewId, source, { 
          approved: false,
          displayOnWebsite: false
        });
      }
      await loadData(true);
    } catch (err) {
      console.error('Error updating approval:', err);
    }
  };

  const handleToggleWebsite = async (reviewId, source, displayOnWebsite) => {
    try {
      await updateReviewSelection(reviewId, source, { displayOnWebsite });
      await loadData(true);
    } catch (err) {
      console.error('Error toggling website display:', err);
    }
  };

  const reviewsByListing = reviews.reduce((acc, review) => {
    const key = review.listingName || 'Unknown';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(review);
    return acc;
  }, {});

  if (loading && !analytics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
        Manager Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {analytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Reviews"
              value={analytics.totalReviews}
              icon={RateReview}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Average Rating"
              value={analytics.averageRating}
              icon={Star}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Recent Reviews"
              value={analytics.recentReviewsCount}
              icon={RateReview}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Properties"
              value={analytics.listingStats.length}
              icon={Apartment}
              color="secondary"
            />
          </Grid>
        </Grid>
      )}

      <FilterPanel 
        onFilterChange={handleFilterChange} 
        onReset={handleResetFilters}
      />

      <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
        Properties ({Object.keys(reviewsByListing).length})
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {Object.entries(reviewsByListing).map(([listingName, listingReviews]) => {
            const avgRating = listingReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / listingReviews.length;
            const approvedCount = listingReviews.filter(r => r.approved).length;

            return (
              <Grid item xs={12} md={6} lg={4} key={listingName}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {listingName}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Chip 
                        icon={<RateReview />}
                        label={`${listingReviews.length} reviews`} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        icon={<Star />}
                        label={avgRating.toFixed(1)} 
                        size="small" 
                        color="warning"
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Approved:
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {approvedCount} / {listingReviews.length}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        On Website:
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {listingReviews.filter(r => r.displayOnWebsite).length}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions>
                    <Button 
                      fullWidth
                      variant="contained"
                      endIcon={<ArrowForward />}
                      onClick={() => navigate(`/property/${encodeURIComponent(listingName)}`)}
                    >
                      Manage Reviews
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {!loading && Object.keys(reviewsByListing).length === 0 && (
        <Alert severity="info">
          No properties found. Try adjusting your filters.
        </Alert>
      )}
    </Box>
  );
}

export default Dashboard;

