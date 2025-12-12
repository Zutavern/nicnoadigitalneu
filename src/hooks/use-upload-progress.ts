'use client'

import { useState, useCallback } from 'react'

interface UploadOptions {
  endpoint: string
  file: File
  additionalData?: Record<string, string>
  onSuccess?: (response: unknown) => void
  onError?: (error: Error) => void
}

interface UploadProgressState {
  progress: number
  isUploading: boolean
  error: string | null
}

interface UseUploadProgressReturn extends UploadProgressState {
  upload: (options: UploadOptions) => Promise<unknown>
  reset: () => void
}

export function useUploadProgress(): UseUploadProgressReturn {
  const [state, setState] = useState<UploadProgressState>({
    progress: 0,
    isUploading: false,
    error: null,
  })

  const reset = useCallback(() => {
    setState({
      progress: 0,
      isUploading: false,
      error: null,
    })
  }, [])

  const upload = useCallback(async (options: UploadOptions): Promise<unknown> => {
    const { endpoint, file, additionalData, onSuccess, onError } = options

    setState({
      progress: 0,
      isUploading: true,
      error: null,
    })

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()

      formData.append('file', file)

      // Füge zusätzliche Daten hinzu
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value)
        })
      }

      // Progress Event
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100)
          setState((prev) => ({ ...prev, progress: percentComplete }))
        }
      }

      // Load Event (Upload abgeschlossen)
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            setState({
              progress: 100,
              isUploading: false,
              error: null,
            })
            onSuccess?.(response)
            resolve(response)
          } catch {
            const error = new Error('Ungültige Server-Antwort')
            setState({
              progress: 0,
              isUploading: false,
              error: error.message,
            })
            onError?.(error)
            reject(error)
          }
        } else {
          let errorMessage = 'Upload fehlgeschlagen'
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            errorMessage = errorResponse.error || errorMessage
          } catch {
            // Ignoriere JSON-Parse-Fehler
          }
          const error = new Error(errorMessage)
          setState({
            progress: 0,
            isUploading: false,
            error: errorMessage,
          })
          onError?.(error)
          reject(error)
        }
      }

      // Error Event
      xhr.onerror = () => {
        const error = new Error('Netzwerkfehler beim Upload')
        setState({
          progress: 0,
          isUploading: false,
          error: error.message,
        })
        onError?.(error)
        reject(error)
      }

      // Abort Event
      xhr.onabort = () => {
        const error = new Error('Upload abgebrochen')
        setState({
          progress: 0,
          isUploading: false,
          error: error.message,
        })
        onError?.(error)
        reject(error)
      }

      xhr.open('POST', endpoint)
      xhr.send(formData)
    })
  }, [])

  return {
    ...state,
    upload,
    reset,
  }
}

