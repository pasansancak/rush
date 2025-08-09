
# Rush App - HomeScreen Future Enhancements

## 📌 Caching Plan (to be implemented later)
**Goal:** Improve performance and reduce backend load by avoiding unnecessary recomputation of Home feed data.

### 1. Backend-side Caching
- **Technology:** Redis (in-memory data store)
- **Strategy:**
  - Cache `/v1/home` response for 30–60 seconds.
  - Store precomputed Home sections in Redis keyed by `home_sections:<locale>`.
  - Invalidate cache when:
    - An event is published, updated, or archived.
    - A section’s manual content is changed in the admin panel.

### 2. HTTP ETag Support
- **Purpose:** Let clients check if data has changed.
- **Implementation:**
  - Send an `ETag` header with a hash of the `/v1/home` response.
  - If client sends `If-None-Match` with the same hash, return **304 Not Modified**.

### 3. Precomputation (Optional)
- Run a cron job every X minutes to prebuild the `/v1/home` JSON and push to Redis.
- Reduces per-request DB queries.

---

## 🚀 Future Advanced Steps for HomeScreen
1. **Dynamic Home Sections**
   - Add `source_type` field in `home_sections` table: `"manual"` or `"query"`.
   - `"manual"` → events are explicitly chosen in admin panel.
   - `"query"` → events are fetched by rules (e.g., date range, category).

2. **Personalized Feed**
   - Use user’s favorite categories, past activity, and location to adjust order of events.
   - Store personalization data in a separate table.

3. **Popularity & Ranking**
   - Maintain a score for each event based on sales, views, clicks.
   - Use this score in sorting events for Home.

4. **Hero Banner Scheduling**
   - Add start/end dates for hero banners in `home_sections` to control visibility.

5. **A/B Testing for Home Layouts**
   - Randomly assign users to layout variations to test engagement.

6. **Lazy Loading / Infinite Scroll**
   - For large event lists, load more items on scroll to improve performance.

7. **Offline Mode (Optional)**
   - Cache last `/v1/home` response on device for offline browsing.
