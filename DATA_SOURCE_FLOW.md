# Review Data Source Flow

## Overview

The Flex Living Reviews Dashboard implements a **priority-based cascade system** for fetching review data from multiple sources with automatic fallback.

---

## Data Source Priority

```
┌─────────────────────────────────────────────────┐
│  1️⃣  Google Places API (First Priority)        │
│  ✓ Up to 5 reviews per property               │
│  ✓ Real-time Google reviews                   │
│  ⚠️  Requires API key & Place ID mapping        │
└────────────────┬────────────────────────────────┘
                 │
                 ↓ (if not configured OR returns empty)
┌─────────────────────────────────────────────────┐
│  2️⃣  Hostaway API (Second Priority)            │
│  ✓ Complete review history                     │
│  ✓ Category ratings & detailed data           │
│  ⚠️  May be empty in sandbox                    │
└────────────────┬────────────────────────────────┘
                 │
                 ↓ (if API fails OR returns empty)
┌─────────────────────────────────────────────────┐
│  3️⃣  Mock JSON Data (Final Fallback)           │
│  ✓ Always available                            │
│  ✓ Consistent demo data                        │
│  ℹ️  From mock-hostaway-reviews.json            │
└─────────────────────────────────────────────────┘
```

## Summary

The cascade system ensures **robust, reliable review data** while prioritizing the most comprehensive sources:

1. **Google Places** - Real customer reviews, limited to 5 per property
2. **Hostaway** - Complete review history with category ratings
3. **Mock Data** - Always-available fallback for testing/demo

This architecture provides the **best user experience** regardless of which APIs are configured or available.

---

**Last Updated:** November 19, 2025  
**Version:** 1.0

