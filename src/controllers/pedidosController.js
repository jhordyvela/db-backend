import pool from "../config/database.js";
import { authMiddleware } from "./clientesController.js";

// Crear pedido: espera { items: [{ producto_id, cantidad }, ...] }
export async function createPedido(req, res) {
  const clienteId = req.cliente && req.cliente.id;
  if (!clienteId) return res.status(401).json({ error: 'No autorizado' });

  const items = req.body && Array.isArray(req.body.items) ? req.body.items : null;
  if (!items || items.length === 0) return res.status(400).json({ error: 'Items vacíos' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert pedido provisional con total 0
    const pedidoRes = await client.query(
      'INSERT INTO pedidos (cliente_id, estado, total) VALUES ($1, $2, $3) RETURNING *',
      [clienteId, 'PENDIENTE', 0]
    );
    const pedido = pedidoRes.rows[0];

    let total = 0;

    // Procesar cada item: lock producto, comprobar stock, restar stock, insertar item
    for (const it of items) {
      const pid = Number(it.producto_id);
      const qty = Number(it.cantidad);
      if (!pid || Number.isNaN(qty) || qty <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Item inválido' });
      }

      const prodRes = await client.query('SELECT id, precio, stock FROM productos WHERE id=$1 FOR UPDATE', [pid]);
      if (prodRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `Producto ${pid} no encontrado` });
      }
      const prod = prodRes.rows[0];
      const stock = Number(prod.stock || 0);
      if (stock < qty) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: `Stock insuficiente para producto ${pid}` });
      }

      const precio = Number(prod.precio || 0);
      const subtotal = Number((precio * qty).toFixed(2));
      total += subtotal;

      // Insertar item
      await client.query(
        'INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio) VALUES ($1,$2,$3,$4)',
        [pedido.id, pid, qty, precio]
      );

      // Actualizar stock
      await client.query('UPDATE productos SET stock = stock - $1 WHERE id = $2', [qty, pid]);
    }

    // Actualizar total del pedido
    await client.query('UPDATE pedidos SET total = $1 WHERE id = $2', [total, pedido.id]);

    await client.query('COMMIT');

    // Devolver pedido completo
    const pedidoFull = await pool.query('SELECT * FROM pedidos WHERE id=$1', [pedido.id]);
    const itemsRes = await pool.query('SELECT pi.*, p.nombre FROM pedido_items pi LEFT JOIN productos p ON p.id = pi.producto_id WHERE pi.pedido_id=$1', [pedido.id]);

    return res.status(201).json({ pedido: pedidoFull.rows[0], items: itemsRes.rows });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('createPedido error:', err);
    return res.status(500).json({ error: 'Error creando pedido' });
  } finally {
    client.release();
  }
}

// Listar pedidos del cliente autenticado
export async function listarPedidos(req, res) {
  const clienteId = req.cliente && req.cliente.id;
  if (!clienteId) return res.status(401).json({ error: 'No autorizado' });

  try {
    const pedidosRes = await pool.query('SELECT * FROM pedidos WHERE cliente_id=$1 ORDER BY creado_en DESC', [clienteId]);
    const pedidos = [];
    for (const p of pedidosRes.rows) {
      const itemsRes = await pool.query('SELECT pi.*, pr.nombre FROM pedido_items pi LEFT JOIN productos pr ON pr.id = pi.producto_id WHERE pi.pedido_id=$1', [p.id]);
      pedidos.push({ pedido: p, items: itemsRes.rows });
    }
    return res.json(pedidos);
  } catch (err) {
    console.error('listarPedidos error:', err);
    return res.status(500).json({ error: 'Error listando pedidos' });
  }
}

// Exportar el middleware (reimportado desde clientesController si se prefiere)
export const requireAuth = authMiddleware;
