import express from "express";
import cors from "cors";
import morgan from "morgan";

import { conectar } from "./config/database.js";
import ecommerceRoutes from "./routes/ecommerceRoutes.js";

const app = express();

app.use(morgan("dev"));
app.use(cors({ origin: "*" })); // luego lo restringimos
app.use(express.json());

app.get("/", (req, res) => res.send("API Ecommerce - Servidor Funcionando"));
app.use("/api", ecommerceRoutes);


async function startServer() {
  try {
    await conectar();
    const PORT = process.env.PORT || 3000; // ✅ Render
    app.listen(PORT, () => console.log("Servidor corriendo en el puerto", PORT));
  } catch (error) {
    console.error("Error al iniciar servidor:", error);
    process.exit(1);
  }
}

startServer();