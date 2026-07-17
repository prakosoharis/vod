import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface SearchBarProps {
  isOpen: boolean
  onClose: () => void
}

const SearchBar = ({ isOpen, onClose }: SearchBarProps) => {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOpen) return
    inputRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="nusantara-search" role="dialog" aria-modal="true" aria-label="Cari tayangan">
      <button className="nusantara-search__close" onClick={onClose} aria-label="Tutup pencarian"><X /></button>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (!query.trim()) return
          navigate(`/browse?search=${encodeURIComponent(query.trim())}`)
          onClose()
        }}
      >
        <small>TEMUKAN CERITAMU</small>
        <h2>Cari film, serial, atau live event</h2>
        <label>
          <Search />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Misalnya: drama keluarga Indonesia"
          />
        </label>
        <p>Pencarian populer: <b>Drama</b><b>Komedi</b><b>Live Musik</b></p>
      </form>
    </div>
  )
}

export default SearchBar
