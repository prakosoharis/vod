Update Navbar component to show different UI when user is logged in.

UPDATE FILE: src/components/layout/Navbar.tsx

Add logged-in state detection and UI changes:

1. Check authentication:
```typescript
import { useAuthStore } from '@/stores/authStore'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  // ...
}
```

2. Hide "Login" and "Sign Up" buttons when authenticated

3. Show user section (right side):
   - Search icon (optional)
   - User avatar with dropdown

4. User Avatar:
   - Circle image or initials
   - Click to toggle dropdown menu
   - Use useState for dropdown state

5. Dropdown Menu (on avatar click):
   - Profile (link to /profile - placeholder)
   - My List (link to /my-list - placeholder)
   - Account Settings (link to /settings - placeholder)
   - Divider (border line)
   - Logout button (calls authStore.logout())

Implementation:
```typescript
const [showDropdown, setShowDropdown] = useState(false)

// In navbar right section:
{isAuthenticated ? (
  <div className="relative">
    {/* Avatar */}
    <button
      onClick={() => setShowDropdown(!showDropdown)}
      className="w-10 h-10 rounded bg-red-600 flex items-center justify-center"
    >
      {user?.full_name?.[0] || 'U'}
    </button>

    {/* Dropdown */}
    {showDropdown && (
      <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-gray-700 rounded">
        <Link to="/profile" className="block px-4 py-2 hover:bg-gray-800">
          Profile
        </Link>
        <Link to="/my-list" className="block px-4 py-2 hover:bg-gray-800">
          Daftar Saya
        </Link>
        <Link to="/settings" className="block px-4 py-2 hover:bg-gray-800">
          Pengaturan
        </Link>
        <div className="border-t border-gray-700 my-1" />
        <button
          onClick={() => {
            logout()
            navigate('/')
          }}
          className="block w-full text-left px-4 py-2 hover:bg-gray-800"
        >
          Keluar
        </button>
      </div>
    )}
  </div>
) : (
  <>
    <Link to="/login">Login</Link>
    <Link to="/register">Sign Up</Link>
  </>
)}
```

Dropdown features:
- Click outside to close (useEffect + event listener)
- Smooth fade in/out
- Positioned below avatar (absolute right-0)
- Dark background with border

Optional: Add search icon before avatar.

OUTPUT:
Updated src/components/layout/Navbar.tsx with logged-in state UI.