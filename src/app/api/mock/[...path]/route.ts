import { eq, and } from 'drizzle-orm';

import type { HttpMethod } from '@/app/api/endpoints/schema';

import { db } from '@/drizzle/db';
import { mockEndpoint, mockPreset } from '@/drizzle/migrations/schema';

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, await params, 'GET');
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, await params, 'POST');
}

export async function PUT(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, await params, 'PUT');
}

export async function PATCH(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, await params, 'PATCH');
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params, 'DELETE');
}

export async function HEAD(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, await params, 'HEAD');
}

export async function OPTIONS(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params, 'OPTIONS');
}

async function handleRequest(
  request: Request,
  params: { path: string[] },
  method: string
): Promise<Response> {
  const path = `/${params.path.join('/')}`;
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams.entries());

  const endpoint = await db.query.mockEndpoint.findFirst({
    where: and(eq(mockEndpoint.method, method as HttpMethod), eq(mockEndpoint.path, path)),
    with: {
      mockPresets: {
        where: eq(mockPreset.enabled, '1'),
        limit: 1
      }
    }
  });

  if (!endpoint) {
    return Response.json(
      {
        error: 'Endpoint not found',
        message: `Эндпоинт ${method} ${path} не найден`
      },
      { status: 404 }
    );
  }

  if (!endpoint.mockPresets || endpoint.mockPresets.length === 0) {
    return Response.json(
      {
        error: 'No active preset',
        message: 'Активный пресет не найден для этого эндпоинта'
      },
      { status: 500 }
    );
  }

  const activePreset = endpoint.mockPresets[0];
  const statusCode = activePreset.statusCode;

  let responseData: unknown =
    typeof activePreset.responseData === 'string'
      ? JSON.parse(activePreset.responseData)
      : activePreset.responseData;

  const filterKeys: string[] =
    typeof activePreset.filterKeys === 'string'
      ? JSON.parse(activePreset.filterKeys)
      : activePreset.filterKeys
        ? JSON.parse(String(activePreset.filterKeys))
        : [];

  if (filterKeys.length > 0 && Object.keys(queryParams).length > 0) {
    responseData = filterResponseData(responseData, filterKeys, queryParams);
  }

  return Response.json(responseData, { status: statusCode });
}

function filterResponseData(
  data: unknown,
  filterKeys: string[],
  queryParams: Record<string, string>
): unknown {
  const activeFilters = filterKeys.filter((key) => key in queryParams);

  if (activeFilters.length === 0) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.filter((item) => {
      if (typeof item !== 'object' || item === null) {
        return true;
      }
      return activeFilters.every((key) => {
        const itemValue = (item as Record<string, unknown>)[key];
        const queryValue = queryParams[key];

        const queryValues = queryValue.split(',').map((v) => v.trim());
        return queryValues.includes(String(itemValue));
      });
    });
  }

  if (typeof data === 'object' && data !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        result[key] = filterResponseData(value, filterKeys, queryParams);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  return data;
}
