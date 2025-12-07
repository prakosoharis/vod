import { useState } from 'react'
import { Play, Plus, Check, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/auth.service'
import OptimizedImage from '@/components/ui/OptimizedImage'
import type { Content } from '@/types'

interface ContentCardProps {
  content: Content
  onInfoClick?: (content: Content) => void
}

const ContentCard = ({ content, onInfoClick }: ContentCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isInList, setIsInList] = useState(false)
  const queryClient = useQueryClient()

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
    <div
      className="group relative min-w-[180px] aspect-[3/4] cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-accent-500/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail with soft corners and subtle glow */}
      <OptimizedImage
        src={content.thumbnail_url}
        alt={content.title}
        className="w-full h-full object-cover rounded-xl shadow-lg group-hover:shadow-accent-500/20 transition-shadow duration-300"
        format="auto"
        placeholder="blur"
      />

      {/* Hover Overlay - softer, warmer */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-t from-warm-charcoal-100 via-warm-charcoal-100/95 to-warm-charcoal-100/80 rounded-xl p-3 flex flex-col justify-between backdrop-blur-sm">
          {/* Title & Metadata */}
          <div>
            <h3 className="font-bold text-base mb-1">{content.title}</h3>
            <p className="text-sm text-gray-400">
              {content.year} • {content.genre?.[0] ?? 'General'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link to={`/watch/${content.id}`}>
              <button className="p-2 bg-white text-black rounded-full hover:bg-gray-200">
                <Play size={16} fill="black" />
              </button>
            </Link>
            <button
              className={`p-2 border rounded-full hover:bg-white/10 transition-colors ${
                isInList
                  ? 'bg-green-600 border-green-600 hover:bg-green-700'
                  : 'border-white hover:bg-white/10'
              }`}
              onClick={toggleWatchlist}
              title={isInList ? "Hapus dari Daftar" : "Tambah ke Daftar"}
            >
              {isInList ? <Check size={16} /> : <Plus size={16} />}
            </button>
            <button
              className="p-2 border border-white rounded-full hover:bg-white/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onInfoClick?.(content)
              }}
              title="Info Lebih Lanjut"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export { ContentCard }

