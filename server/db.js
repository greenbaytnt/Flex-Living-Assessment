const mongoose = require('mongoose');
const config = require('./config');
const ReviewSelection = require('./models/ReviewSelection');

let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const mongoUri = config.database.mongoUri;
    
    if (!mongoUri || mongoUri.includes('localhost')) {
      throw new Error('MongoDB Atlas URI not configured. Please set MONGODB_URI in your .env file.');
    }
    
    console.log('Connecting to MongoDB Atlas...');
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority'
    });

    isConnected = true;
    console.log('Connected to MongoDB Atlas successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    isConnected = false;
    throw error;
  }
}

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
  isConnected = false;
});

process.on('SIGINT', async () => {
  if (isConnected) {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
});

const reviewSelectionDb = {
  async findByReviewId(reviewId, source) {
    await connectDB();
    try {
      const result = await ReviewSelection.findOne({ review_id: reviewId, source }).lean();

      if (result) {
        return {
          ...result,
          id: result._id.toString(),
          approved: result.approved ? 1 : 0,
          display_on_website: result.display_on_website ? 1 : 0
        };
      }
      return null;
    } catch (error) {
      console.error('Error finding review selection:', error);
      throw error;
    }
  },

  async findAll(filters = {}) {
    await connectDB();
    try {
      const query = {};

      if (filters.approved !== undefined) {
        query.approved = Boolean(filters.approved);
      }

      if (filters.display_on_website !== undefined) {
        query.display_on_website = Boolean(filters.display_on_website);
      }

      if (filters.source) {
        query.source = filters.source;
      }

      const results = await ReviewSelection.find(query)
        .sort({ updated_at: -1 })
        .lean();

      return results.map(result => ({
        ...result,
        id: result._id.toString(),
        approved: result.approved ? 1 : 0,
        display_on_website: result.display_on_website ? 1 : 0
      }));
    } catch (error) {
      console.error('Error finding all review selections:', error);
      return [];
    }
  },

  async upsert(data) {
    await connectDB();
    try {
      const existing = await ReviewSelection.findOne({
        review_id: data.review_id,
        source: data.source
      });

      const updateData = {};
      if (data.approved !== undefined) updateData.approved = Boolean(data.approved);
      if (data.display_on_website !== undefined) updateData.display_on_website = Boolean(data.display_on_website);
      if (data.notes !== undefined) updateData.notes = data.notes || null;
      if (data.listing_id !== undefined) updateData.listing_id = data.listing_id || null;
      if (data.listing_name !== undefined) updateData.listing_name = data.listing_name || null;

      if (existing) {
        Object.assign(existing, updateData);
        await existing.save();
        
        return {
          ...existing.toObject(),
          id: existing._id.toString(),
          approved: existing.approved ? 1 : 0,
          display_on_website: existing.display_on_website ? 1 : 0
        };
      } else {
        const newSelection = new ReviewSelection({
          review_id: data.review_id,
          source: data.source,
          listing_id: data.listing_id || null,
          listing_name: data.listing_name || null,
          approved: data.approved !== undefined ? Boolean(data.approved) : false,
          display_on_website: data.display_on_website !== undefined ? Boolean(data.display_on_website) : false,
          notes: data.notes || null
        });

        const saved = await newSelection.save();
        
        return {
          ...saved.toObject(),
          id: saved._id.toString(),
          approved: saved.approved ? 1 : 0,
          display_on_website: saved.display_on_website ? 1 : 0
        };
      }
    } catch (error) {
      console.error('Error upserting review selection:', error);
      throw error;
    }
  },

  async delete(reviewId, source) {
    await connectDB();
    try {
      const result = await ReviewSelection.deleteOne({
        review_id: reviewId,
        source: source
      });

      return { changes: result.deletedCount };
    } catch (error) {
      console.error('Error deleting review selection:', error);
      throw error;
    }
  }
};

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  connectDB().catch(err => {
    console.error('Failed to connect to MongoDB on startup:', err);
  });
}

module.exports = { connectDB, reviewSelectionDb };
