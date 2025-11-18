# Flex Living - Reviews Dashboard

A simple reviews management system for Flex Living properties that integrates with Hostaway API and optionally Google Places API & mockup data.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Key Design Decisions](#key-design-decisions)
- [Google Reviews Integration](#google-reviews-integration)
- [Development](#development)

---

## ✨ Features

### Manager Dashboard
- **Property Performance Overview** - View all properties with review counts, ratings, and approval status
- **Advanced Filtering** - Filter reviews by property, rating, category, channel, and date
- **Review Management** - Approve/unapprove reviews and control website display
- **Analytics Dashboard** - Visual charts and statistics showing trends and performance
- **Per-Property Detailed View** - Manage individual property reviews with tabs for all/approved/pending

### Public Property Pages
- **Public-Facing Review Display** - Beautiful, responsive property pages showing approved reviews
- **Guest Reviews Section** - Only displays reviews approved by managers
- **Verified Review Badges** - Shows review source (Hostaway, Google) with verified badges
- **Modern UI** - Clean, professional design consistent with Flex Living brand

### API Integration
- **Hostaway API Integration** - Fetches real reviews from Hostaway with OAuth2 authentication
- **Mock Data Fallback** - Uses provided JSON mock data if API is unavailable
- **Review Normalization** - Transforms reviews into consistent internal format
- **Google Places Support** - Optional integration for Google Reviews (see documentation)

---

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Material-UI (MUI)** - Component library for consistent, professional design
- **Recharts** - Data visualization for analytics charts
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **date-fns** - Date formatting and manipulation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - Lightweight database for review selections
- **Axios** - HTTP client for external API calls
- **Helmet** - Security middleware
- **Morgan** - HTTP request logging
- **Express Rate Limit** - API rate limiting

### APIs
- **Hostaway API** - Primary review source
- **Google Places API** - Optional secondary review source

---

## 📁 Project Structure

```
flex-living/
├── client/                          # Frontend application
│   ├── src/
│   │   ├── api/                    # API integration layer
│   │   │   ├── axiosInstance.js   # Configured Axios client
│   │   │   └── reviewsApi.js      # Review API functions
│   │   ├── components/            # Reusable UI components
│   │   │   ├── FilterPanel.jsx   # Review filtering component
│   │   │   ├── ReviewCard.jsx    # Individual review display
│   │   │   └── StatsCard.jsx     # Statistics card component
│   │   ├── contexts/              # React Context providers
│   │   │   └── ReviewContext.jsx # Global review state management
│   │   ├── layouts/               # Layout components
│   │   │   └── MainLayout.jsx    # Main app layout with navigation
│   │   ├── pages/                 # Page components
│   │   │   ├── Dashboard.jsx     # Main manager dashboard
│   │   │   ├── PropertyDetail.jsx # Property-specific review management
│   │   │   ├── Analytics.jsx     # Analytics and charts
│   │   │   └── PublicPropertyPage.jsx # Public review display
│   │   ├── App.jsx                # Root component with routing
│   │   ├── main.jsx               # Application entry point
│   │   ├── theme.js               # MUI theme configuration
│   │   └── styles.css             # Global styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js             # Vite build configuration
│
├── server/                         # Backend application
│   ├── config/
│   │   └── index.js               # Configuration management
│   ├── controllers/
│   │   └── reviewsController.js  # Request handlers
│   ├── data/
│   │   └── mock-hostaway-reviews.json # Mock review data
│   ├
│   ├── middleware/
│   │   └── errorHandler.js       # Error handling middleware
│   ├── routes/
│   │   └── reviews.js            # API route definitions
│   ├── services/
│   │   ├── hostawayService.js   # Hostaway API integration
│   │   └── googlePlacesService.js # Google Places API integration
│   ├── db.js                      # Database initialization
│   ├── server.js                  # Express app setup
│   ├── package.json
│   └── .env.example              # Environment variables template
│
├── GOOGLE_REVIEWS_FINDINGS.md    # Google Reviews integration documentation
└── README.md                     # This file
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** 18+ and npm
- **Git**
- **Hostaway API credentials** (provided in assessment)
- **Google Places API key** (optional, for Google Reviews)

### 1. Clone Repository

```bash
git clone <repository-url>
cd flex-living
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=4000
NODE_ENV=development

# Hostaway API (provided in assessment)
HOSTAWAY_CLIENT_ID=61148
HOSTAWAY_CLIENT_SECRET=f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152
HOSTAWAY_API_BASE_URL=https://api.hostaway.com/v1

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://flexuser:fJ9dSXgCk3WUcAof@cluster0.bxa5k95.mongodb.net/flexdb?retryWrites=true&w=majority

# Google Places API (optional)
# GOOGLE_PLACES_API_KEY=AIzaSyBjbb80SR6u0gJTEoBBZIT3ipiSbRD1FAw

```

Start the backend server:

```bash
npm start
```

Backend will run at `http://localhost:4000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Frontend will run at `http://localhost:5173`

### 4. Access the Application

- **Manager Dashboard:** http://localhost:5173
- **Analytics:** http://localhost:5173/analytics
- **Property Detail:** http://localhost:5173/property/:listingName
- **Public Property Page:** http://localhost:5173/property-public/:listingName

---

## 📡 API Endpoints

### Review Endpoints

#### `GET /api/reviews/hostaway`
Fetch all reviews from Hostaway with filtering and sorting.

**Query Parameters:**
- `listingName` - Filter by property name
- `minRating` - Minimum rating (0-5)
- `maxRating` - Maximum rating (0-5)
- `category` - Filter by review category
- `channel` - Filter by channel (e.g., "Hostaway")
- `sortBy` - Sort field: `date`, `rating`, `guestName`, `listingName`
- `sortOrder` - Sort direction: `asc`, `desc`

**Response:**
```json
{
  "status": "success",
  "count": 42,
  "dataSource": "google",
  "reviews": [
    {
      "id": 7453,
      "type": "guest-to-host",
      "status": "published",
      "text": "Shane and family are wonderful!",
      "rating": 4.5,
      "categories": [...],
      "date": "2020-08-21T22:45:14.000Z",
      "guestName": "Shane Finkelstein",
      "listingName": "2B N1 A - 29 Shoreditch Heights",
      "channel": "Google",
      "source": "google",
      "approved": true,
      "displayOnWebsite": true
    }
  ]
}
```

**Note:** The `dataSource` field indicates which source provided the data: `"google"`, `"hostaway"`, or `"mock"`.

#### `GET /api/reviews/approved`
Fetch only reviews approved for website display.

**Query Parameters:**
- `listingName` - Filter by property name
- `source` - Filter by source (hostaway, google)

**Response:** Same format as `/hostaway`

#### `GET /api/reviews/analytics`
Get analytics and statistics for all reviews.

**Response:**
```json
{
  "status": "success",
  "analytics": {
    "totalReviews": 42,
    "averageRating": "4.35",
    "recentReviewsCount": 12,
    "listingStats": [...],
    "ratingDistribution": [...]
  }
}
```

#### `POST /api/reviews/selection`
Update review approval and website display status.

**Request Body:**
```json
{
  "reviewId": 7453,
  "source": "hostaway",
  "listingName": "Property Name",
  "approved": true,
  "displayOnWebsite": true,
  "notes": "Optional notes"
}
```

---

## 🎨 Key Design Decisions

### 1. Multi-Source Review Cascade

**Problem:** Need reliable review data from multiple sources with automatic fallback.

**Solution:** Implemented a priority-based cascade system:

```
1st Priority: Google Places API (if configured with Place IDs)
     ↓ (if empty/failed)
2nd Priority: Hostaway API  
     ↓ (if empty/failed)
3rd Priority: Mock JSON Data (always available)
```

This ensures the dashboard always has data while prioritizing the most comprehensive source available.

### 2. Review Normalization

**Problem:** Google and Hostaway APIs return different data structures.

**Solution:** Created a normalization layer that transforms all reviews into a consistent internal format:

```javascript
{
  id, type, status, text, rating, categories, date,
  guestName, listingName, listingId, channel, source
}
```

This allows the frontend to work with any review source without modification.

### 3. Two-Level Approval System

**Problem:** Managers need flexibility in review management.

**Solution:** Implemented two separate flags:
- `approved` - Manager has reviewed and approved the review
- `displayOnWebsite` - Review should appear on public pages

This allows managers to approve reviews internally while controlling public visibility separately.

### 4. Separation of Manager and Public Views

**Problem:** Different audiences need different interfaces.

**Solution:** 
- Manager views: Full CRUD, filtering, analytics (requires authentication in production)
- Public views: Read-only, approved reviews only, focused on guest experience

### 5. Mock Data Fallback

**Problem:** Hostaway sandbox API may have no reviews.

**Solution:** Service automatically falls back to mock data if:
- API credentials are missing
- API returns empty results
- API request fails

This ensures the dashboard always has data for demonstration and testing.

### 6. Caching Strategy

**Problem:** Excessive API calls increase costs and latency.

**Solution:**
- Frontend: ReviewContext caches reviews with cache invalidation on updates
- Analytics: 5-minute cache for expensive analytics calculations
- Future: Can add Redis/backend caching for production

### 7. Material-UI Theme Customization

**Problem:** Need professional, consistent design.

**Solution:** Created custom MUI theme with:
- Flex Living brand colors
- Consistent spacing and typography
- Responsive breakpoints
- Custom component styling

---

## 🌐 Google Reviews Integration

### Status: **Implemented with Optional Configuration**

Google Reviews integration is **fully implemented** but requires API key setup. See detailed documentation: **[GOOGLE_REVIEWS_FINDINGS.md](./GOOGLE_REVIEWS_FINDINGS.md)**

### Quick Summary

**✅ What Works:**
- Full service implementation (`googlePlacesService.js`)
- Review fetching and normalization
- Multi-place support
- Error handling and graceful degradation

**⚠️ Requires Setup:**
- Google Cloud Platform account
- Places API enabled with API key ($200/month free credit)
- Place ID mapping for each property

**📊 Limitations:**
- Maximum 5 reviews per property
- No category ratings from Google
- Read-only access
- Costs apply after free tier

### To Enable Google Reviews:

1. Follow setup instructions in `GOOGLE_REVIEWS_FINDINGS.md`
2. Add API key to `.env`:
   ```
   GOOGLE_PLACES_API_KEY=your_key_here
   ```
3. Map Place IDs in `server/config/index.js`
4. Reviews will automatically appear in dashboard

---

## 💻 Development

### Running in Development Mode

**Backend:**
```bash
cd server
npm run dev  # Uses nodemon for auto-reload
```

**Frontend:**
```bash
cd client
npm run dev  # Vite dev server with HMR
```

### Building for Production

**Frontend:**
```bash
cd client
npm run build  # Creates optimized production build in dist/
npm run preview  # Preview production build
```

**Backend:**
```bash
cd server
NODE_ENV=production npm start
```

### Testing API Endpoints

```bash
# Get all reviews
curl http://localhost:4000/api/reviews/hostaway

# Get approved reviews
curl http://localhost:4000/api/reviews/approved

# Get analytics
curl http://localhost:4000/api/reviews/analytics

# Update review selection
curl -X POST http://localhost:4000/api/reviews/selection \
  -H "Content-Type: application/json" \
  -d '{"reviewId":7453,"source":"hostaway","approved":true,"displayOnWebsite":true}'
```

---

## 📝 API Behaviors

### Hostaway Integration

1. **Authentication:** Uses OAuth2 client credentials flow
2. **Token Management:** Automatically refreshes tokens before expiry
3. **Fallback:** Uses mock data if API unavailable/empty
4. **Rate Limiting:** Backend implements rate limiting (100 req/15min)

### Review Normalization

- **Overall Rating Calculation:** 
  - Uses `rating` field if present
  - If null, calculates average from `reviewCategory` ratings (converts 0-10 scale to 0-5)
  - Returns `null` if no rating data available

- **Date Parsing:**
  - Converts Hostaway format (`YYYY-MM-DD HH:MM:SS`) to ISO 8601
  - Handles invalid dates gracefully with current date fallback

### Database Operations

- **SQLite for Review Selections:** Stores manager decisions (approved, displayOnWebsite)
- **Upsert Logic:** Creates or updates based on (review_id + source) composite key
- **Join Strategy:** Reviews fetched from API, selections from DB, merged in controller

---

## 🔐 Security Considerations

### Implemented
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Rate limiting on API routes
- ✅ Environment variable configuration
- ✅ API key restrictions (Google)

### Production Recommendations
- 🔒 Add authentication/authorization (JWT, OAuth)
- 🔒 Implement role-based access control
- 🔒 Use HTTPS only
- 🔒 Add request validation (Joi, express-validator)
- 🔒 Implement audit logging
- 🔒 Set up monitoring and alerting

---

## 🐛 Troubleshooting

### Backend Issues

**"Cannot find module" errors:**
```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

**Database errors:**
```bash
# Delete and recreate database
rm server/database/reviews.db
# Database will be recreated on next server start
```

**Hostaway API errors:**
- Verify credentials in `.env`
- Check API key validity
- Review Hostaway API status

### Frontend Issues

**"Failed to fetch" errors:**
- Ensure backend is running on port 4000
- Check CORS configuration
- Verify API endpoint URLs in `axiosInstance.js`

**Build errors:**
```bash
cd client
rm -rf node_modules package-lock.json dist
npm install
npm run build
```


**Assessment Completed:** November 19, 2025  
**Version:** 1.0.0

