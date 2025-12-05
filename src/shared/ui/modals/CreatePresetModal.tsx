'use client';

import type { ContextModalProps } from '@mantine/modals';

import {
  Button,
  Group,
  JsonInput,
  NumberInput,
  Stack,
  Switch,
  TagsInput,
  TextInput
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useRouter } from 'next/navigation';

import { createPresetSchema } from '@/app/api/presets/schema';
import { addPresetToEndpoint } from '@/shared/lib/endpoints';

import { usePresets } from '../presets/PresetsContext';

export const CreatePresetModal = ({
  context,
  id,
  innerProps
}: ContextModalProps<{ mockEndpointId?: string | null }>) => {
  const router = useRouter();
  const { addDraftPreset, setActivePresetInDraft } = usePresets();
  const { mockEndpointId } = innerProps;

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      enabled: false,
      statusCode: 200,
      responseData: '{}',
      filterKeys: [] as string[]
    },
    validate: zod4Resolver(createPresetSchema)
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const responseData = JSON.parse(values.responseData);

      if (!mockEndpointId) {
        addDraftPreset({
          name: values.name,
          enabled: values.enabled,
          statusCode: values.statusCode,
          responseData,
          filterKeys: values.filterKeys
        });
      } else {
        const newPreset = await addPresetToEndpoint(mockEndpointId, {
          name: values.name,
          enabled: values.enabled,
          statusCode: values.statusCode,
          responseData,
          filterKeys: values.filterKeys
        });

        addDraftPreset({
          id: newPreset.id,
          name: newPreset.name,
          enabled: newPreset.enabled,
          statusCode: newPreset.statusCode,
          responseData: newPreset.responseData,
          filterKeys: (newPreset.filterKeys as string[]) || []
        });

        if (values.enabled) {
          setActivePresetInDraft(newPreset.id);
        }

        notifications.show({
          title: 'Успешно',
          message: 'Пресет добавлен',
          color: 'green'
        });

        router.refresh();
      }

      form.reset();
      context.closeModal(id);
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: error instanceof Error ? error.message : 'Не удалось создать пресет',
        color: 'red'
      });
    }
  };

  const onCloseModal = () => {
    form.reset();
    context.closeModal(id);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap='md'>
        <TextInput
          withAsterisk
          key={form.key('name')}
          label='Название'
          placeholder='Success case'
          {...form.getInputProps('name')}
        />

        <Switch
          key={form.key('enabled')}
          label='Активировать пресет'
          description='При активации все остальные пресеты этого эндпоинта будут деактивированы'
          {...form.getInputProps('enabled', { type: 'checkbox' })}
        />

        <NumberInput
          withAsterisk
          key={form.key('statusCode')}
          label='HTTP статус код'
          max={599}
          min={100}
          placeholder='200'
          {...form.getInputProps('statusCode')}
        />

        <JsonInput
          withAsterisk
          key={form.key('responseData')}
          label='Данные ответа (JSON)'
          autosize
          formatOnBlur
          minRows={4}
          placeholder='{"success": true, "message": "Операция выполнена успешно"}'
          validationError='Неверный JSON'
          {...form.getInputProps('responseData')}
        />

        <TagsInput
          key={form.key('filterKeys')}
          {...form.getInputProps('filterKeys')}
          label='Query параметры запроса'
          description='Список query параметров если присутствуют'
        />

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
