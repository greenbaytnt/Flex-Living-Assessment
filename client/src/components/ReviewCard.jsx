import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Rating,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Stack
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  VisibilityOff,
  CalendarToday,
  HourglassEmpty,
  CheckCircleOutline
} from '@mui/icons-material';
import { format } from 'date-fns';

function ReviewCard({ review, onApprove, onToggleWebsite, showActions = true }) {
  const formattedDate = format(new Date(review.date), 'MMM dd, yyyy');

  const getRatingColor = (rating) => {
    if (!rating) return 'default';
    if (rating >= 4.5) return 'success';
    if (rating >= 3.5) return 'warning';
    return 'error';
  };

  return (
    <Card 
      sx={{ 
        mb: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" component="div">
                {review.guestName}
              </Typography>
              {review.approved && (
                <Chip 
                  label="Approved" 
                  color="success" 
                  size="small" 
                  icon={<CheckCircle />}
                />
              )}
              {review.displayOnWebsite && (
                <Chip 
                  label="On Website" 
                  color="primary" 
                  size="small" 
                  icon={<Visibility />}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              {review.rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Rating value={review.rating} precision={0.5} size="small" readOnly />
                  <Typography variant="body2" color="text.secondary">
                    ({review.rating.toFixed(1)})
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {formattedDate}
                </Typography>
              </Box>

              <Chip 
                label={review.channel || review.source} 
                size="small" 
                variant="outlined"
              />
            </Box>

            {review.listingName && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Property: {review.listingName}
              </Typography>
            )}
          </Box>

          {showActions && (
            <Stack spacing={1.5} sx={{ minWidth: 180 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: review.approved ? 'success.50' : 'grey.100',
                  border: 1,
                  borderColor: review.approved ? 'success.200' : 'grey.300',
                  transition: 'all 0.3s ease'
                }}
              >
                {review.approved ? (
                  <CheckCircleOutline sx={{ color: 'success.main', fontSize: 20 }} />
                ) : (
                  <HourglassEmpty sx={{ color: 'warning.main', fontSize: 20 }} />
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', lineHeight: 1 }}>
                    {review.approved ? 'Approved' : 'Pending'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
                    Click to toggle
                  </Typography>
                </Box>
                <Switch
                  checked={Boolean(review.approved)}
                  onChange={(event, checked) => {
                    if (onApprove) {
                      onApprove(review.id, review.source, checked);
                    } else {
                      console.error('onApprove is undefined');
                    }
                  }}
                  color="success"
                  size="small"
                  inputProps={{ 'aria-label': 'Approve review toggle' }}
                />
              </Box>

              {/* Website Visibility Toggle */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: review.displayOnWebsite ? 'primary.50' : 'grey.100',
                  border: 1,
                  borderColor: review.displayOnWebsite ? 'primary.200' : 'grey.300',
                  opacity: !review.approved ? 0.5 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {review.displayOnWebsite ? (
                  <Visibility sx={{ color: 'primary.main', fontSize: 20 }} />
                ) : (
                  <VisibilityOff sx={{ color: 'text.secondary', fontSize: 20 }} />
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', lineHeight: 1 }}>
                    {review.displayOnWebsite ? 'On Website' : 'Hidden'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
                    {!review.approved ? 'Approve first' : 'Public visibility'}
                  </Typography>
                </Box>
                <Switch
                  checked={Boolean(review.displayOnWebsite)}
                  onChange={(event, checked) => {
                    if (onToggleWebsite) {
                      onToggleWebsite(review.id, review.source, checked);
                    } else {
                      console.error('onToggleWebsite is undefined');
                    }
                  }}
                  disabled={!review.approved}
                  color="primary"
                  size="small"
                  inputProps={{ 'aria-label': 'Website visibility toggle' }}
                />
              </Box>
            </Stack>
          )}
        </Box>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {review.text}
        </Typography>

        {review.categories && review.categories.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {review.categories.map((cat, idx) => (
              <Chip
                key={idx}
                label={`${cat.category}: ${cat.rating}/10`}
                size="small"
                variant="outlined"
                color={cat.rating >= 8 ? 'success' : cat.rating >= 6 ? 'warning' : 'error'}
              />
            ))}
          </Box>
        )}

        {review.notes && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Notes: {review.notes}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default ReviewCard;
