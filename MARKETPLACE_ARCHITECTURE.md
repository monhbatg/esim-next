# Marketplace Page Architecture & Improvement Ideas

## Current Implementation

### Architecture Overview

The marketplace page follows a **client-side filtering** approach:

```
Frontend (React) → Next.js API Route → Backend API → Database
```

### Data Flow

1. **Initial Load:**
   - Frontend calls `/api/marketplace` (Next.js API route)
   - Next.js route proxies to `${NEXT_PUBLIC_API_URL}/marketplace`
   - Backend returns all categories with their countries
   - Frontend stores entire dataset in state (`marketplaceData`)

2. **Filtering & Search:**
   - All filtering happens **client-side** using `useMemo`
   - Filters applied: Category, Region, Search Query
   - No additional API calls after initial load

### Current Backend API

**Endpoint:** `GET /marketplace`

**Response Structure:**
```json
[
  {
    "name_en": "Top Destinations",
    "name_mn": "Шилдэг чиглэлүүд",
    "description_en": "...",
    "description_mn": "...",
    "countries": [
      {
        "name_en": "Thailand",
        "name_mn": "Тайланд",
        "image": "/img/flags/th.png",
        "region": {
          "name_en": "Asia",
          "name_mn": "Ази"
        }
      }
    ]
  }
]
```

### Current Limitations

1. **Client-Side Filtering:**
   - All data loaded upfront (can be slow with many countries)
   - No pagination support
   - No server-side search optimization
   - Filters work on already-loaded data

2. **No Real-Time Data:**
   - Data fetched once on mount
   - No refresh mechanism
   - No real-time price/availability updates

3. **Limited Search:**
   - Simple string matching on client-side
   - No fuzzy search
   - No search suggestions/autocomplete
   - No search history

4. **No Sorting:**
   - Countries displayed in API order
   - No price sorting
   - No popularity sorting
   - No alphabetical sorting

5. **Missing Features:**
   - No actual eSIM plan data (price, data, duration are hardcoded)
   - No country-specific plan details
   - No favorites/bookmarks
   - No comparison feature

---

## Improvement Ideas

### 1. Backend API Enhancements

#### A. Enhanced Marketplace Endpoint with Query Parameters

**New Endpoint:** `GET /marketplace?category_id=1&region_id=2&search=thailand&sort=price_asc&page=1&limit=20`

**Query Parameters:**
- `category_id` (optional) - Filter by category
- `region_id` (optional) - Filter by region
- `search` (optional) - Search countries by name
- `sort` (optional) - Sort options: `price_asc`, `price_desc`, `name_asc`, `popularity`
- `page` (optional) - Page number for pagination
- `limit` (optional) - Items per page (default: 20)
- `locale` (optional) - Language preference (`en`, `mn`, `zh`)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name_en": "Top Destinations",
      "name_mn": "Шилдэг чиглэлүүд",
      "countries": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "filters": {
    "availableCategories": [...],
    "availableRegions": [...]
  }
}
```

#### B. Search Endpoint

**Endpoint:** `GET /marketplace/search?q=thailand&limit=10`

**Response:**
```json
{
  "suggestions": [
    {
      "type": "country",
      "id": 5,
      "name_en": "Thailand",
      "name_mn": "Тайланд",
      "image": "/img/flags/th.png"
    },
    {
      "type": "category",
      "id": 1,
      "name_en": "Top Destinations",
      "name_mn": "Шилдэг чиглэлүүд"
    }
  ]
}
```

#### C. Country Details Endpoint

**Endpoint:** `GET /marketplace/countries/:id`

**Response:**
```json
{
  "id": 5,
  "name_en": "Thailand",
  "name_mn": "Тайланд",
  "image": "/img/flags/th.png",
  "region": {...},
  "plans": [
    {
      "id": 101,
      "data": "1GB",
      "duration": 7,
      "durationUnit": "days",
      "price": 9.99,
      "currency": "USD",
      "features": ["4G/5G", "No Contract", "Instant Activation"]
    }
  ],
  "popularity": 95,
  "isFavorite": false
}
```

---

### 2. Frontend Improvements

#### A. Server-Side Filtering

**Benefits:**
- Faster initial load (only load what's needed)
- Better performance with large datasets
- Reduced client-side memory usage
- Real-time data updates

**Implementation:**
```typescript
// Instead of loading all data, fetch filtered data
const fetchMarketplace = async (filters: MarketplaceFilters) => {
  const params = new URLSearchParams();
  if (filters.categoryId) params.append('category_id', filters.categoryId);
  if (filters.regionId) params.append('region_id', filters.regionId);
  if (filters.search) params.append('search', filters.search);
  if (filters.sort) params.append('sort', filters.sort);
  
  const response = await marketplaceApi.getMarketplace(params);
  return response;
};
```

#### B. Debounced Search with Suggestions

**Features:**
- Show search suggestions as user types
- Highlight matching text
- Search history
- Recent searches

**Implementation:**
```typescript
const [searchSuggestions, setSearchSuggestions] = useState([]);

