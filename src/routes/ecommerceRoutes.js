import express from "express";
import multer from "multer";
import {getCategoria, getCategorias, updateCategoria, listarCategoriasConTotales } from "../controllers/categoriasController.js";
import { getProductos, listarProductos, getProducto, createProducto, updateProducto, deleteProducto } from "../controllers/productosController.js";
import { registerCliente, loginCliente } from "../controllers/clientesController.js";
import { register, login } from "../controllers/auth/authController.js";
import { authMiddleware, requireAdmin } from "../controllers/auth/authMiddleware.js";
import { createPedido, listarPedidos } from "../controllers/pedidosController.js";


const router = express.Router();

// Usar memoryStorage para subir a GCS desde buffer
const upload = multer({ storage: multer.memoryStorage() });     

router.get("/productos", getProductos);
router.get("/productos/listar", listarProductos);
router.get("/productos/:id", getProducto);
// Accept any file field name to avoid MulterError: Unexpected field
// Rutas de productos: proteger creación/edición/borrado para administradores
router.post("/productos", authMiddleware, requireAdmin, upload.any(), createProducto);
router.put("/productos/:id", authMiddleware, requireAdmin, upload.any(), updateProducto);
router.delete("/productos/:id", authMiddleware, requireAdmin, deleteProducto);




router.get("/categorias", getCategorias);
router.get("/categorias/totales", listarCategoriasConTotales);
router.get("/categorias/:id", getCategoria);

// Clientes: registro y login (ruta legacy que usa controller específico)
router.post("/clientes/register", express.json(), registerCliente);
router.post("/clientes/login", express.json(), loginCliente);

// Auth: nuevas rutas centralizadas
router.post('/auth/register', express.json(), register);
router.post('/auth/login', express.json(), login);

// Pedidos (protegidos)
router.post('/pedidos', authMiddleware, express.json(), createPedido);
router.get('/pedidos', authMiddleware, listarPedidos);



export default router;
