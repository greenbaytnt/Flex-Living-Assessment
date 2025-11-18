import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Rating,
  Avatar,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Star,
  CalendarToday,
  LocationOn,
  Verified
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getApprovedReviews } from '../api/reviewsApi';

function PublicPropertyPage() {
  const { listingName } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReviews();
  }, [listingName]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getApprovedReviews({ 
        listingName: decodeURIComponent(listingName) 
      });
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (parseFloat(r.rating) || 0), 0) / reviews.length
    : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 6 }}>
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 8,
          mb: 6,
          background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
            {decodeURIComponent(listingName)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Star sx={{ color: '#fbbf24' }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {avgRating.toFixed(1)}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              ({reviews.length} reviews)
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 6, borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                  About This Property
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Welcome to {decodeURIComponent(listingName)}, a premium Flex Living property designed for modern living. 
                  Our properties combine comfort, style, and convenience to provide the perfect home away from home.
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Chip 
                    icon={<LocationOn />}
                    label="Prime Location" 
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip 
                    icon={<Verified />}
                    label="Verified Property" 
                    color="primary"
                    sx={{ mr: 1, mb: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box 
                  sx={{ 
                    bgcolor: 'primary.50', 
                    p: 3, 
                    borderRadius: 2,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Guest Rating
                  </Typography>
                  <Rating 
                    value={avgRating} 
                    precision={0.1} 
                    size="large" 
                    readOnly 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                    {avgRating.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Based on {reviews.length} verified reviews
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
          Guest Reviews
        </Typography>

        {reviews.length === 0 ? (
          <Alert severity="info">
            No reviews have been published yet for this property.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {reviews.map((review, index) => (
              <Grid item xs={12} key={index}>
                <Card 
                  sx={{ 
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 56, 
                          height: 56, 
                          bgcolor: 'primary.main',
                          fontSize: '1.5rem',
                          fontWeight: 600
                        }}
                      >
                        {((review.guestName || 'G')[0] || 'G').toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {review.guestName || 'Anonymous Guest'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                          <Rating value={parseFloat(review.rating) || 0} size="small" readOnly />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(review.date || review.created_at || Date.now()), 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.primary' }}>
                      {review.text || review.notes || 'Wonderful stay! Highly recommended.'}
                    </Typography>

                    {(review.source || review.channel) && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Chip 
                          label={`Verified ${review.channel || review.source} Review`} 
                          size="small" 
                          color="success"
                          icon={<Verified />}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ mt: 8, py: 4, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            © 2024 Flex Living. All reviews are from verified guests.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default PublicPropertyPage;

