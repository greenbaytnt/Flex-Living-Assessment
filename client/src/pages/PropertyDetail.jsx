import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  Link
} from '@mui/material';
import {
  ArrowBack,
  Star,
  RateReview,
  Visibility,
  OpenInNew
} from '@mui/icons-material';
import { useReviews } from '../contexts/ReviewContext';
import ReviewCard from '../components/ReviewCard';

function PropertyDetail() {
  const { listingName } = useParams();
  const navigate = useNavigate();
  const { reviews, loading, error, fetchReviews, updateReviewSelection } = useReviews();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchReviews({ listingName: decodeURIComponent(listingName) });
  }, [listingName]);

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
    } catch (err) {
      console.error('Error in handleApprove:', err);
    }
  };

  const handleToggleWebsite = async (reviewId, source, displayOnWebsite) => {
    try {
      await updateReviewSelection(reviewId, source, { displayOnWebsite });
    } catch (err) {
      console.error('Error toggling website display:', err);
    }
  };

  const propertyReviews = reviews.filter(
    r => r.listingName === decodeURIComponent(listingName)
  );

  const approvedReviews = propertyReviews.filter(r => r.approved);
  const websiteReviews = propertyReviews.filter(r => r.displayOnWebsite);
  const pendingReviews = propertyReviews.filter(r => !r.approved);

  const avgRating = propertyReviews.length > 0
    ? propertyReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / propertyReviews.length
    : 0;

  const getReviewsToShow = () => {
    switch (tabValue) {
      case 0: return propertyReviews;
      case 1: return approvedReviews;
      case 2: return websiteReviews;
      case 3: return pendingReviews;
      default: return propertyReviews;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate('/', { state: { refresh: true } })}
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            {decodeURIComponent(listingName)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip 
              icon={<Star />}
              label={`${avgRating.toFixed(1)} Average Rating`} 
              color="warning"
            />
            <Chip 
              icon={<RateReview />}
              label={`${propertyReviews.length} Total Reviews`} 
              color="primary"
              variant="outlined"
            />
            <Chip 
              icon={<Visibility />}
              label={`${websiteReviews.length} On Website`} 
              color="success"
              variant="outlined"
            />
          </Box>
        </Box>

        <Button
          variant="outlined"
          startIcon={<OpenInNew />}
          onClick={() => window.open(`/property-public/${encodeURIComponent(listingName)}`, '_blank')}
        >
          View Public Page
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Reviews
              </Typography>
              <Typography variant="h4">
                {propertyReviews.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Approved
              </Typography>
              <Typography variant="h4" color="success.main">
                {approvedReviews.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                On Website
              </Typography>
              <Typography variant="h4" color="primary.main">
                {websiteReviews.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {pendingReviews.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`All (${propertyReviews.length})`} />
          <Tab label={`Approved (${approvedReviews.length})`} />
          <Tab label={`On Website (${websiteReviews.length})`} />
          <Tab label={`Pending (${pendingReviews.length})`} />
        </Tabs>
      </Box>

      <Box>
        {getReviewsToShow().map(review => (
          <ReviewCard
            key={`${review.source}-${review.id}`}
            review={review}
            onApprove={handleApprove}
            onToggleWebsite={handleToggleWebsite}
            showActions={true}
          />
        ))}

        {getReviewsToShow().length === 0 && (
          <Alert severity="info">
            No reviews in this category.
          </Alert>
        )}
      </Box>
    </Box>
  );
}

export default PropertyDetail;

