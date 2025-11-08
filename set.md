Implement watchlist feature - users can add/remove content to their personal list.

PROJECT CONTEXT:
- Users can add content to "My List"
- Accessible from browse page, content cards, detail modal
- Create dedicated "My List" page
- Optimistic updates (instant UI feedback)

TASK 1: ADD/REMOVE FUNCTIONALITY

UPDATE user.service.ts:
```typescript
export const userService = {
  // ... existing methods

  async addToWatchlist(contentId: string) {
    const response = await api.post('/user/watchlist', { content_id: contentId })
    return response.data
  },

  async removeFromWatchlist(contentId: string) {
    const response = await api.delete(`/user/watchlist/${contentId}`)
    return response.data
  },

  async getWatchlist() {
    const response = await api.get('/user/watchlist')
    return response.data
  }
}
```

TASK 2: UPDATE ContentCard.tsx

Add "Add to List" button functionality:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Check } from 'lucide-react'

const ContentCard = ({ content }: ContentCardProps) => {
  const queryClient = useQueryClient()
  const [isInList, setIsInList] = useState(false)

  const addToListMutation = useMutation({
    mutationFn: () => userService.addToWatchlist(content.id),
    onMutate: async () => {
      // Optimistic update
      setIsInList(true)
    },
    onSuccess: () => {
      // Invalidate watchlist query to refetch
      queryClient.invalidateQueries({ queryKey: ['watchlist'] })
    },
    onError: () => {
      // Revert on error
      setIsInList(false)
    }
  })

  const removeFromListMutation = useMutation({
    mutationFn: () => userService.removeFromWatchlist(content.id),
    onMutate: async () => {
      setIsInList(false)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] })
    },
    onError: () => {
      setIsInList(true)
    }
  })

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    if (isInList) {
      removeFromListMutation.mutate()
    } else {
      addToListMutation.mutate()
    }
  }

  return (
    // ... card JSX
    <button 
      onClick={toggleWatchlist}
      className="..."
    >
      {isInList ? <Check size={16} /> : <Plus size={16} />}
    </button>
  )
}
```

TASK 3: CREATE MY LIST PAGE

FILE: src/pages/MyListPage.tsx
```typescript
import { useQuery } from '@tanstack/react-query'
import { userService } from '@/RetryHPContinueservices/user.service'
import ContentCard from '@/components/home/ContentCard'
import Layout from '@/components/layout/Layout'
const MyListPage = () => {
const { data: watchlist, isLoading } = useQuery({
queryKey: ['watchlist'],
queryFn: () => userService.getWatchlist()
})
if (isLoading) {
return (
<Layout>
<div className="min-h-screen bg-black flex items-center justify-center">
<div className="text-white">Loading...</div>
</div>
</Layout>
)
}
return (
<Layout>
<div className="min-h-screen bg-black pt-24 px-8">
<div className="max-w-7xl mx-auto">
<h1 className="text-4xl font-bold mb-8">Daftar Saya</h1>
      {!watchlist || watchlist.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl mb-4">
            Daftar Anda masih kosong
          </p>
          <p className="text-gray-500">
            Tambahkan film dan series favorit Anda ke daftar
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {watchlist.map((item: any) => (
            <ContentCard key={item.content_id} content={item} />
          ))}
        </div>
      )}
    </div>
  </div>
</Layout>
)
}
export default MyListPage

TASK 4: ADD ROUTE

UPDATE src/routes/AppRoutes.tsx:
```typescript
import MyListPage from '../pages/MyListPage'

<Route 
  path="/my-list" 
  element={
    <ProtectedRoute>
      <MyListPage />
    </ProtectedRoute>
  } 
/>
```

TASK 5: UPDATE NAVBAR DROPDOWN

Update Navbar.tsx dropdown link:
```typescript
<Link to="/my-list" className="...">
  Daftar Saya
</Link>
```

OUTPUT:
- Updated ContentCard.tsx with add/remove functionality
- Created MyListPage.tsx
- Updated routes
- Updated user.service.ts