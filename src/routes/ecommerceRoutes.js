import express from "express";
import multer from "multer";
import { createProducto, deleteProducto, getProducto, getProductos, updateProducto } from "../controllers/productosController.js";

const router = express.Router();

// Usar memoryStorage para subir a GCS desde buffer
const upload = multer({ storage: multer.memoryStorage() });

router.get("/productos", getProductos);
router.get("/productos/:id", getProducto);
router.post("/productos", upload.single('imagen'), createProducto);
router.put("/productos/:id", upload.single('imagen'), updateProducto);
router.delete("/productos/:id", deleteProducto);




export default router;
