import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

import type { Prisma } from '../../../generated/prisma/client';

import { PrismaClient } from '../../../generated/prisma/client';

// eslint-disable-next-line node/prefer-global/process
const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

export type MockEndpointWithPresets = Prisma.MockEndpointGetPayload<{
  include: {
    presets: true;
  };
}>;

export type { Prisma };
export { prisma };
