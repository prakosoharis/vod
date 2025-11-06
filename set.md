Create a Netflix-style content detail modal that shows full information about a movie or series.

PROJECT CONTEXT:
- StreamKita video streaming platform
- Modal opens when user clicks "More Info" or clicks a content card
- Shows detailed information with backdrop image
- Dark theme with blur overlay

CREATE FILE: src/components/content/ContentDetailModal.tsx

Requirements:

1. MODAL OVERLAY:
   - Full screen overlay (fixed, inset-0)
   - Dark background with blur (bg-black/80 backdrop-blur-md)
   - Click outside to close
   - ESC key to close
   - Z-index high (z-50)
   - Smooth fade in/out animation

2. MODAL CONTENT CONTAINER:
   - Centered, max-width 1200px
   - Scrollable if content exceeds viewport
   - Rounded corners
   - Dark background (#1a1a1a)
   - Border subtle (border-gray-800)

3. BACKDROP IMAGE SECTION:
   - Large backdrop image at top
   - Gradient overlay (bottom fade)
   - Height: 60vh on desktop, 40vh on mobile
   - Close button (X) top-right corner

4. CONTENT INFO SECTION (over backdrop, bottom):
   - Title (large, bold)
   - Metadata row:
     * Year
     * Rating (⭐ with number)
     * Duration
     * Genre badges
   - Description (full text, not truncated)
   - Action buttons:
     * Play (primary, red, with icon)
     * Add to List (secondary, with Plus icon)
     * Share (secondary, with Share icon)

5. CAST & CREW SECTION:
   - Heading: "Cast & Crew"
   - Horizontal scrollable list
   - Cast cards:
     * Profile image (circular or square)
     * Name
     * Role
   - Show top 10 cast members

6. SIMILAR CONTENT SECTION:
   - Heading: "More Like This"
   - ContentRow component (reuse from browse page)
   - Show 6-8 similar content items

7. CLOSE FUNCTIONALITY:
   - Close button (X icon) top-right
   - Click outside modal content
   - Press ESC key
   - All trigger onClose callback

Props:
```typescript
interface ContentDetailModalProps {
  content: Content | null
  isOpen: boolean
  onClose: () => void
}
```

Implementation structure:
```typescript
import { X, Play, Plus, Share2 } from 'lucide-react'
import { useEffect } from 'react'
import ContentRow from '../home/ContentRow'

const ContentDetailModal = ({ content, isOpen, onClose }: ContentDetailModalProps) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden' // Prevent background scroll
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !content) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative bg-gray-900 max-w-5xl w-full my-10 rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70"
        >
          <X size={24} />
        </button>

        {/* Backdrop Section */}
        <div className="relative h-[60vh] rounded-t-lg overflow-hidden">
          <img 
            src={content.backdrop_url} 
            alt={content.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
          
          {/* Content Info on Backdrop */}
          <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span>{content.year}</span>
              <span>⭐ {content.rating}</span>
              <span>{content.duration}</span>
              {content.genre.map(g => (
                <span key={g} className="px-2 py-1 bg-white/20 rounded text-sm">{g}</span>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="px-8 py-3 bg-red-600 rounded flex items-center gap-2">
                <Play size={20} fill="white" /> Putar
              </button>
              <button className="px-6 py-3 bg-gray-700 rounded flex items-center gap-2">
                <Plus size={20} /> Daftar Saya
              </button>
              <button className="px-6 py-3 bg-gray-700 rounded flex items-center gap-2">
                <Share2 size={20} /> Bagikan
              </button>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="p-8">
          <h2 className="text-xl font-semibold mb-2">Sinopsis</h2>
          <p className="text-gray-300 leading-relaxed">{content.description}</p>
        </div>

        {/* Cast Section */}
        <div className="px-8 pb-8">
          <h2 className="text-xl font-semibold mb-4">Pemain & Kru</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {content.cast.map((member, idx) => (
              <div key={idx} className="flex-shrink-0 text-center">
                <div className="w-24 h-24 bg-gray-700 rounded-full mb-2" />
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Similar Content Section */}
        <div className="px-8 pb-8">
          <h2 className="text-xl font-semibold mb-4">Lebih Seperti Ini</h2>
          {/* Use ContentRow or custom similar content display */}
        </div>
      </div>
    </div>
  )
}

export default ContentDetailModal
```

Styling notes:
- Smooth animations (fade in/out)
- Blur backdrop for focus
- Dark theme consistent
- Mobile responsive (smaller padding, shorter backdrop)
- Scrollable content (overflow-y-auto on overlay)

OUTPUT:
Complete ContentDetailModal.tsx component with TypeScript types.