import pool from "../config/database.js";


export const getProductos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

export const getProducto = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos WHERE id = $1', [req.params.id]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
};

export async function createProducto(req, res) {
    try {
        const result = await pool.query('INSERT INTO productos (nombre, descripcion, precio, imagen_url) VALUES ($1, $2, $3, $4) RETURNING *', [req.body.nombre, req.body.descripcion, req.body.precio, req.body.imagen_url]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al crear el producto', error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
}

export const updateProducto = async (req, res) => {
    try {
        const result = await pool.query('UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, imagen_url = $4 WHERE id = $5 RETURNING *', [req.body.nombre, req.body.descripcion, req.body.precio, req.body.imagen_url, req.params.id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al actualizar el producto', error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
};

export const deleteProducto = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM productos WHERE id = $1', [req.params.id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al eliminar el producto', error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
};


