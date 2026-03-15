import { useState } from 'react'
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  Button,
  Text,
} from '@chakra-ui/react'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (details: { open: boolean }) => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  loading?: boolean
  variant?: 'danger' | 'warning' | 'info'
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = '确认操作',
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  loading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  const colorPalette = variant === 'danger' ? 'red' : variant === 'warning' ? 'orange' : 'blue'

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <Text>{message}</Text>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange({ open: false })}>
            {cancelText}
          </Button>
          <Button
            colorPalette={colorPalette}
            onClick={() => {
              onConfirm()
              onOpenChange({ open: false })
            }}
            loading={loading}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}

// Hook for programmatic confirm dialog
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean
    title: string
    message: string
    resolve: ((value: boolean) => void) | null
  }>({
    open: false,
    title: '',
    message: '',
    resolve: null,
  })

  const confirm = (message: string, title = '确认操作'): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ open: true, title, message, resolve })
    })
  }

  const handleConfirm = () => {
    state.resolve?.(true)
    setState((prev) => ({ ...prev, open: false }))
  }

  const handleCancel = () => {
    state.resolve?.(false)
    setState((prev) => ({ ...prev, open: false }))
  }

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      open={state.open}
      onOpenChange={({ open }) => {
        if (!open) handleCancel()
      }}
      title={state.title}
      message={state.message}
      onConfirm={handleConfirm}
    />
  )

  return { confirm, ConfirmDialog: ConfirmDialogComponent }
}