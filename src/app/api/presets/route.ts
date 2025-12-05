import { prisma } from '@/shared/lib/prisma';

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

  const presets = await prisma.mockPreset.findMany({
    where: {
      mockEndpointId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return Response.json(presets);
}
