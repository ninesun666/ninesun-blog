import { toaster } from '../components/ui/toaster'

export const toast = {
  success: (title: string, description?: string) => {
    toaster.create({
      title,
      description,
      type: 'success',
      duration: 3000,
    })
  },

  error: (title: string, description?: string) => {
    toaster.create({
      title,
      description,
      type: 'error',
      duration: 4000,
    })
  },

  warning: (title: string, description?: string) => {
    toaster.create({
      title,
      description,
      type: 'warning',
      duration: 3500,
    })
  },

  info: (title: string, description?: string) => {
    toaster.create({
      title,
      description,
      type: 'info',
      duration: 3000,
    })
  },
}