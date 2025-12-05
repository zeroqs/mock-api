import { Container, Flex, Title } from '@mantine/core';
import Link from 'next/link';

import { ThemeToggle } from './ThemeToggle';

export const Header = () => {
  return (
    <Container py='md' size={1400}>
      <Flex align='center' justify='space-between'>
        <Link href='/' style={{ textDecoration: 'none', color: 'inherit' }}>
          <Title order={3}>❤️ QA</Title>
        </Link>

        <ThemeToggle />
      </Flex>
    </Container>
  );
};
