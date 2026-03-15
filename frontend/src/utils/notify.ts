import { toaster } from '../components/ui/toaster'

export const toast = {
  success: (title: string, description?: string) => {
    toaster.success({
      title,
      description,
      duration: 3000,
    })
  },

  error: (title: string, description?: string) => {
    toaster.error({
      title,
      description,
      duration: 4000,
    })
  },

  warning: (title: string, description?: string) => {
    toaster.warning({
      title,
      description,
    })
  },

  info: (title: string, description?: string) => {
    toaster.info({
      title,
      description,
    })
  },
}
