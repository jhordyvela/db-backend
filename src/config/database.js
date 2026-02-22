import pg from "pg";
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      ssl: { rejectUnauthorized: false },
    });

export async function conectar() {
  try {
    // Mejor que pool.connect() sin liberar: probamos con query
    await pool.query("SELECT 1");
    console.log("✅ Conexión exitosa a la base de datos");
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error);
    throw error;
  }
}

export default pool;