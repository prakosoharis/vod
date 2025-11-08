# MODAL FUNCTIONALITY:

A. OPENING MODAL:
   1. Go to /browse ✓
   2. Click "Info Lebih Lanjut" on hero banner ✓
   3. Modal opens with fade-in animation ✓
   4. Background blurred ✓
   5. Content displays correctly ✓

B. MODAL CONTENT:
   1. Backdrop image displays (large, top) ✓
   2. Title visible over backdrop ✓
   3. Metadata row (year, rating, duration, genres) ✓
   4. Action buttons visible (Play, Add to List, Share) ✓
   5. Description (full text, readable) ✓
   6. Cast section shows (with names/roles) ✓
   7. Similar content section shows ✓

C. CLOSE FUNCTIONALITY:
   1. Click X button → modal closes ✓
   2. Click outside modal → closes ✓
   3. Press ESC key → closes ✓
   4. All close methods smooth fade-out ✓

D. ACTION BUTTONS:
   1. Click "Putar" → (navigates to /watch/:id or placeholder) ✓
   2. Click "Daftar Saya" → (adds to watchlist or placeholder) ✓
   3. Click "Bagikan" → (share functionality or placeholder) ✓
   4. Hover effects work ✓

E. SCROLLING:
   1. Long content → modal scrollable ✓
   2. Scroll within modal ✓
   3. Background doesn't scroll ✓
   4. Cast section horizontal scroll works ✓

F. RESPONSIVE:
   Desktop:
   1. Modal centered, max-width 1200px ✓
   2. Backdrop 60vh height ✓
   3. All content readable ✓
   
   Mobile:
   1. Modal full width (with margins) ✓
   2. Backdrop shorter (40vh) ✓
   3. Buttons stack or smaller ✓
   4. Scrollable ✓
```

### ✅ CHECKLIST 5.1:

- [ ] ContentDetailModal.tsx created
- [ ] Modal overlay with blur backdrop
- [ ] Close on X button works
- [ ] Close on outside click works
- [ ] Close on ESC key works
- [ ] Backdrop image displays
- [ ] Content info displays (title, metadata)
- [ ] Description shows full text
- [ ] Action buttons present (Play, Add, Share)
- [ ] Cast section displays
- [ ] Similar content section displays
- [ ] Smooth animations (fade in/out)
- [ ] Scrollable content
- [ ] Responsive on mobile
- [ ] No background scroll when modal open

---

## 📋 CARD 5.2: VIDEO PLAYER PAGE

### 🤖 PROMPT:
```
Create a full-screen video player page for watching content.

PROJECT CONTEXT:
- StreamKita video streaming platform
- Full-screen video player with custom controls
- Route: /watch/:id
- Use Video.js or HTML5 video (no external player needed for demo)

INSTALL DEPENDENCIES (if using Video.js):
npm install video.js
npm install @types/video.js

CREATE FILE: src/pages/VideoPlayerPage.tsx

Requirements:

1. PAGE LAYOUT:
   - Full screen (min-h-screen)
   - Black background
   - Video player takes most space
   - Info section below player

2. VIDEO PLAYER:
   - Use HTML5 video element or Video.js
   - For demo: Use sample video URL or placeholder
   - Aspect ratio: 16:9
   - Controls:
     * Play/Pause button (center when paused)
     * Progress bar (seekable)
     * Volume control (slider + mute button)
     * Quality selector (mock: Auto, 1080p, 720p, 480p)
     * Fullscreen button
     * Current time / Duration display
   - Auto-hide controls after 3 seconds of inactivity
   - Show controls on mouse move

3. BACK BUTTON:
   - Top-left corner (over video)
   - Arrow icon + "Kembali" text
   - Navigate back to /browse
   - Always visible (doesn't auto-hide)

4. NEXT EPISODE (for series):
   - Show if content is series
   - Button: "Episode Selanjutnya"
   - Auto-play countdown (optional)
   - Position: Bottom-right during playback

5. BELOW PLAYER SECTION:
   - Content title
   - Episode info (if series): "S01E02 - Episode Title"
   - Description
   - Add to List button
   - Like/Dislike buttons (UI only)

6. UP NEXT SECTION:
   - Show next episode preview (if series)
   - Thumbnail + title
   - Auto-play countdown: "Playing in 10s..."
   - Skip/Cancel button

7. MORE LIKE THIS:
   - Horizontal row of similar content
   - Reuse ContentRow component

Implementation (Simple HTML5 video approach):
```typescript
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { contentService } from '@/services/content.service'

const VideoPlayerPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  // Fetch content data
  const { data: content } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentService.getContentById(id!)
  })

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isPlaying && showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000)
    }
    return () => clearTimeout(timeout)
  }, [showControls, isPlaying])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Video Player Container */}
      <div 
        className="relative w-full h-screen bg-black"
        onMouseMove={() => setShowControls(true)}
      >
        {/* Back Button (always visible) */}
        <button
          onClick={() => navigate('/browse')}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 rounded"
        >
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </button>

        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          src={content?.video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onClick={togglePlay}
        />

        {/* Controls Overlay */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6">
            {/* Progress Bar */}
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => {
                const time = parseFloat(e.target.value)
                setCurrentTime(time)
                if (videoRef.current) videoRef.current.currentTime = time
              }}
              className="w-full mb-4"
            />

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <button onClick={togglePlay}>
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>

                {/* Volume */}
                <button onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>

                {/* Time */}
                <span className="text-sm">
                  {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / 
                  {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Quality Selector (mock) */}
                <button className="flex items-center gap-2">
                  <Settings size={20} />
                  <span className="text-sm">Auto</span>
                </button>

                {/* Fullscreen */}
                <button onClick={toggleFullscreen}>
                  <Maximize size={24} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Center Play Button (when paused) */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
          >
            <Play size={40} fill="white" />
          </button>
        )}
      </div>

      {/* Below Player Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <h1 className="text-3xl font-bold mb-2">{content?.title}</h1>
        <p className="text-gray-400 mb-6">{content?.description}</p>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="px-6 py-2 bg-gray-800 rounded hover:bg-gray-700">
            + Daftar Saya
          </button>
          <button className="px-6 py-2 bg-gray-800 rounded hover:bg-gray-700">
            👍 Suka
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayerPage
```

VIDEO.JS ALTERNATIVE (if prefer library):
```typescript
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

// Use Video.js player with custom theme
```

Styling:
- Full screen player
- Custom controls styled to match theme
- Smooth transitions
- Touch-friendly on mobile

OUTPUT:
Complete VideoPlayerPage.tsx with video player and controls.

Also UPDATE: src/routes/AppRoutes.tsx
Add route: 
```typescript
<Route path="/watch/:id" element={<VideoPlayerPage />} />
```