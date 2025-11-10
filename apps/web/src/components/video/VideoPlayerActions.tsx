import { useState } from 'react'
import { Plus, Check, ThumbsUp } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/auth.service'
import type { Content } from '@/types'

interface VideoPlayerActionsProps {
  content: Content
}

const VideoPlayerActions = ({ content }: VideoPlayerActionsProps) => {
  const [isInList, setIsInList] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const queryClient = useQueryClient()

  const addToListMutation = useMutation({
    mutationFn: () => userService.addToWatchlist(content.id),
    onMutate: async () => {
      setIsInList(true)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] })
    },
    onError: () => {
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

  const toggleWatchlist = () => {
    if (isInList) {
      removeFromListMutation.mutate()
    } else {
      addToListMutation.mutate()
    }
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
    // Placeholder: Could implement like functionality later
  }

  return (
    <div className="flex flex-wrap gap-3 sm:gap-4">
      <button
        onClick={toggleWatchlist}
        disabled={addToListMutation.isPending || removeFromListMutation.isPending}
        className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
          isInList
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-800 hover:bg-gray-700 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {addToListMutation.isPending || removeFromListMutation.isPending ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : isInList ? (
          <Check size={16} className="sm:size-20" />
        ) : (
          <Plus size={16} className="sm:size-20" />
        )}
        <span>{isInList ? 'Didaftarkan' : 'Daftar Saya'}</span>
      </button>

      <button
        onClick={toggleLike}
        className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
          isLiked
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-800 hover:bg-gray-700 text-white'
        }`}
      >
        <ThumbsUp size={16} className="sm:size-20" />
        <span>{isLiked ? 'Disuka' : 'Suka'}</span>
      </button>
    </div>
  )
}

export default VideoPlayerActions