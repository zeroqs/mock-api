'use client';

import { Button, Group, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import type { HttpMethod } from '@/app/api/endpoints/schema';
import type { MockEndpointWithPresets } from '@/shared/lib/prisma';

import { METHODS, updateEndpointSchema } from '@/app/api/endpoints/schema';
import { updateEndpoint } from '@/shared/lib/endpoints';
import { Presets, usePresets } from '@/shared/ui';

interface EndpointFormProps {
  endpoint: MockEndpointWithPresets;
}

export const EndpointForm = ({ endpoint }: EndpointFormProps) => {
  const router = useRouter();
  const { draftPresets, loadPresets } = usePresets();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      method: endpoint.method,
      path: endpoint.path,
      description: endpoint.description || ''
    },
    validate: zod4Resolver(updateEndpointSchema.omit({ presets: true }))
  });

  useEffect(() => {
    loadPresets(endpoint.id);
  }, [endpoint.id, loadPresets]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const presets = draftPresets.map((preset) =>
        preset.id
          ? { id: preset.id, ...preset }
          : {
              name: preset.name,
              enabled: preset.enabled,
              statusCode: preset.statusCode,
              responseData: preset.responseData,
              filterKeys: preset.filterKeys
            }
      );

      await updateEndpoint(endpoint.id, {
        ...values,
        method: values.method as HttpMethod,
        presets
      });

      notifications.show({
        title: 'Успешно',
        message: 'Эндпоинт обновлен',
        color: 'green'
      });

      router.back();
      router.refresh();
    } catch (error) {
      notifications.show({
        title: 'Ошибка при обновлении эндпоинта',
        message: error instanceof Error ? error.message : 'Произошла ошибка',
        color: 'red'
      });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap='md'>
        <Select
          disabled
          withAsterisk
          key={form.key('method')}
          data={METHODS}
          label='Метод'
          placeholder='Выберите метод'
          {...form.getInputProps('method')}
        />

        <TextInput
          withAsterisk
          key={form.key('path')}
          label='Путь'
          placeholder='/api/example'
          {...form.getInputProps('path')}
        />

        <TextInput
          key={form.key('description')}
          label='Описание'
          placeholder='Описание endpoint'
          {...form.getInputProps('description')}
        />

        <Presets mockEndpointId={endpoint.id} />

        <Group justify='flex-end' mt='md'>
          <Button variant='default' onClick={() => router.back()}>
            Отмена
          </Button>
          <Button type='submit' color='green'>
            Сохранить
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
