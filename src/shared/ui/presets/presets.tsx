'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Radio,
  Stack,
  Text,
  Title,
  Tooltip
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconSquareRoundedPlus, IconTrash } from '@tabler/icons-react';
import { useEffect } from 'react';

import { usePresets } from './PresetsContext';

interface PresetsProps {
  mockEndpointId?: string | null;
}

export const Presets = ({ mockEndpointId }: PresetsProps = {}) => {
  const {
    draftPresets,
    loading,
    removeDraftPreset,
    removeDraftPresetById,
    setActivePresetInDraft,
    setMockEndpointId
  } = usePresets();

  useEffect(() => {
    if (mockEndpointId !== undefined) {
      setMockEndpointId(mockEndpointId);
    }
  }, [mockEndpointId, setMockEndpointId]);

  const openCreatePresetModal = () => {
    modals.openContextModal({
      modal: 'createPreset',
      title: 'Создать пресет',
      size: 'xl',
      innerProps: {
        mockEndpointId
      }
    });
  };

  const handleActiveChange = (presetId: string) => {
    setActivePresetInDraft(presetId);
  };

  const handleRemovePreset = (preset: (typeof draftPresets)[0], index: number) => {
    if (preset.id) {
      removeDraftPresetById(preset.id);
    } else {
      removeDraftPreset(index);
    }
  };

  const activePresetId = draftPresets.find((p) => p.enabled)?.id;

  return (
    <Stack gap='md'>
      <Group justify='space-between'>
        <Title order={4}>Пресеты</Title>
        <Button leftSection={<IconSquareRoundedPlus size={20} />} onClick={openCreatePresetModal}>
          Добавить пресет
        </Button>
      </Group>

      {loading && <Text c='dimmed'>Загрузка...</Text>}

      {draftPresets.length > 0 && (
        <Radio.Group
          name='activePreset'
          value={activePresetId || ''}
          description='Выберите активный пресет'
          onChange={handleActiveChange}
        >
          <Stack gap='sm' mt='xs'>
            {draftPresets.map((preset, index) => (
              <Card
                key={preset.id || `draft-${index}`}
                style={{
                  borderColor: preset.enabled ? 'var(--mantine-color-green-6)' : undefined,
                  backgroundColor: preset.enabled ? 'var(--mantine-color-green-light)' : undefined
                }}
                padding='md'
                radius='md'
                withBorder
              >
                <Group justify='space-between' wrap='nowrap'>
                  <Group gap='md' style={{ flex: 1 }} wrap='nowrap'>
                    {preset.id && (
                      <Radio label='' styles={{ radio: { cursor: 'pointer' } }} value={preset.id} />
                    )}
                    <div style={{ flex: 1 }}>
                      <Group gap='xs' mb='xs'>
                        <Title order={5}>{preset.name}</Title>
                        {preset.enabled && (
                          <Badge size='sm' color='green'>
                            Активен
                          </Badge>
                        )}
                        {!preset.id && (
                          <Badge size='sm' variant='light' color='blue'>
                            Новый
                          </Badge>
                        )}
                        <Badge size='sm' variant='outline'>
                          {preset.statusCode}
                        </Badge>
                      </Group>
                      {preset.filterKeys.length > 0 && (
                        <Badge mb='xs' size='sm' variant='light'>
                          Фильтры: {preset.filterKeys.join(', ')}
                        </Badge>
                      )}
                      <Text c='dimmed' lineClamp={2} size='sm'>
                        {JSON.stringify(preset.responseData).substring(0, 100)}
                        {JSON.stringify(preset.responseData).length > 100 && '...'}
                      </Text>
                    </div>
                  </Group>
                  <Tooltip label='Удалить пресет' withArrow>
                    <ActionIcon
                      size='lg'
                      variant='light'
                      color='red'
                      onClick={() => handleRemovePreset(preset, index)}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Card>
            ))}
          </Stack>
        </Radio.Group>
      )}

      {draftPresets.length === 0 && !loading && (
        <Card padding='md' radius='md' withBorder>
          <Group justify='center' p='xl'>
            <div style={{ textAlign: 'center' }}>
              <Text>Пресеты не найдены</Text>
              <Text c='dimmed' size='sm'>
                Нажмите &quot;Добавить пресет&quot; чтобы создать первый пресет
              </Text>
            </div>
          </Group>
        </Card>
      )}
    </Stack>
  );
};
