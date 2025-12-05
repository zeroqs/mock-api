import { Card, Flex, Group, Text, Title } from '@mantine/core';
import { Suspense } from 'react';

import type { HttpMethod } from '@/app/api/endpoints/schema';

import { getEndpoints } from '@/shared/lib/endpoints';
import { CreateEndpoint } from '@/shared/ui/endpoints/CreateEndpoint';
import { EndpointsList } from '@/shared/ui/endpoints/EndpointsList';
import { Filters } from '@/shared/ui/filters/filters';

export default async function Home(props: {
  searchParams?: Promise<{
    query?: string;
    methods?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const methods = searchParams?.methods?.split(',').filter(Boolean) as HttpMethod[] | undefined;
  const endpoints = getEndpoints(query, methods);

  return (
    <Flex gap='md' direction='column'>
      <Filters />
      <Suspense
        key={query + (methods?.join(',') || '')}
        fallback={
          <Card padding='md' radius='md' withBorder>
            <Text c='dimmed' py='xl' ta='center'>
              Загрузка...
            </Text>
          </Card>
        }
      >
        <Flex gap='md' direction='column'>
          <Group align='center' justify='space-between'>
            <Title order={2}>Эндпоинты</Title>
            <CreateEndpoint />
          </Group>
          <EndpointsList endpoints={endpoints} />
        </Flex>
      </Suspense>
    </Flex>
  );
}
