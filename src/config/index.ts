import dotenv from "dotenv";

dotenv.config();

type DbConnection = {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    dbLogging: boolean;
}

const connection: DbConnection = {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'mydatabase',
    dbLogging: process.env.NODE_ENV === 'development',
}

export default connection