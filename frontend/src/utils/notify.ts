import { toaster } from '../components/ui/toaster'

export const toast = {
  success: (title: string, description?: string) => {
    toaster.create({
      title,
      description,
      type: 'success',
    })
  },

  error: (title: string, description?: string) => {
    toaster.create({
      title,
      description,
      type: 'error',
    })
  },

  warning: (title: string, description?: string) => {
    toaster.create({
      title,
      description,
      type: 'warning',
    })
  },

  info: (title: string, description?: string) => {
    toaster.create({
      title,
      description,
      type: 'info',
    })
  },
}