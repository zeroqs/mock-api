import { prisma } from '@/shared/lib/prisma';

export async function GET() {
  const endpoints = await prisma.mockEndpoint.findMany({
    where: {
      presets: {
        some: {
          enabled: true
        }
      }
    },
    select: {
      method: true,
      path: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return Response.json(endpoints);
}
