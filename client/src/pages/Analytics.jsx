import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { getAnalytics } from '../api/reviewsApi';

const COLORS = ['#0369a1', '#16a34a', '#f59e0b', '#dc2626', '#8b5cf6'];

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getAnalytics();
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load analytics: {error}
      </Alert>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
        Analytics Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Reviews
              </Typography>
              <Typography variant="h3" color="primary">
                {analytics.totalReviews}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average Rating
              </Typography>
              <Typography variant="h3" color="warning.main">
                {analytics.averageRating}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Recent (7 days)
              </Typography>
              <Typography variant="h3" color="success.main">
                {analytics.recentReviewsCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Rating Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" label={{ value: 'Stars', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0369a1" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Property Ratings
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.listingStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="listingName" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="averageRating" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Count by Property
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.listingStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="listingName" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="reviewCount" fill="#0369a1" name="Number of Reviews" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Property Statistics
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Property Name</th>
                    <th style={{ textAlign: 'center', padding: '12px' }}>Review Count</th>
                    <th style={{ textAlign: 'center', padding: '12px' }}>Average Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.listingStats.map((stat, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px' }}>{stat.listingName}</td>
                      <td style={{ textAlign: 'center', padding: '12px' }}>{stat.reviewCount}</td>
                      <td style={{ textAlign: 'center', padding: '12px', fontWeight: 600, color: '#f59e0b' }}>
                        {stat.averageRating} ⭐
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Analytics;

