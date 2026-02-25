import pool from "../config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_prod";

export async function registerCliente(req, res) {
  try {
    const { nombres, email, telefono, password } = req.body;
    if (!nombres || !email || !password) return res.status(400).json({ error: "Faltan datos" });

    const exists = await pool.query("SELECT id FROM clientes WHERE email=$1", [email]);
    if (exists.rowCount) return res.status(409).json({ error: "Email ya registrado" });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO clientes (nombres, email, telefono, password_hash)
       VALUES ($1,$2,$3,$4) RETURNING id, nombres, email, telefono, creado_en`,
      [nombres, email, telefono || null, hash]
    );

    return res.status(201).json({ cliente: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
}

export async function loginCliente(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Faltan datos" });

    const result = await pool.query("SELECT id, nombres, email, telefono, password_hash FROM clientes WHERE email=$1", [email]);
    if (!result.rowCount) return res.status(401).json({ error: "Credenciales inválidas" });

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ token, cliente: { id: user.id, nombres: user.nombres, email: user.email, telefono: user.telefono } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
}

export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "No autorizado" });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.cliente = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}
