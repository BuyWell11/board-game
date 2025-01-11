'use client';
import { Stack, Text } from '@chakra-ui/react';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
interface Props {
  label: string;
}

const SwitchWithLabel = ({ label }: Props) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Stack direction="row" gap={2}>
      <Text textStyle="xl" fontWeight="bold">
        {label}
      </Text>
      <Switch checked={theme === 'light'} onCheckedChange={() => setTheme((prevState) => (prevState === 'light' ? 'dark' : 'light'))} />
    </Stack>
  );
};

export default SwitchWithLabel;
