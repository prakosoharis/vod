import { useState, useCallback } from 'react'
import { CloudArrowUpIcon, PhotoIcon, TrashIcon, DocumentIcon } from '@heroicons/react/24/outline'
import { useDropzone } from 'react-dropzone'

interface UploadedFile {
  id: string
  filename: string
  type: 'thumbnail' | 'backdrop' | 'avatar' | 'logo'
  url: string
  size: number
  mimetype: string
  uploaded_at: string
}

export default function Uploads() {
  const [uploadType, setUploadType] = useState<'thumbnail' | 'backdrop' | 'avatar' | 'logo'>('thumbnail')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setIsUploading(true)

    try {
      for (const file of acceptedFiles) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`/api/upload?type=${uploadType}`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error?.message || 'Upload failed')
        }

        const result = await response.json()

        const newFile: UploadedFile = {
          id: Date.now().toString(),
          filename: result.data.filename,
          type: uploadType,
          url: result.data.url,
          size: result.data.size,
          mimetype: result.data.mimetype,
          uploaded_at: new Date().toISOString(),
        }

        setUploadedFiles(prev => [newFile, ...prev])
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [uploadType])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
    disabled: isUploading,
  })

  const handleDeleteFile = async (file: UploadedFile) => {
    if (!confirm(`Are you sure you want to delete ${file.filename}?`)) return

    try {
      const response = await fetch(`/api/upload/${file.type}/${file.filename}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Delete failed')
      }

      setUploadedFiles(prev => prev.filter(f => f.id !== file.id))
    } catch (error) {
      console.error('Delete error:', error)
      alert(error instanceof Error ? error.message : 'Delete failed')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFullUrl = (url: string) => {
    const baseUrl = window.location.origin.includes(':3001')
      ? 'http://localhost:3001'
      : window.location.origin.replace(':3000', ':3001')
    return baseUrl + url
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Upload Assets</h1>
          <p className="mt-2 text-sm text-gray-700">
            Upload images for thumbnails, backdrops, avatars, and logos. Supported formats: JPEG, PNG, WebP, GIF. Maximum file size: 10MB.
          </p>
        </div>
      </div>

      <div className="mt-8">
        {/* Upload Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'thumbnail', label: 'Thumbnail', icon: PhotoIcon },
              { value: 'backdrop', label: 'Backdrop', icon: PhotoIcon },
              { value: 'avatar', label: 'Avatar', icon: PhotoIcon },
              { value: 'logo', label: 'Logo', icon: DocumentIcon },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setUploadType(value as any)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors duration-200 ${
                  uploadType === value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center hover:border-primary-400 transition-colors duration-200 cursor-pointer ${
            isUploading ? 'border-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-900">
              {isUploading ? 'Uploading...' : `Drop ${uploadType} images here or click to browse`}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              PNG, JPG, GIF, WebP up to 10MB each
            </p>
          </div>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="aspect-video bg-gray-100 relative">
                    <img
                      src={getFullUrl(file.url)}
                      alt={file.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center">
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {file.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate" title={file.filename}>
                        {file.filename}
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                        <button
                          onClick={() => handleDeleteFile(file)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                          title="Delete file"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 break-all">
                          {getFullUrl(file.url)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">How to Use Uploaded Images</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>After uploading, you can use these images in:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Thumbnails:</strong> Movie/Series content thumbnails</li>
              <li><strong>Backdrops:</strong> Background images for content</li>
              <li><strong>Avatars:</strong> User profile pictures</li>
              <li><strong>Logos:</strong> Brand or company logos</li>
            </ul>
            <p className="mt-2">
              <strong>URL Format:</strong> <code className="bg-blue-100 px-2 py-1 rounded">http://localhost:3001/api/uploads/{uploadType}s/[filename]</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}