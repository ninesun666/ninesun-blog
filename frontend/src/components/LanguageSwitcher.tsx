import { useTranslation } from 'react-i18next'
import { Button, HStack, Icon, MenuRoot, MenuTrigger, MenuContent, MenuItem, Text } from '@chakra-ui/react'
import { FiGlobe } from 'react-icons/fi'

const languages = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
]

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  
  const currentLang = languages.find(l => l.code === i18n.language) || languages[0]
  
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
  }
  
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          borderRadius="lg"
          aria-label={t('lang.switch')}
        >
          <HStack gap={2}>
            <Icon as={FiGlobe} boxSize={4} />
            <Text fontSize="sm">{currentLang.flag}</Text>
          </HStack>
        </Button>
      </MenuTrigger>
      <MenuContent>
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            value={lang.code}
            onClick={() => changeLanguage(lang.code)}
            bg={i18n.language === lang.code ? 'purple.50' : undefined}
            _dark={{ bg: i18n.language === lang.code ? 'purple.900' : undefined }}
          >
            <HStack gap={2}>
              <Text>{lang.flag}</Text>
              <Text>{lang.name}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuContent>
    </MenuRoot>
  )
}

export default LanguageSwitcher
