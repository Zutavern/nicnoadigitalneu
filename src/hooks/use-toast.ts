import { toast as sonnerToast } from 'sonner'

interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

export function useToast() {
  const toast = (options: ToastOptions | string) => {
    if (typeof options === 'string') {
      sonnerToast(options)
      return
    }

    const { title, description, variant, duration } = options

    if (variant === 'destructive') {
      sonnerToast.error(title, {
        description,
        duration,
      })
    } else {
      sonnerToast.success(title, {
        description,
        duration,
      })
    }
  }

  return { toast }
}

export { useToast as default }


