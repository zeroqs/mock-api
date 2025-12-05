'use client';

import type { ContextModalProps } from '@mantine/modals';

import { Button, Group, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import type { HttpMethod } from '@/app/api/endpoints/schema';

import { createEndpointSchema, METHODS } from '@/app/api/endpoints/schema';
import { createEndpoint } from '@/shared/lib/endpoints';
import { Presets, usePresets } from '@/shared/ui';

export const CreateEndpointModal = ({ context, id }: ContextModalProps) => {
  const router = useRouter();
  const { draftPresets, clearDraftPresets } = usePresets();
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      method: '',
      path: '',
      description: ''
    },
    onValuesChange: (values) => {
      window.localStorage.setItem('endpoint-form', JSON.stringify(values));
    },
    validate: zod4Resolver(createEndpointSchema.omit({ presets: true }))
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await createEndpoint({
        ...values,
        method: values.method as HttpMethod,
        presets: draftPresets
      });

      form.reset();
      clearDraftPresets();
      context.closeModal(id);
      router.refresh();
    } catch (error) {
      notifications.show({
        title: 'Ошибка при создании эндпоинта',
        message: error instanceof Error ? error.message : 'Ошибка при создании эндпоинта'
      });
    }
  };

  const onCloseModal = () => {
    context.closeModal(id);
  };

  useEffect(() => {
    const storedValue = window.localStorage.getItem('endpoint-form');
    if (storedValue) {
      try {
        form.setValues(JSON.parse(storedValue));
      } catch {
        notifications.show({
          title: 'Ошибка при загрузке значений формы',
          message: 'Ошибка при загрузке значений формы'
        });
      }
    }
  }, []);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap='md'>
        <Select
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

        <Presets />

        <Group justify='flex-end' mt='md'>
          <Button variant='default' onClick={onCloseModal}>
            Отмена
          </Button>
          <Button type='submit' color='green'>
            Создать
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
