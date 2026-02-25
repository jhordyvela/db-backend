import jwt from "jsonwebtoken";
import { ROLE_ADMIN } from "../../config/roles.js";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_prod";

export function authMiddleware(req, res, next) {
  const h = req.headers.authorization || req.headers.Authorization || '';
  const parts = h.split(' ');
  const type = parts[0];
  const token = parts[1];

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.cliente = payload; // { id, email, role }
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.cliente) return res.status(401).json({ error: 'No autorizado' });
  const role = req.cliente.role || req.cliente.rol;
  if (!role) return res.status(403).json({ error: 'Solo admin' });
  if (role !== ROLE_ADMIN && role !== 'admin') {
    return res.status(403).json({ error: 'Solo admin' });
  }
  return next();
}
