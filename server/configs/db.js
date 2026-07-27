import { neon } from '@neondatabase/serverless';

let sqlClient;

const getSqlClient = () => {
    const databaseUrl = process.env.DATABASE_URL?.trim();

    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not configured");
    }

    if (!sqlClient) {
        sqlClient = neon(databaseUrl);
    }

    return sqlClient;
};

const sql = (strings, ...values) => getSqlClient()(strings, ...values);

export default sql;
