'use client';

import {
  ActionIcon,
  Badge,
  Card,
  CopyButton,
  Group,
  Stack,
  Text,
  Title,
  Tooltip
} from '@mantine/core';
import { IconCheck, IconCopy, IconEdit, IconTrash } from '@tabler/icons-react';
import Link from 'next/link';
import { use } from 'react';

import type { MockEndpointWithPresets } from '@/shared/lib/prisma';

import { deleteEndpoints } from '@/shared/lib/endpoints';

const METHOD_COLORS: Record<string, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'yellow',
  PATCH: 'orange',
  DELETE: 'red',
  HEAD: 'gray',
  OPTIONS: 'cyan'
};

interface EndpointsListProps {
  endpoints: Promise<MockEndpointWithPresets[]>;
}

export const EndpointsList = ({ endpoints }: EndpointsListProps) => {
  const allEndpoints = use(endpoints);

  if (allEndpoints.length === 0) {
    return (
      <Card padding='md' radius='md' withBorder>
        <Text c='dimmed' py='xl' ta='center'>
          Эндпоинты не найдены. Создайте первый эндпоинт, чтобы начать работу.
        </Text>
      </Card>
    );
  }

  function handleDelete(id: string): void {
    deleteEndpoints(id);
  }

  return (
    <Stack gap='md'>
      {allEndpoints.map((endpoint) => (
        <Card key={endpoint.id} padding='lg' radius='md' withBorder>
          <Group align='flex-start' justify='space-between' mb='md'>
            <Group align='center' gap='xs' style={{ flex: 1 }}>
              <Badge size='lg' variant='filled' color={METHOD_COLORS[endpoint.method] || 'gray'}>
                {endpoint.method}
              </Badge>
              <Title style={{ flex: 1 }} order={4}>
                {endpoint.path}
              </Title>
              <CopyButton value={endpoint.path} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip
                    label={copied ? 'Скопировано' : 'Копировать путь'}
                    position='right'
                    withArrow
                  >
                    <ActionIcon variant='subtle' color={copied ? 'teal' : 'gray'} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Group gap='xs'>
              <Tooltip label='Редактировать' withArrow>
                <ActionIcon
                  href={`/endpoints/${endpoint.id}`}
                  size='lg'
                  variant='light'
                  color='blue'
                  component={Link}
                >
                  <IconEdit size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label='Удалить' withArrow>
                <ActionIcon
                  size='lg'
                  variant='light'
                  color='red'
                  onClick={() => handleDelete(endpoint.id)}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>

          {endpoint.description && (
            <Text c='dimmed' mb='md' size='sm'>
              {endpoint.description}
            </Text>
          )}

          {endpoint.presets.length > 0 && (
            <Stack gap='xs' mt='md'>
              <Text fw={500} size='sm'>
                Пресеты ({endpoint.presets.length}):
              </Text>
              <Group gap='xs'>
                {endpoint.presets.map((preset: MockEndpointWithPresets['presets'][0]) => (
                  <Tooltip
                    key={preset.id}
                    label={
                      <div>
                        <div>{preset.name}</div>
                        <div>Статус: {preset.statusCode}</div>
                        {Array.isArray(preset.filterKeys) && preset.filterKeys.length > 0 && (
                          <div>Фильтры: {preset.filterKeys.join(', ')}</div>
                        )}
                      </div>
                    }
                    withArrow
                  >
                    <Badge
                      size='md'
                      variant={preset.enabled ? 'filled' : 'outline'}
                      color={preset.enabled ? 'green' : 'gray'}
                    >
                      {preset.name} ({preset.statusCode}){preset.enabled && ' ✓'}
                    </Badge>
                  </Tooltip>
                ))}
              </Group>
            </Stack>
          )}

          {endpoint.presets.length === 0 && (
            <Text c='dimmed' mt='md' size='sm'>
              Пресеты отсутствуют
            </Text>
          )}
        </Card>
      ))}
    </Stack>
  );
};
