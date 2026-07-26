import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL?.trim());

export default sql;