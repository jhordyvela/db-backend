import express from "express";
import { createProducto, deleteProducto, getProducto, getProductos, updateProducto } from "../controllers/productosController.js";

const router = express.Router();

router.get("/productos", getProductos);
router.get("/productos/:id", getProducto);
router.post("/productos", createProducto);
router.put("/productos/:id", updateProducto);
router.delete("/productos/:id", deleteProducto);




export default router;
