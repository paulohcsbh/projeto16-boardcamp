import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const {Pool} = pkg;

export const connectionDB = new Pool({
    user: "postgres",
    host: "localhost",
    port: 5432,
    database: "boardcamp",
    password: "123456"
});