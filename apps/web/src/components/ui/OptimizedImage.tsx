import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean // Skip lazy loading for above-the-fold images
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  format?: 'webp' | 'original' | 'auto'
  onLoad?: () => void
  onError?: () => void
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  format = 'auto',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState('')
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Generate WebP URL
  const generateWebPUrl = (url: string): string => {
    if (format === 'original') return url

    // Check if it's already a WebP image
    if (url.toLowerCase().endsWith('.webp')) return url

    // For external images, we can't convert to WebP without a service
    // For local images, we can try to serve WebP version
    if (url.startsWith('/')) {
      // Try WebP version first
      const webpUrl = url.replace(/\.(jpg|jpeg|png)$/i, '.webp')
      return webpUrl
    }

    return url
  }

  // Generate blur placeholder
  const generateBlurPlaceholder = (): string => {
    if (blurDataURL) return blurDataURL

    // Generate a simple SVG blur placeholder
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#374151"/>
        <rect width="100%" height="100%" fill="url(#gradient)"/>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#374151"/>
            <stop offset="100%" stop-color="#1f2937"/>
          </linearGradient>
        </defs>
      </svg>
    `)}`
  }

  // Load image
  const loadImage = () => {
    if (!src || currentSrc === src) return

    const img = new Image()
    const optimizedSrc = generateWebPUrl(src)

    img.onload = () => {
      setCurrentSrc(optimizedSrc)
      setIsLoaded(true)
      onLoad?.()
    }

    img.onerror = () => {
      // Fallback to original image if WebP fails
      if (optimizedSrc !== src) {
        const fallbackImg = new Image()
        fallbackImg.onload = () => {
          setCurrentSrc(src)
          setIsLoaded(true)
          onLoad?.()
        }
        fallbackImg.onerror = () => {
          setIsError(true)
          setIsLoaded(false)
          onError?.()
        }
        fallbackImg.src = src
      } else {
        setIsError(true)
        setIsLoaded(false)
        onError?.()
      }
    }

    img.src = optimizedSrc
  }

  // Setup intersection observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) {
      loadImage()
      return
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          loadImage()
          observerRef.current?.disconnect()
        }
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before it comes into view
        threshold: 0.01
      }
    )

    observerRef.current.observe(imgRef.current)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [src, priority])

  // Handle src change
  useEffect(() => {
    if (src !== currentSrc && !isError) {
      setIsLoaded(false)
      if (priority || !observerRef.current) {
        loadImage()
      }
    }
  }, [src])

  const imageStyle = {
    width: width ? `${width}px` : undefined,
    height: height ? `${height}px` : undefined,
  }

  if (isError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-800 text-gray-400',
          className
        )}
        style={imageStyle}
        {...props}
      >
        <div className="text-center p-4">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">Failed to load image</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)} style={imageStyle} {...props}>
      {/* Placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <img
          src={generateBlurPlaceholder()}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          aria-hidden="true"
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />

      {/* Loading indicator */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-red-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

export default OptimizedImage