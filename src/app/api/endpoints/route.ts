import { asc, eq } from 'drizzle-orm';

import { db } from '@/drizzle/db';
import { mockEndpoint, mockPreset } from '@/drizzle/migrations/schema';

export async function GET() {
  const endpoints = await db.query.mockEndpoint.findMany({
    columns: {
      method: true,
      path: true
    },
    orderBy: [asc(mockEndpoint.createdAt)],
    with: {
      mockPresets: {
        where: eq(mockPreset.enabled, '1')
      }
    }
  });

  const activeEndpoints = endpoints
    .filter((endpoint) => endpoint.mockPresets.length > 0)
    .map((endpoint) => ({
      method: endpoint.method,
      path: endpoint.path
    }));

  return Response.json(activeEndpoints);
}
