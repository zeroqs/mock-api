'use client';

import type { ContextModalProps } from '@mantine/modals';

import { Button, Group, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import type { HttpMethod } from '@/app/api/endpoints/schema';

import { createEndpointSchema, METHODS, updateEndpointSchema } from '@/app/api/endpoints/schema';
import { createEndpoint, getEndpoint, updateEndpoint } from '@/shared/lib/endpoints';
import { Presets, usePresets } from '@/shared/ui';

type EndpointModalProps = ContextModalProps<{ endpointId?: string }>;

export const EndpointModal = ({ context, id, innerProps }: EndpointModalProps) => {
  const router = useRouter();
  const { draftPresets, clearDraftPresets, loadPresets } = usePresets();
  const isEditMode = !!innerProps.endpointId;

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      method: '',
      path: '',
      description: ''
    },
    validate: zod4Resolver(
      isEditMode
        ? updateEndpointSchema.omit({ presets: true })
        : createEndpointSchema.omit({ presets: true })
    )
  });

  useEffect(() => {
    if (isEditMode && innerProps.endpointId) {
      getEndpoint(innerProps.endpointId)
        .then((endpoint) => {
          if (endpoint) {
            form.setValues({
              method: endpoint.method,
              path: endpoint.path,
              description: endpoint.description || ''
            });
            loadPresets(innerProps.endpointId!);
          }
        })
        .catch((error) => {
          notifications.show({
            title: 'Ошибка загрузки',
            message: error instanceof Error ? error.message : 'Не удалось загрузить эндпоинт',
            color: 'red'
          });
        });
    }
  }, [isEditMode, innerProps.endpointId]);

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

      if (isEditMode && innerProps.endpointId) {
        await updateEndpoint(innerProps.endpointId, {
          ...values,
          method: values.method as HttpMethod,
          presets
        });
        notifications.show({ title: 'Успешно', message: 'Эндпоинт обновлен', color: 'green' });
      } else {
        await createEndpoint({
          ...values,
          method: values.method as HttpMethod,
          presets: draftPresets
        });
        notifications.show({ title: 'Успешно', message: 'Эндпоинт создан', color: 'green' });
      }

      form.reset();
      clearDraftPresets();
      context.closeModal(id);
      router.refresh();
    } catch (error) {
      notifications.show({
        title: isEditMode ? 'Ошибка при обновлении эндпоинта' : 'Ошибка при создании эндпоинта',
        message: error instanceof Error ? error.message : 'Произошла ошибка',
        color: 'red'
      });
    }
  };

  const onCloseModal = () => {
    if (isEditMode) {
      form.reset();
      clearDraftPresets();
    }
    context.closeModal(id);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap='md'>
        <Select
          withAsterisk
          key={form.key('method')}
          data={METHODS}
          disabled={isEditMode}
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

        <Presets mockEndpointId={isEditMode ? innerProps.endpointId : null} />

        <Group justify='flex-end' mt='md'>
          <Button variant='default' onClick={onCloseModal}>
            Отмена
          </Button>
          <Button type='submit' color='green'>
            {isEditMode ? 'Сохранить' : 'Создать'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
