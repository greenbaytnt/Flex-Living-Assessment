require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  hostaway: {
    clientId: process.env.HOSTAWAY_CLIENT_ID,
    clientSecret: process.env.HOSTAWAY_CLIENT_SECRET,
    baseUrl: process.env.HOSTAWAY_API_BASE_URL || 'https://api.hostaway.com/v1'
  },
  
  google: {
    apiKey: process.env.GOOGLE_PLACES_API_KEY,
    placeIds: {
    }
  },
  
  database: {
    mongoUri: process.env.MONGODB_URI || '',
  }
};

