import type { JsonValue } from '@prisma/client/runtime/client';

import type { HttpMethod } from '@/app/api/endpoints/schema';

import { prisma } from '@/shared/lib/prisma';

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

  const endpoint = await prisma.mockEndpoint.findUnique({
    where: {
      method_path: {
        method: method as HttpMethod,
        path
      }
    },
    include: {
      presets: {
        where: {
          enabled: true
        },
        take: 1
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

  if (!endpoint.presets || endpoint.presets.length === 0) {
    return Response.json(
      {
        error: 'No active preset',
        message: 'Активный пресет не найден для этого эндпоинта'
      },
      { status: 500 }
    );
  }

  const activePreset = endpoint.presets[0];
  const statusCode = activePreset.statusCode;
  let responseData = activePreset.responseData;

  const filterKeys = (activePreset.filterKeys as string[] | null) ?? [];

  if (filterKeys.length > 0 && Object.keys(queryParams).length > 0) {
    responseData = filterResponseData(responseData, filterKeys, queryParams) as JsonValue;
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
