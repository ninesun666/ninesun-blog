"use client"

import { ThemeProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { forwardRef } from "react"
import { IconButton } from "@chakra-ui/react"
import { FiMoon, FiSun } from "react-icons/fi"

export function ColorModeProvider(props: ThemeProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      defaultTheme="light"
      {...props}
    />
  )
}

export function useColorMode() {
  const { resolvedTheme, setTheme } = useTheme()
  const colorMode = resolvedTheme === "dark" ? "dark" : "light"
  const toggleColorMode = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }
  return {
    colorMode,
    toggleColorMode,
    isDark: colorMode === "dark",
    isLight: colorMode === "light",
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? dark : light
}

export const ColorModeButton = forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentProps<typeof IconButton>, "aria-label">
>(function ColorModeButton(props, ref) {
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    <IconButton
      ref={ref}
      aria-label={`切换到${colorMode === "light" ? "暗色" : "亮色"}模式`}
      variant="ghost"
      size="sm"
      onClick={toggleColorMode}
      borderRadius="lg"
      {...props}
    >
      {colorMode === "light" ? <FiMoon /> : <FiSun />}
    </IconButton>
  )
})
