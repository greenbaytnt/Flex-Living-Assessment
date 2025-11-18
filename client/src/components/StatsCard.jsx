import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

function StatsCard({ title, value, icon: Icon, color = 'primary' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          {Icon && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: `${color}.50`,
                color: `${color}.main`,
              }}
            >
              <Icon sx={{ fontSize: 32 }} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default StatsCard;

