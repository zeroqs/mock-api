'use server';
import { and, desc, eq, inArray, like } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import type {
  CreateEndpointInput,
  HttpMethod,
  UpdateEndpointInput
} from '@/app/api/endpoints/schema';

import { createEndpointSchema, updateEndpointSchema, ZodError } from '@/app/api/endpoints/schema';
import { db } from '@/drizzle/db';
import { mockEndpoint, mockPreset } from '@/drizzle/migrations/schema';

// Вспомогательная функция для преобразования preset
const transformPreset = (preset: typeof mockPreset.$inferSelect) => ({
  ...preset,
  enabled: Number(preset.enabled) === 1,
  responseData:
    typeof preset.responseData === 'string' ? JSON.parse(preset.responseData) : preset.responseData,
  filterKeys:
    typeof preset.filterKeys === 'string'
      ? JSON.parse(preset.filterKeys)
      : preset.filterKeys
        ? JSON.parse(String(preset.filterKeys))
        : [],
  createdAt: new Date(Number(preset.createdAt)),
  updatedAt: new Date(Number(preset.updatedAt))
});

// Вспомогательная функция для преобразования endpoint
const transformEndpoint = (endpoint: typeof mockEndpoint.$inferSelect) => ({
  ...endpoint,
  createdAt: new Date(Number(endpoint.createdAt)),
  updatedAt: new Date(Number(endpoint.updatedAt))
});

export type MockEndpointWithPresets = ReturnType<typeof transformEndpoint> & {
  presets: ReturnType<typeof transformPreset>[];
};

