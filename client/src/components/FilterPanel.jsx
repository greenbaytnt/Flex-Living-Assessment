import React, { useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Grid,
  Slider,
  Typography
} from '@mui/material';
import { Search, FilterList, Clear } from '@mui/icons-material';

function FilterPanel({ onFilterChange, onReset }) {
  const [filters, setFilters] = useState({
    listingName: '',
    minRating: 0,
    maxRating: 5,
    sortBy: 'date',
    sortOrder: 'desc',
    category: '',
    channel: ''
  });

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      listingName: '',
      minRating: 0,
      maxRating: 5,
      sortBy: 'date',
      sortOrder: 'desc',
      category: '',
      channel: ''
    };
    setFilters(resetFilters);
    onReset();
  };

  const handleRatingChange = (event, newValue) => {
    setFilters({
      ...filters,
      minRating: newValue[0],
      maxRating: newValue[1]
    });
  };

  const handleRatingChangeCommitted = (event, newValue) => {
    onFilterChange({
      ...filters,
      minRating: newValue[0],
      maxRating: newValue[1]
    });
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterList sx={{ mr: 1 }} />
        <Typography variant="h6">Filters</Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Search Property"
            variant="outlined"
            value={filters.listingName}
            onChange={(e) => handleChange('listingName', e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Grid>

        <Grid item xs={6} sm={3} md={1.5}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sortBy}
              label="Sort By"
              onChange={(e) => handleChange('sortBy', e.target.value)}
            >
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="rating">Rating</MenuItem>
              <MenuItem value="guestName">Guest Name</MenuItem>
              <MenuItem value="listingName">Property Name</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} sm={3} md={1.5}>
          <FormControl fullWidth>
            <InputLabel>Order</InputLabel>
            <Select
              value={filters.sortOrder}
              label="Order"
              onChange={(e) => handleChange('sortOrder', e.target.value)}
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} sm={4} md={2}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              label="Category"
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="cleanliness">Cleanliness</MenuItem>
              <MenuItem value="communication">Communication</MenuItem>
              <MenuItem value="value">Value</MenuItem>
              <MenuItem value="respect_house_rules">House Rules</MenuItem>
              <MenuItem value="location">Location</MenuItem>
              <MenuItem value="accuracy">Accuracy</MenuItem>
              <MenuItem value="check_in">Check-in</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} sm={4} md={2}>
          <FormControl fullWidth>
            <InputLabel>Channel</InputLabel>
            <Select
              value={filters.channel}
              label="Channel"
              onChange={(e) => handleChange('channel', e.target.value)}
            >
              <MenuItem value="">All Channels</MenuItem>
              <MenuItem value="Hostaway">Hostaway</MenuItem>
              <MenuItem value="Airbnb">Airbnb</MenuItem>
              <MenuItem value="Booking.com">Booking.com</MenuItem>
              <MenuItem value="Google">Google</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Clear />}
            onClick={handleReset}
            sx={{ height: '56px' }}
          >
            Reset
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography gutterBottom>
            Rating Range: {filters.minRating} - {filters.maxRating}
          </Typography>
          <Slider
            value={[filters.minRating, filters.maxRating]}
            onChange={handleRatingChange}
            onChangeCommitted={handleRatingChangeCommitted}
            valueLabelDisplay="auto"
            min={0}
            max={5}
            step={0.5}
            marks={[
              { value: 0, label: '0' },
              { value: 1, label: '1' },
              { value: 2, label: '2' },
              { value: 3, label: '3' },
              { value: 4, label: '4' },
              { value: 5, label: '5' },
            ]}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default FilterPanel;

