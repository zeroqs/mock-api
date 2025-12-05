import { z } from 'zod/v4';

import { createPresetSchema, updatePresetSchema } from '@/app/api/presets/schema';

export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;

export type HttpMethod = (typeof METHODS)[number];

export const createEndpointSchema = z.object({
  method: z.enum(METHODS, {
    message: 'Выберите метод запроса'
  }),
  path: z
    .string()
    .min(1, { message: 'Путь не может быть пустым' })
    .refine((val) => val.startsWith('/'), {
      message: 'Путь должен начинаться с /'
    }),
  description: z.string().optional(),
  presets: z.array(createPresetSchema).optional().default([])
});

export const updateEndpointSchema = z.object({
  method: z.enum(METHODS, { message: 'Выберите метод запроса' }).optional(),
  path: z
    .string()
    .min(1, { message: 'Путь не может быть пустым' })
    .refine((val) => val.startsWith('/'), {
      message: 'Путь должен начинаться с /'
    })
    .optional(),
  description: z.string().optional(),
  presets: z.array(z.union([createPresetSchema, updatePresetSchema])).optional()
});

export type CreateEndpointInput = z.infer<typeof createEndpointSchema>;
export type UpdateEndpointInput = z.infer<typeof updateEndpointSchema>;
export const ZodError = z.ZodError;
