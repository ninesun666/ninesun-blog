"use client"

import { Toaster as ChakraToaster, createToaster, Toast } from "@chakra-ui/react"

export const toaster = createToaster({
  placement: "top-end",
  max: 5,
})

export const Toaster = () => {
  return (
    <ChakraToaster toaster={toaster}>
      {(toast) => (
        <Toast.Root key={toast.id}>
          <Toast.Title>{toast.title}</Toast.Title>
          <Toast.Description>{toast.description}</Toast.Description>
          <Toast.CloseTrigger />
        </Toast.Root>
      )}
    </ChakraToaster>
  )
}