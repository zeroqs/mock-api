'use client';

import { ActionIcon, useMantineColorScheme } from '@mantine/core';

export const ThemeToggle = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <ActionIcon
      aria-label='Переключить тему'
      size='lg'
      variant='default'
      onClick={() => toggleColorScheme()}
    >
      {colorScheme === 'dark' ? '☀️' : '🌙'}
    </ActionIcon>
  );
};
