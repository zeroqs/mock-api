import { eq, desc } from 'drizzle-orm';

import { db } from '@/drizzle/db';
import { mockPreset } from '@/drizzle/migrations/schema';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mockEndpointId = searchParams.get('mockEndpointId');

  if (!mockEndpointId) {
    return Response.json(
      {
        error: 'mockEndpointId is required'
      },
      { status: 400 }
    );
  }

  const presets = await db
    .select()
    .from(mockPreset)
    .where(eq(mockPreset.mockEndpointId, mockEndpointId))
    .orderBy(desc(mockPreset.createdAt));

  // Преобразуем данные для клиента
  const transformedPresets = presets.map((preset) => ({
    ...preset,
    enabled: Number(preset.enabled) === 1,
    responseData:
      typeof preset.responseData === 'string'
        ? JSON.parse(preset.responseData)
        : preset.responseData,
    filterKeys:
      typeof preset.filterKeys === 'string'
        ? JSON.parse(preset.filterKeys)
        : preset.filterKeys
          ? JSON.parse(String(preset.filterKeys))
          : [],
    createdAt: new Date(Number(preset.createdAt)),
    updatedAt: new Date(Number(preset.updatedAt))
  }));

  return Response.json(transformedPresets);
}
