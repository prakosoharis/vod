Update BrowsePage.tsx to add multiple content rows with different data sources.

UPDATE FILE: src/pages/BrowsePage.tsx

Add these content rows using React Query:

1. Continue Watching (if user has watch progress):
   - Fetch from user.service.getContinueWatching()
   - Show only if has data (conditional render)

2. Trending Now:
   - Fetch from content.service.getTrendingContent()

3. Made in Indonesia:
   - Fetch content.service.getAllContent({ genre: 'Indonesian' })
   - Or filter by type/genre

4. New Releases:
   - Fetch content.service.getAllContent({ sort: 'newest' })
   - Or use created_at sorting

5. Popular Movies:
   - Fetch content.service.getAllContent({ type: 'MOVIE', sort: 'popular' })

6. Genre-based rows (Action, Drama, Horror):
   - Multiple queries for different genres

React Query implementation:
```typescript
// Multiple queries
const { data: trending } = useQuery({
  queryKey: ['trending'],
  queryFn: () => contentService.getTrendingContent()
})

const { data: indonesian } = useQuery({
  queryKey: ['indonesian'],
  queryFn: () => contentService.getAllContent({ limit: 20 })
})

// Continue watching (conditional)
const { data: continueWatching } = useQuery({
  queryKey: ['continue-watching'],
  queryFn: () => userService.getContinueWatching(),
  enabled: !!user // Only if logged in
})
```

Row order:
1. Continue Watching (if exists)
2. Trending Now
3. Made in Indonesia
4. New Releases
5. Popular Movies
6. Genre rows (Action, Drama, Horror, Comedy)

Styling:
- Proper spacing between rows (space-y-12)
- Rows overlap hero banner for depth (-mt-32)
- Bottom padding for scroll (pb-20)

Conditional rendering:
- Only show "Continue Watching" if data exists
- Show loading skeleton for each row while fetching

OUTPUT:
Complete updated BrowsePage.tsx with all content rows and React Query.