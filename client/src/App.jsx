import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReviewProvider } from './contexts/ReviewContext';
import theme from './theme';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import PropertyDetail from './pages/PropertyDetail';
import PublicPropertyPage from './pages/PublicPropertyPage';
import Analytics from './pages/Analytics';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ReviewProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="property/:listingName" element={<PropertyDetail />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
            <Route path="/property-public/:listingName" element={<PublicPropertyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ReviewProvider>
    </ThemeProvider>
  );
}

export default App;
