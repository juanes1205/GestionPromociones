import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes";
import promotionRoutes from "./routes/promotionRoutes";
import categoryRoutes from "./routes/categoryRoutes";

const app = express();

// Midlewares globales
app.use(cors());
app.use(express.json());

// Montar endpoints
app.use(healthRoutes); // Expone /health directamente en el root
app.use("/api/promotions", promotionRoutes);
app.use("/api/categories", categoryRoutes);

// Manejador global de errores
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  if (err instanceof Error) {
    return res.status(500).json({
      error: err.message || "Internal Server Error",
    });
  }

  return res.status(500).json({
    error: "Internal Server Error",
  });
});

export default app;