export const getEndpoints = async (search?: string, methods?: HttpMethod[]) => {
  const conditions = [];

  if (search && search.trim()) {
    conditions.push(like(mockEndpoint.path, `%${search.trim()}%`));
  }

  if (methods && methods.length > 0) {
    if (methods.length === 1) {
      conditions.push(eq(mockEndpoint.method, methods[0]));
    } else {
      conditions.push(inArray(mockEndpoint.method, methods));
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const endpoints = await db.query.mockEndpoint.findMany({
    where: whereClause,
    with: {
      mockPresets: {
        orderBy: [desc(mockPreset.createdAt)]
      }
    },
    orderBy: [desc(mockEndpoint.createdAt)]
  });

  return endpoints.map((endpoint) => ({
    ...transformEndpoint(endpoint),
    presets: endpoint.mockPresets.map(transformPreset)
  }));
};

export const createEndpoint = async (data: CreateEndpointInput) => {
  try {
    const validatedData = createEndpointSchema.parse(data);

    const enabledPresets = validatedData.presets?.filter((p) => p.enabled) || [];
    if (enabledPresets.length > 1) {
      throw new Error('Только один пресет может быть активным');
    }

    const endpointId = crypto.randomUUID();
    const now = String(Date.now());

    // Создаем endpoint
    const [endpoint] = await db
      .insert(mockEndpoint)
      .values({
        id: endpointId,
        method: validatedData.method,
        path: validatedData.path,
        description: validatedData.description || null,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    // Создаем presets если они есть
    let presets: (typeof mockPreset.$inferSelect)[] = [];
    if (validatedData.presets && validatedData.presets.length > 0) {
      const presetValues = validatedData.presets.map((preset) => ({
        id: crypto.randomUUID(),
        mockEndpointId: endpointId,
        name: preset.name,
        enabled: String(preset.enabled ? 1 : 0),
        statusCode: preset.statusCode ?? 200,
        responseData: JSON.stringify(preset.responseData),
        filterKeys: JSON.stringify(preset.filterKeys || []),
        createdAt: now,
        updatedAt: now
      }));

      presets = await db.insert(mockPreset).values(presetValues).returning();
    }

    revalidatePath('/');

    return {
      ...transformEndpoint(endpoint),
      presets: presets.map(transformPreset)
    };
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error('Ошибка валидации', { cause: error.issues });
    }
    throw new Error('Ошибка');
  }
};

export const getEndpoint = async (id: string) => {
  const endpoint = await db.query.mockEndpoint.findFirst({
    where: eq(mockEndpoint.id, id),
    with: {
      mockPresets: {
        orderBy: [desc(mockPreset.createdAt)]
      }
    }
  });

  if (!endpoint) {
    return null;
  }

  return {
    ...transformEndpoint(endpoint),
    presets: endpoint.mockPresets.map(transformPreset)
  };
};

export const updateEndpoint = async (id: string, data: UpdateEndpointInput) => {
  try {
    const validatedData = updateEndpointSchema.parse(data);

    if (validatedData.presets) {
      const enabledPresets = validatedData.presets.filter((p) => p.enabled);
      if (enabledPresets.length > 1) {
        throw new Error('Только один пресет может быть активным');
      }
    }

    const now = String(Date.now());

    // Обновляем endpoint если есть изменения
    const updateData: Partial<typeof mockEndpoint.$inferInsert> = {
      updatedAt: now
    };
    if (validatedData.method) updateData.method = validatedData.method;
    if (validatedData.path) updateData.path = validatedData.path;
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description || null;
    }

    await db.update(mockEndpoint).set(updateData).where(eq(mockEndpoint.id, id));

    // Обрабатываем presets
    if (validatedData.presets) {
      const presetsToCreate = validatedData.presets.filter((p) => !('id' in p));
      const presetsToUpdate = validatedData.presets.filter((p) => 'id' in p && p.id);

      const currentPresets = await db
        .select()
        .from(mockPreset)
        .where(eq(mockPreset.mockEndpointId, id));

      const currentPresetIds = currentPresets.map((p) => p.id);
      const updatedPresetIds = presetsToUpdate
        .map((p) => ('id' in p ? p.id : ''))
        .filter(Boolean) as string[];
      const presetsToDelete = currentPresetIds.filter((pid) => !updatedPresetIds.includes(pid));

      // Удаляем presets
      if (presetsToDelete.length > 0) {
        await db.delete(mockPreset).where(inArray(mockPreset.id, presetsToDelete));
      }

      // Обновляем presets
      for (const preset of presetsToUpdate) {
        if ('id' in preset && preset.id) {
          const updatePresetData: Partial<typeof mockPreset.$inferInsert> = {
            updatedAt: now
          };
          if (preset.name !== undefined) updatePresetData.name = preset.name;
          if (preset.enabled !== undefined)
            updatePresetData.enabled = String(preset.enabled ? 1 : 0);
          if (preset.statusCode !== undefined) updatePresetData.statusCode = preset.statusCode;
          if (preset.responseData !== undefined) {
            updatePresetData.responseData = JSON.stringify(preset.responseData);
          }
          if (preset.filterKeys !== undefined) {
            updatePresetData.filterKeys = JSON.stringify(preset.filterKeys);
          }

          await db.update(mockPreset).set(updatePresetData).where(eq(mockPreset.id, preset.id));
        }
      }

      // Создаем новые presets
      if (presetsToCreate.length > 0) {
        const presetValues = presetsToCreate.map((preset) => ({
          id: crypto.randomUUID(),
          mockEndpointId: id,
          name: preset.name!,
          enabled: String((preset.enabled ?? false) ? 1 : 0),
          statusCode: preset.statusCode ?? 200,
          responseData: JSON.stringify(preset.responseData ?? {}),
          filterKeys: JSON.stringify(preset.filterKeys ?? []),
          createdAt: now,
          updatedAt: now
        }));

        await db.insert(mockPreset).values(presetValues);
      }
    }

    // Получаем обновленный endpoint с presets
    const endpoint = await db.query.mockEndpoint.findFirst({
      where: eq(mockEndpoint.id, id),
      with: {
        mockPresets: {
          orderBy: [desc(mockPreset.createdAt)]
        }
      }
    });

    if (!endpoint) {
      throw new Error('Endpoint не найден');
    }

    revalidatePath('/');

    return {
      ...transformEndpoint(endpoint),
      presets: endpoint.mockPresets.map(transformPreset)
    };
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error('Ошибка валидации', { cause: error.issues });
    }
    throw error;
  }
};

export const addPresetToEndpoint = async (
  endpointId: string,
  preset: {
    name: string;
    enabled: boolean;
    statusCode: number;
    responseData: unknown;
    filterKeys: string[];
  }
) => {
  if (preset.enabled) {
    await db
      .update(mockPreset)
      .set({ enabled: '0', updatedAt: String(Date.now()) })
      .where(eq(mockPreset.mockEndpointId, endpointId));
  }

  const now = String(Date.now());
  const [newPreset] = await db
    .insert(mockPreset)
    .values({
      id: crypto.randomUUID(),
      mockEndpointId: endpointId,
      name: preset.name,
      enabled: String(preset.enabled ? 1 : 0),
      statusCode: preset.statusCode,
      responseData: JSON.stringify(preset.responseData),
      filterKeys: JSON.stringify(preset.filterKeys),
      createdAt: now,
      updatedAt: now
    })
    .returning();

  revalidatePath('/');

  return transformPreset(newPreset);
};

export const setActivePreset = async (endpointId: string, presetId: string) => {
  const now = String(Date.now());

  // Отключаем все presets для этого endpoint
  await db
    .update(mockPreset)
    .set({ enabled: '0', updatedAt: now })
    .where(eq(mockPreset.mockEndpointId, endpointId));

  // Активируем выбранный preset
  const [activePreset] = await db
    .update(mockPreset)
    .set({ enabled: '1', updatedAt: now })
    .where(eq(mockPreset.id, presetId))
    .returning();

  revalidatePath('/');

  return transformPreset(activePreset);
};

export const deletePreset = async (presetId: string) => {
  const [deletedPreset] = await db
    .delete(mockPreset)
    .where(eq(mockPreset.id, presetId))
    .returning();

  if (!deletedPreset) {
    throw new Error('Preset не найден');
  }

  revalidatePath('/');

  return transformPreset(deletedPreset);
};

export const deleteEndpoints = async (id: string) => {
  const [deletedEndpoint] = await db
    .delete(mockEndpoint)
    .where(eq(mockEndpoint.id, id))
    .returning();

  if (!deletedEndpoint) {
    throw new Error('Endpoint не найден');
  }

  revalidatePath('/');

  return transformEndpoint(deletedEndpoint);
};
