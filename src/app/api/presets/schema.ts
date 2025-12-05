import { z } from 'zod/v4';

export const createPresetSchema = z.object({
  name: z.string().min(1, { message: 'Название не может быть пустым' }),
  enabled: z.boolean().default(false),
  statusCode: z
    .number()
    .int()
    .min(100, { message: 'Статус код должен быть от 100 до 599' })
    .max(599, { message: 'Статус код должен быть от 100 до 599' })
    .default(200),
  responseData: z.any(),
  filterKeys: z.array(z.string()).default([]).optional()
});

export const updatePresetSchema = createPresetSchema.partial().extend({
  id: z.string().min(1, { message: 'ID пресета обязателен' })
});

export type CreatePresetInput = z.infer<typeof createPresetSchema>;
export type UpdatePresetInput = z.infer<typeof updatePresetSchema>;
export const ZodError = z.ZodError;
