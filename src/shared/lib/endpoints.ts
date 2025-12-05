'use server';
import { refresh } from 'next/cache';

import type {
  CreateEndpointInput,
  HttpMethod,
  UpdateEndpointInput
} from '@/app/api/endpoints/schema';

import { createEndpointSchema, updateEndpointSchema, ZodError } from '@/app/api/endpoints/schema';
import { prisma } from '@/shared/lib/prisma';

export const getEndpoints = async (search?: string, methods?: HttpMethod[]) => {
  const where: {
    path?: { contains: string };
    method?: HttpMethod | { in: HttpMethod[] };
  } = {};

  if (search && search.trim()) {
    where.path = {
      contains: search.trim()
    };
  }

  if (methods && methods.length > 0) {
    where.method = methods.length === 1 ? methods[0] : { in: methods };
  }

  return prisma.mockEndpoint.findMany({
    where: Object.keys(where).length > 0 ? where : {},
    include: {
      presets: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const createEndpoint = async (data: CreateEndpointInput) => {
  try {
    const validatedData = createEndpointSchema.parse(data);

    const enabledPresets = validatedData.presets?.filter((p) => p.enabled) || [];
    if (enabledPresets.length > 1) {
      throw new Error('Только один пресет может быть активным');
    }

    const endpoint = await prisma.mockEndpoint.create({
      data: {
        method: validatedData.method,
        path: validatedData.path,
        description: validatedData.description,
        presets: {
          create:
            validatedData.presets?.map((preset) => ({
              name: preset.name,
              enabled: preset.enabled,
              statusCode: preset.statusCode,
              responseData: preset.responseData,
              filterKeys: preset.filterKeys
            })) || []
        }
      },
      include: {
        presets: true
      }
    });

    refresh();

    return endpoint;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error('Ошибка валидации', { cause: error.issues });
    }
    throw new Error('Ошибка');
  }
};

export const getEndpoint = async (id: string) => {
  return prisma.mockEndpoint.findUnique({
    where: { id },
    include: {
      presets: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });
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

    if (validatedData.presets) {
      const presetsToCreate = validatedData.presets.filter((p) => !('id' in p));
      const presetsToUpdate = validatedData.presets.filter((p) => 'id' in p && p.id);

      const currentPresets = await prisma.mockPreset.findMany({
        where: { mockEndpointId: id }
      });
      const currentPresetIds = currentPresets.map((p) => p.id);
      const updatedPresetIds = presetsToUpdate
        .map((p) => ('id' in p ? p.id : ''))
        .filter(Boolean) as string[];
      const presetsToDelete = currentPresetIds.filter((pid) => !updatedPresetIds.includes(pid));

      await prisma.$transaction(async (tx) => {
        if (presetsToDelete.length > 0) {
          await tx.mockPreset.deleteMany({
            where: { id: { in: presetsToDelete } }
          });
        }

        for (const preset of presetsToUpdate) {
          if ('id' in preset && preset.id) {
            await tx.mockPreset.update({
              where: { id: preset.id },
              data: {
                ...(preset.name !== undefined && { name: preset.name }),
                ...(preset.enabled !== undefined && { enabled: preset.enabled }),
                ...(preset.statusCode !== undefined && { statusCode: preset.statusCode }),
                ...(preset.responseData !== undefined && { responseData: preset.responseData }),
                ...(preset.filterKeys !== undefined && { filterKeys: preset.filterKeys })
              }
            });
          }
        }

        if (presetsToCreate.length > 0) {
          await tx.mockPreset.createMany({
            data: presetsToCreate.map((preset) => ({
              mockEndpointId: id,
              name: preset.name!,
              enabled: preset.enabled ?? false,
              statusCode: preset.statusCode ?? 200,
              responseData: preset.responseData ?? {},
              filterKeys: preset.filterKeys ?? []
            }))
          });
        }
      });
    }

    const endpoint = await prisma.mockEndpoint.update({
      where: { id },
      data: {
        ...(validatedData.method && { method: validatedData.method }),
        ...(validatedData.path && { path: validatedData.path }),
        ...(validatedData.description !== undefined && { description: validatedData.description })
      },
      include: {
        presets: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    refresh();

    return endpoint;
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
    await prisma.mockPreset.updateMany({
      where: { mockEndpointId: endpointId },
      data: { enabled: false }
    });
  }

  const newPreset = await prisma.mockPreset.create({
    data: {
      mockEndpointId: endpointId,
      name: preset.name,
      enabled: preset.enabled,
      statusCode: preset.statusCode,
      responseData: preset.responseData as object,
      filterKeys: preset.filterKeys
    }
  });

  refresh();

  return newPreset;
};

export const setActivePreset = async (endpointId: string, presetId: string) => {
  await prisma.mockPreset.updateMany({
    where: { mockEndpointId: endpointId },
    data: { enabled: false }
  });

  const activePreset = await prisma.mockPreset.update({
    where: { id: presetId },
    data: { enabled: true }
  });

  refresh();

  return activePreset;
};

export const deletePreset = async (presetId: string) => {
  const deletedPreset = await prisma.mockPreset.delete({
    where: { id: presetId }
  });

  refresh();

  return deletedPreset;
};

export const deleteEndpoints = async (id: string) => {
  const deletedEndpoint = await prisma.mockEndpoint.delete({
    where: {
      id
    }
  });

  refresh();

  return deletedEndpoint;
};