useEffect(() => {
  if (searchQuery.length > 2) {
    const timer = setTimeout(async () => {
      const suggestions = await marketplaceApi.search(searchQuery);
      setSearchSuggestions(suggestions);
    }, 300);
    return () => clearTimeout(timer);
  }
}, [searchQuery]);
```

#### C. Pagination

**Features:**
- Load more button
- Infinite scroll
- Page numbers
- Items per page selector

**Implementation:**
```typescript
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const nextPage = page + 1;
  const data = await marketplaceApi.getMarketplace({ page: nextPage });
  setMarketplaceData([...marketplaceData, ...data.data]);
  setHasMore(data.pagination.page < data.pagination.totalPages);
};
```

#### D. Sorting Options

**Sort Options:**
- Price: Low to High / High to Low
- Name: A-Z / Z-A
- Popularity: Most Popular First
- Newest: Recently Added

**UI:**
```tsx
<select onChange={(e) => setSort(e.target.value)}>
  <option value="popularity">Most Popular</option>
  <option value="price_asc">Price: Low to High</option>
  <option value="price_desc">Price: High to Low</option>
  <option value="name_asc">Name: A-Z</option>
</select>
```

#### E. Advanced Filters

**Additional Filters:**
- Price Range (slider)
- Data Amount (1GB, 3GB, 5GB, 10GB+)
- Duration (7 days, 15 days, 30 days+)
- Network Speed (3G, 4G, 5G)
- Popularity (Most Popular, Trending)

**UI:**
```tsx
<div className="filters">
  <PriceRangeFilter min={0} max={100} />
  <DataFilter options={['1GB', '3GB', '5GB', '10GB+']} />
  <DurationFilter options={['7 days', '15 days', '30 days+']} />
</div>
```

#### F. Real Plan Data Integration

**Current Issue:** Plans are hardcoded with default values

**Solution:** Fetch actual plan data from backend

**Backend Response:**
```json
{
  "country": {...},
  "plans": [
    {
      "id": 101,
      "data": "1GB",
      "duration": "7 days",
      "price": 9.99,
      "currency": "USD",
      "features": [...],
      "available": true,
      "popularity": 85
    }
  ]
}
```

#### G. Favorites/Bookmarks

**Features:**
- Save favorite countries
- Quick access to favorites
- Filter by favorites

**Backend Endpoints:**
- `POST /users/me/favorites` - Add favorite
- `DELETE /users/me/favorites/:id` - Remove favorite
- `GET /users/me/favorites` - Get favorites

#### H. Comparison Feature

**Features:**
- Compare up to 3 countries/plans side-by-side
- Highlight differences
- Best value indicator

**UI:**
```tsx
<div className="comparison">
  <ComparisonCard country={country1} />
  <ComparisonCard country={country2} />
  <ComparisonCard country={country3} />
</div>
```

#### I. View Modes

**Options:**
- Grid View (current)
- List View (compact)
- Map View (geographic)

**Implementation:**
```tsx
const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');

{viewMode === 'grid' && <GridView countries={countries} />}
{viewMode === 'list' && <ListView countries={countries} />}
{viewMode === 'map' && <MapView countries={countries} />}
```

#### J. Caching & Performance

**Strategies:**
- Cache marketplace data (5-10 minutes)
- Use React Query or SWR for data fetching
- Implement optimistic updates
- Prefetch next page data

**Implementation:**
```typescript
import useSWR from 'swr';

