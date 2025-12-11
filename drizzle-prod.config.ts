import './envConfig.ts';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle/migrations',
  schema: './drizzle/migrations/schema.ts',
  dialect: 'sqlite',

  dbCredentials: {
    url: 'file:./prod.db'
  }
});
