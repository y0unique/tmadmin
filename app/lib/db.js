import { neon } from '@neondatabase/serverless';

// Create a SQL query function connected to your Neon database
// The DATABASE_URL environment variable should be set in your Vercel project settings
// and in your local .env.local file
const sql = neon(process.env.DATABASE_URL);

export default sql;
