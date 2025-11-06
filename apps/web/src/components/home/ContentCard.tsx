import { useState } from 'react'
import { Play, Plus, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Content } from '@/types'

interface ContentCardProps {
  content: Content
}

const ContentCard = ({ content }: ContentCardProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative min-w-[250px] h-[140px] cursor-pointer transition-transform duration-300 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <img
        src={content.thumbnail_url}
        alt={content.title}
        className="w-full h-full object-cover rounded"
        loading="lazy"
      />

      {/* Hover Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/80 rounded p-4 flex flex-col justify-between">
          {/* Title & Metadata */}
          <div>
            <h3 className="font-bold text-sm mb-1">{content.title}</h3>
            <p className="text-xs text-gray-400">
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
              className="p-2 border border-white rounded-full hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation()
                // Placeholder: Add to list functionality
              }}
            >
              <Plus size={16} />
            </button>
            <button
              className="p-2 border border-white rounded-full hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation()
                // Placeholder: Open detail modal
              }}
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

