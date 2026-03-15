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
        <Toast.Root
          key={toast.id}
          p={4}
          borderRadius="lg"
          boxShadow="lg"
          bg={toast.type === 'success' ? 'green.500' : 
              toast.type === 'error' ? 'red.500' : 
              toast.type === 'warning' ? 'orange.500' : 'blue.500'}
          color="white"
          minW="300px"
        >
          <Toast.Title fontWeight="bold">{toast.title}</Toast.Title>
          {toast.description && (
            <Toast.Description opacity={0.9}>{toast.description}</Toast.Description>
          )}
          <Toast.CloseTrigger 
            position="absolute"
            top={2}
            right={2}
            opacity={0.7}
            _hover={{ opacity: 1 }}
          />
        </Toast.Root>
      )}
    </ChakraToaster>
  )
}
