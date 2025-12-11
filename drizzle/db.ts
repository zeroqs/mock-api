import '../envConfig.ts';

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import * as relations from './migrations/relations';
import * as schema from './migrations/schema';

// eslint-disable-next-line node/prefer-global/process
const client = createClient({ url: process.env.DATABASE_URL! });

export const db = drizzle({ client, schema: { ...schema, ...relations } });