const { data, error, mutate } = useSWR(
  `/api/marketplace?${params}`,
  marketplaceApi.getMarketplace,
  {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 600000 // 10 minutes
  }
);
```

---

### 3. Backend Database Improvements

#### A. Add Indexes

```sql
-- For faster searches
CREATE INDEX idx_country_name_en ON countries(name_en);
CREATE INDEX idx_country_name_mn ON countries(name_mn);
CREATE INDEX idx_country_region ON countries(region_id);

-- For faster category lookups
CREATE INDEX idx_category_countries ON category_countries(category_id, country_id);
```

#### B. Full-Text Search

**PostgreSQL Example:**
```sql
-- Add full-text search column
ALTER TABLE countries ADD COLUMN search_vector tsvector;

-- Create index
CREATE INDEX idx_country_search ON countries USING GIN(search_vector);

-- Update search vector
UPDATE countries SET search_vector = 
  to_tsvector('english', coalesce(name_en, '') || ' ' || coalesce(name_mn, ''));
```

#### C. Caching Layer

**Redis Cache:**
- Cache marketplace data for 5-10 minutes
- Cache search results for 1-2 minutes
- Invalidate cache on data updates

---

### 4. UX Improvements

#### A. Loading States

- Skeleton loaders for cards
- Progressive loading (show categories first, then countries)
- Optimistic UI updates

#### B. Empty States

- Better empty state messages
- Suggestions when no results
- "Clear filters" CTA

#### C. Error Handling

- Retry mechanism
- Error boundaries
- Fallback UI
- User-friendly error messages

#### D. Accessibility

- Keyboard navigation
- Screen reader support
- Focus management
- ARIA labels

#### E. Analytics

- Track search queries
- Track filter usage
- Track popular countries
- Track conversion rates

---

### 5. Recommended Implementation Priority

**Phase 1 (High Priority):**
1. ✅ Server-side filtering with query parameters
2. ✅ Pagination support
3. ✅ Real plan data integration
4. ✅ Sorting options

**Phase 2 (Medium Priority):**
5. Search suggestions/autocomplete
6. Advanced filters (price range, data, duration)
7. Favorites/bookmarks
8. Caching layer

**Phase 3 (Nice to Have):**
9. Comparison feature
10. View modes (list, map)
11. Full-text search
12. Analytics integration

---

### 6. Example Backend Implementation

#### Enhanced Marketplace Controller

```typescript
// GET /marketplace
async getMarketplace(req: Request, res: Response) {
  const {
    category_id,
    region_id,
    search,
    sort = 'popularity',
    page = 1,
    limit = 20,
    locale = 'en'
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build query
  let query = {};
  if (category_id) query.category_id = Number(category_id);
  if (region_id) query.region_id = Number(region_id);
  if (search) {
    query.$or = [
      { name_en: { $regex: search, $options: 'i' } },
      { name_mn: { $regex: search, $options: 'i' } }
    ];
  }

  // Get categories with countries
  const categories = await Category.find(query)
    .populate({
      path: 'countries',
      match: region_id ? { region_id: Number(region_id) } : {},
      options: {
        sort: getSortOption(sort),
        skip,
        limit: Number(limit)
      },
      populate: {
        path: 'region',
        select: `name_${locale}`
      }
    })
    .select(`name_${locale} description_${locale}`)
    .lean();

  // Get total count for pagination
  const total = await Country.countDocuments(query);

  res.json({
    data: categories,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }
  });
}
```

---

## Summary

The current implementation uses **client-side filtering** which works well for small datasets but has limitations for scalability. Moving to **server-side filtering** with pagination, search, and sorting will significantly improve performance and user experience.

Key improvements:
1. **Backend:** Add query parameters, pagination, search, sorting
2. **Frontend:** Implement server-side filtering, pagination, better search UX
3. **Database:** Add indexes, full-text search, caching
4. **UX:** Better loading states, empty states, error handling

This will make the marketplace more scalable, performant, and user-friendly.

