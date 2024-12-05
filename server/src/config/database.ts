import { Pool } from 'pg';
import fs from 'fs';

const getSecret = (secretName: string): string => {
    try {
        return fs.readFileSync(`/run/secrets/${secretName}`, 'utf8').trim();
    } catch (error) {
        console.error(`Error leyendo el secret ${secretName}:`, error);
        throw error;
    }
};

export const pool = new Pool({
    user: getSecret('db_user'),
    password: getSecret('db_password'),
    database: getSecret('db_name'),
    host: 'db', // nombre del servicio en docker-compose
    port: 5432,
});

export default pool;